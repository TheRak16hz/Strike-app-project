const db = require('../db');
const https = require('https');
const http = require('http');

// --- Helper: Fetch JSON from URL (GET) ---
function fetchJSON(url) {
  const lib = url.startsWith('https') ? https : http;
  return new Promise((resolve, reject) => {
    lib.get(url, {
      headers: {
        'User-Agent': 'Strike-App/1.0 (personal finance app)',
        'Accept': 'application/json',
      },
      timeout: 8000,
    }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('JSON parse error')); }
      });
    }).on('error', reject).on('timeout', () => reject(new Error('Timeout')));
  });
}

// --- Helper: POST JSON (for Binance P2P) ---
function postJSON(url, body) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const parsed = new URL(url);
    const options = {
      hostname: parsed.hostname,
      port: parsed.port || 443,
      path: parsed.pathname + parsed.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': '*/*',
      },
      timeout: 10000,
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('JSON parse error')); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
    req.write(payload);
    req.end();
  });
}

// --- Helper: Fetch Binance P2P average (top 10 buy USDT/VES) ---
async function fetchBinanceP2PRate() {
  const body = {
    fiat: 'VES',
    page: 1,
    rows: 10,
    tradeType: 'BUY',
    asset: 'USDT',
    countries: [],
    proMerchantAds: false,
    shieldMerchantAds: false,
    publisherType: null,
    payTypes: [],
  };
  const result = await postJSON('https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search', body);
  if (!result?.data || !Array.isArray(result.data) || result.data.length === 0) {
    throw new Error('No data from Binance P2P');
  }
  const prices = result.data.map(ad => parseFloat(ad.adv?.price)).filter(p => !isNaN(p) && p > 0);
  if (prices.length === 0) throw new Error('No valid prices from Binance P2P');
  const avg = prices.reduce((s, p) => s + p, 0) / prices.length;
  return parseFloat(avg.toFixed(2));
}

// --- Fetch global app metadata ---
exports.getMetadata = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM app_metadata');
    const metadata = {};
    for (const row of result.rows) {
      metadata[row.id] = row.data;
    }
    res.json(metadata);
  } catch (err) {
    console.error('Error al obtener metadatos:', err.message);
    res.status(500).json({ error: 'Error al obtener metadatos', detail: err.message });
  }
};

// --- Fetch live rates from dolarapi.com (free, no ban risk) ---
exports.fetchLiveRates = async (req, res) => {
  try {
    const settingsResult = await db.query('SELECT settings FROM user_settings WHERE user_id = $1', [req.user.id]);
    const currentSettings = settingsResult.rows[0]?.settings || {};
    const defaultRates = { usd_bs: 648, usd_bs_bcv: 474, usd_cop: 4200, bs_cop: 5, eur_bs_bcv: 570 };
    const currentRates = currentSettings.exchange_rates || defaultRates;

    // Check cache: only fetch if last_live_fetch was > 24h ago (user-triggered button)
    const lastFetch = currentRates.last_live_fetch ? new Date(currentRates.last_live_fetch) : null;
    const hoursSinceLastFetch = lastFetch ? (Date.now() - lastFetch.getTime()) / (1000 * 60 * 60) : 999;

    // Allow forced refresh if at least 1 hour has passed (anti-abuse)
    if (hoursSinceLastFetch < 1) {
      return res.json({
        success: false,
        message: 'Espera al menos 1 hora entre actualizaciones automáticas.',
        rates: currentRates,
      });
    }

    const [bcvData, paraleloData, euroBcvData, binanceP2P] = await Promise.allSettled([
      fetchJSON('https://ve.dolarapi.com/v1/dolares/oficial'),
      fetchJSON('https://ve.dolarapi.com/v1/dolares/paralelo'),
      fetchJSON('https://ve.dolarapi.com/v1/euros/oficial'),
      fetchBinanceP2PRate(),
    ]);

    const newRates = { ...currentRates };
    const updates = {};

    if (bcvData.status === 'fulfilled' && bcvData.value?.promedio) {
      newRates.usd_bs_bcv = parseFloat(bcvData.value.promedio.toFixed(2));
      updates.bcv = { value: newRates.usd_bs_bcv, date: bcvData.value.fechaActualizacion };
    }

    // Paralelo: prefer Binance P2P average, fallback to dolarapi
    if (binanceP2P.status === 'fulfilled' && binanceP2P.value > 0) {
      newRates.usd_bs = binanceP2P.value;
      updates.paralelo = { value: newRates.usd_bs, source: 'Binance P2P (top 10 avg)' };
    } else if (paraleloData.status === 'fulfilled' && paraleloData.value?.promedio) {
      newRates.usd_bs = parseFloat(paraleloData.value.promedio.toFixed(2));
      updates.paralelo = { value: newRates.usd_bs, source: 'DolarApi (fallback)', date: paraleloData.value.fechaActualizacion };
    }

    if (euroBcvData.status === 'fulfilled' && euroBcvData.value?.promedio) {
      newRates.eur_bs_bcv = parseFloat(euroBcvData.value.promedio.toFixed(2));
      updates.eur_bcv = { value: newRates.eur_bs_bcv, date: euroBcvData.value.fechaActualizacion };
    }

    newRates.last_live_fetch = new Date().toISOString();

    // Persist updated rates into user settings
    const updatedSettings = { ...currentSettings, exchange_rates: newRates };
    await db.query(
      'INSERT INTO user_settings (user_id, settings, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (user_id) DO UPDATE SET settings = $2, updated_at = NOW()',
      [req.user.id, JSON.stringify(updatedSettings)]
    );

    res.json({ success: true, rates: newRates, updates });
  } catch (err) {
    console.error('fetchLiveRates error:', err.message);
    res.status(500).json({ error: 'Error al obtener tasas en vivo', detail: err.message });
  }
};

exports.getFinanceData = async (req, res) => {
  try {
    const goalsResult = await db.query('SELECT * FROM savings_goals WHERE user_id = $1 ORDER BY position ASC, created_at DESC', [req.user.id]);
    const transactionsResult = await db.query('SELECT * FROM transactions WHERE user_id = $1 ORDER BY date DESC, created_at DESC LIMIT 200', [req.user.id]);
    const settingsResult = await db.query('SELECT settings FROM user_settings WHERE user_id = $1', [req.user.id]);
    
    let finalSettings = settingsResult.rows[0]?.settings;
    if (finalSettings && finalSettings.settings && !finalSettings.exchange_rates) {
      finalSettings = finalSettings.settings;
    }
    
    res.json({
      goals: goalsResult.rows,
      transactions: transactionsResult.rows,
      settings: finalSettings || { 
        exchange_rates: { usd_bs: 648, usd_bs_bcv: 474, usd_cop: 4200, bs_cop: 5, eur_bs_bcv: 570 },
        budgets: {} 
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error al obtener datos financieros' });
  }
};

exports.createGoal = async (req, res) => {
  try {
    const { title, target_amount, deadline, color, icon } = req.body;
    const newGoal = await db.query(
      'INSERT INTO savings_goals (user_id, title, target_amount, current_amount, deadline, color, icon) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [req.user.id, title, target_amount, 0, deadline || null, color || 'var(--primary)', icon || '💰']
    );
    res.json(newGoal.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error al crear meta de ahorro' });
  }
};

exports.updateGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, target_amount, current_amount, deadline, color, icon } = req.body;
    const updatedGoal = await db.query(
      'UPDATE savings_goals SET title = $1, target_amount = $2, current_amount = $3, deadline = $4, color = $5, icon = $6 WHERE id = $7 AND user_id = $8 RETURNING *',
      [title, target_amount, current_amount, deadline || null, color, icon, id, req.user.id]
    );
    if (updatedGoal.rows.length === 0) return res.status(404).json({ error: 'Meta no encontrada' });
    res.json(updatedGoal.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error al actualizar meta de ahorro' });
  }
};

exports.deleteGoal = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM savings_goals WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    res.json({ message: 'Meta eliminada' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error al eliminar meta de ahorro' });
  }
};

exports.createTransaction = async (req, res) => {
  try {
    const { type, amount, currency, category, source, description, date, goal_id } = req.body;
    
    await db.query('BEGIN');
    
    const veDate = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Caracas" }));
    const newTransaction = await db.query(
      'INSERT INTO transactions (user_id, type, amount, currency, category, source, description, date, goal_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [req.user.id, type, amount, currency || 'USD', category, source || '', description || '', date || veDate, goal_id || null]
    );

    if (goal_id) {
      const settingsResult = await db.query('SELECT settings FROM user_settings WHERE user_id = $1', [req.user.id]);
      const rates = settingsResult.rows[0]?.settings?.exchange_rates || { usd_bs: 648, usd_bs_bcv: 474, usd_cop: 4200, bs_cop: 5 };
      
      let amountInUSD = amount;
      if (currency !== 'USD') {
        const rateKey = (currency === 'BS' || currency === 'BS_P') ? 'usd_bs'
          : currency === 'BS_BCV' ? 'usd_bs_bcv'
          : currency === 'COP' ? 'usd_cop'
          : currency;
        
        let rate = rates[rateKey] || 1;
        if (currency === 'EUR') {
          rate = (rates.usd_bs_bcv / (rates.eur_bs_bcv || 1)) || 1;
        }
        amountInUSD = amount / rate;
      }

      const updateOp = (type === 'income' || type === 'saving') ? '+' : '-';
      await db.query(
        `UPDATE savings_goals SET current_amount = current_amount ${updateOp} $1 WHERE id = $2 AND user_id = $3`,
        [amountInUSD, goal_id, req.user.id]
      );
    }

    await db.query('COMMIT');
    res.json(newTransaction.rows[0]);
  } catch (err) {
    await db.query('ROLLBACK');
    console.error(err.message);
    res.status(500).json({ error: 'Error al registrar transacción' });
  }
};

exports.deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    
    await db.query('BEGIN');
    const transResult = await db.query('SELECT * FROM transactions WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    if (transResult.rows.length === 0) {
      await db.query('ROLLBACK');
      return res.status(404).json({ error: 'Transacción no encontrada' });
    }
    
    const trans = transResult.rows[0];
    if (trans.goal_id) {
      const settingsResult = await db.query('SELECT settings FROM user_settings WHERE user_id = $1', [req.user.id]);
      const rates = settingsResult.rows[0]?.settings?.exchange_rates || { usd_bs: 648, usd_bs_bcv: 474, usd_cop: 4200, bs_cop: 5, eur_bs_bcv: 570 };
      
      let amountInUSD = trans.amount;
      if (trans.currency && trans.currency !== 'USD') {
        const rateKey = (trans.currency === 'BS' || trans.currency === 'BS_P') ? 'usd_bs'
          : trans.currency === 'BS_BCV' ? 'usd_bs_bcv'
          : trans.currency === 'COP' ? 'usd_cop'
          : trans.currency;
        
        let rate = rates[rateKey] || 1;
        if (trans.currency === 'EUR') {
          rate = (rates.usd_bs_bcv / (rates.eur_bs_bcv || 1)) || 1;
        }
        amountInUSD = trans.amount / rate;
      }

      const amountToRevert = (trans.type === 'income' || trans.type === 'saving') ? -amountInUSD : amountInUSD;
      await db.query(
        'UPDATE savings_goals SET current_amount = current_amount + $1 WHERE id = $2 AND user_id = $3',
        [amountToRevert, trans.goal_id, req.user.id]
      );
    }
    
    await db.query('DELETE FROM transactions WHERE id = $1', [id]);
    await db.query('COMMIT');
    res.json({ message: 'Transacción eliminada' });
  } catch (err) {
    await db.query('ROLLBACK');
    console.error(err.message);
    res.status(500).json({ error: 'Error al eliminar transacción' });
  }
};

exports.updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, amount, currency, category, source, description, date, goal_id } = req.body;
    
    await db.query('BEGIN');

    const oldRes = await db.query('SELECT * FROM transactions WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    if (oldRes.rows.length === 0) {
      await db.query('ROLLBACK');
      return res.status(404).json({ error: 'Transacción no encontrada' });
    }
    const oldTx = oldRes.rows[0];

    const settingsResult = await db.query('SELECT settings FROM user_settings WHERE user_id = $1', [req.user.id]);
    const rates = settingsResult.rows[0]?.settings?.exchange_rates || { usd_bs: 648, usd_bs_bcv: 474, usd_cop: 4200, bs_cop: 5 };

    if (oldTx.goal_id) {
      const oldAmountInUSD = oldTx.currency === 'USD' ? oldTx.amount : oldTx.amount / (rates[oldTx.currency] || 1);
      const revertOp = (oldTx.type === 'income' || oldTx.type === 'saving') ? '-' : '+';
      await db.query(`UPDATE savings_goals SET current_amount = current_amount ${revertOp} $1 WHERE id = $2`, [oldAmountInUSD, oldTx.goal_id]);
    }

    if (goal_id) {
      const newAmountInUSD = currency === 'USD' ? amount : amount / (rates[currency] || 1);
      const applyOp = (type === 'income' || type === 'saving') ? '+' : '-';
      await db.query(`UPDATE savings_goals SET current_amount = current_amount ${applyOp} $1 WHERE id = $2`, [newAmountInUSD, goal_id]);
    }

    const updatedTx = await db.query(
      'UPDATE transactions SET type = $1, amount = $2, currency = $3, category = $4, source = $5, description = $6, date = $7, goal_id = $8 WHERE id = $9 AND user_id = $10 RETURNING *',
      [type, amount, currency, category, source, description, date, goal_id || null, id, req.user.id]
    );

    await db.query('COMMIT');
    res.json(updatedTx.rows[0]);
  } catch (err) {
    await db.query('ROLLBACK');
    console.error(err.message);
    res.status(500).json({ error: 'Error al actualizar transacción' });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    let { settings } = req.body;
    // Fix historically corrupted nested settings payload
    if (settings && settings.settings && !settings.exchange_rates) {
      settings = settings.settings;
    }
    await db.query(
      'INSERT INTO user_settings (user_id, settings, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (user_id) DO UPDATE SET settings = $2, updated_at = NOW()',
      [req.user.id, JSON.stringify(settings)]
    );
    res.json({ message: 'Ajustes guardados' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error al guardar ajustes' });
  }
};

exports.deleteAllTransactions = async (req, res) => {
  try {
    await db.query('DELETE FROM transactions WHERE user_id = $1', [req.user.id]);
    await db.query('UPDATE savings_goals SET current_amount = 0 WHERE user_id = $1', [req.user.id]);
    res.json({ message: 'Todos los movimientos eliminados y metas reiniciadas' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error al eliminar movimientos' });
  }
};

exports.deleteAllGoals = async (req, res) => {
  try {
    await db.query('DELETE FROM savings_goals WHERE user_id = $1', [req.user.id]);
    await db.query('UPDATE transactions SET goal_id = NULL WHERE user_id = $1', [req.user.id]);
    res.json({ message: 'Todas las metas eliminadas' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error al eliminar metas' });
  }
};

exports.reorderGoals = async (req, res) => {
  try {
    const { order } = req.body;
    if (!Array.isArray(order)) return res.status(400).json({ error: 'Invalid order format' });

    for (const item of order) {
      await db.query(
        'UPDATE savings_goals SET position = $1 WHERE id = $2 AND user_id = $3',
        [item.position, item.id, req.user.id]
      );
    }
    res.json({ message: 'Order updated successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error reordering goals' });
  }
};
