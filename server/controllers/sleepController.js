const db = require('../db');

// ========================
// GET /api/sleep — Full sleep data
// ========================
exports.getSleepData = async (req, res) => {
  try {
    const userId = req.user.id;

    const [logs, settings] = await Promise.all([
      db.query('SELECT * FROM sleep_logs WHERE user_id = $1 ORDER BY log_date DESC LIMIT 60', [userId]),
      db.query('SELECT * FROM sleep_settings WHERE user_id = $1', [userId])
    ]);

    const allLogs = logs.rows;
    const defaultSettings = { target_hours: 8, bedtime_goal: '23:00', wakeup_goal: '07:00', reminder_enabled: false, reminder_time: '22:30' };

    // Calculate stats
    const last7 = allLogs.filter((_, i) => i < 7);
    const last30 = allLogs.filter((_, i) => i < 30);

    const avgWeekly = last7.length > 0
      ? last7.reduce((sum, l) => sum + Number(l.hours), 0) / last7.length
      : 0;

    const avgMonthly = last30.length > 0
      ? last30.reduce((sum, l) => sum + Number(l.hours), 0) / last30.length
      : 0;

    const avgQuality = last30.length > 0
      ? last30.reduce((sum, l) => sum + Number(l.quality || 3), 0) / last30.length
      : 0;

    // Healthy streak (7-9 hours consecutive)
    let streak = 0;
    for (const log of allLogs) {
      const h = Number(log.hours);
      if (h >= 7 && h <= 9) streak++;
      else break;
    }

    res.json({
      logs: allLogs,
      settings: settings.rows[0] || { user_id: userId, ...defaultSettings },
      stats: {
        avg_weekly: Math.round(avgWeekly * 10) / 10,
        avg_monthly: Math.round(avgMonthly * 10) / 10,
        avg_quality: Math.round(avgQuality * 10) / 10,
        healthy_streak: streak,
        total_logs: allLogs.length
      }
    });
  } catch (err) {
    console.error('Error getSleepData:', err);
    res.status(500).json({ error: 'Error al obtener datos de sueño' });
  }
};

// ========================
// POST /api/sleep/log
// ========================
exports.logSleep = async (req, res) => {
  try {
    const { log_date, hours, bedtime, wakeup_time, quality, notes, tag } = req.body;
    const date = log_date || new Date().toLocaleDateString('en-CA', { timeZone: 'America/Caracas' });
    const currentTag = tag || 'dormir';
    
    let calcQuality = quality || 3;
    if (currentTag === 'dormir') {
        const h = Number(hours);
        if (h < 4) calcQuality = 1;
        else if (h < 4.5) calcQuality = 1.5;
        else if (h < 5) calcQuality = 2;
        else if (h < 5.5) calcQuality = 2.5;
        else if (h < 6.5) calcQuality = 3;
        else if (h < 7) calcQuality = 3.5;
        else if (h < 8) calcQuality = 4;
        else if (h < 9) calcQuality = 4.5;
        else calcQuality = 5;
    } else {
        calcQuality = quality || 3;
    }

    const result = await db.query(
      `INSERT INTO sleep_logs (user_id, log_date, hours, bedtime, wakeup_time, quality, notes, tag)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [req.user.id, date, hours, bedtime || null, wakeup_time || null, calcQuality, notes || null, currentTag]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error logSleep:', err);
    res.status(500).json({ error: 'Error al registrar sueño' });
  }
};

// ========================
// PUT /api/sleep/log/:id
// ========================
exports.updateSleepLog = async (req, res) => {
  try {
    const { hours, bedtime, wakeup_time, quality, notes, tag } = req.body;
    const currentTag = tag || 'dormir';
    
    let calcQuality = quality || 3;
    if (currentTag === 'dormir') {
        const h = Number(hours);
        if (h < 4) calcQuality = 1;
        else if (h < 4.5) calcQuality = 1.5;
        else if (h < 5) calcQuality = 2;
        else if (h < 5.5) calcQuality = 2.5;
        else if (h < 6.5) calcQuality = 3;
        else if (h < 7) calcQuality = 3.5;
        else if (h < 8) calcQuality = 4;
        else if (h < 9) calcQuality = 4.5;
        else calcQuality = 5;
    } else {
        calcQuality = quality || 3;
    }

    const result = await db.query(
      `UPDATE sleep_logs SET hours = $1, bedtime = $2, wakeup_time = $3, quality = $4, notes = $5, tag = $6
       WHERE id = $7 AND user_id = $8 RETURNING *`,
      [hours, bedtime || null, wakeup_time || null, calcQuality, notes || null, currentTag, req.params.id, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updateSleepLog:', err);
    res.status(500).json({ error: 'Error al actualizar registro' });
  }
};

// ========================
// DELETE /api/sleep/log/:id
// ========================
exports.deleteSleepLog = async (req, res) => {
  try {
    await db.query('DELETE FROM sleep_logs WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleteSleepLog:', err);
    res.status(500).json({ error: 'Error al eliminar registro' });
  }
};

// ========================
// POST /api/sleep/settings
// ========================
exports.saveSettings = async (req, res) => {
  try {
    const { target_hours, bedtime_goal, wakeup_goal, reminder_enabled, reminder_time } = req.body;

    const result = await db.query(
      `INSERT INTO sleep_settings (user_id, target_hours, bedtime_goal, wakeup_goal, reminder_enabled, reminder_time, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       ON CONFLICT (user_id) DO UPDATE SET
         target_hours = EXCLUDED.target_hours,
         bedtime_goal = EXCLUDED.bedtime_goal,
         wakeup_goal = EXCLUDED.wakeup_goal,
         reminder_enabled = EXCLUDED.reminder_enabled,
         reminder_time = EXCLUDED.reminder_time,
         updated_at = NOW()
       RETURNING *`,
      [req.user.id, target_hours || 8, bedtime_goal || '23:00', wakeup_goal || '07:00', reminder_enabled || false, reminder_time || '22:30']
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error saveSettings:', err);
    res.status(500).json({ error: 'Error al guardar configuración' });
  }
};

// --- Hard Reset ---
exports.deleteAllData = async (req, res) => {
    try {
        const userId = req.user.id;
        await db.query('DELETE FROM sleep_logs WHERE user_id = $1', [userId]);
        await db.query('DELETE FROM sleep_settings WHERE user_id = $1', [userId]);
        res.json({ message: 'Todos los datos de sueño han sido eliminados.' });
    } catch (err) {
        console.error('Error deleteAllData:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};
