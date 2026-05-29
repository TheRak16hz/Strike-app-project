const db = require('../db');

// ========================
// GET /api/nutrition — Daily summary
// ========================
exports.getDailyData = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Caracas' });

    const [foodLogs, waterLogs, caffeineLogs, sugarLogs, settings] = await Promise.all([
      db.query('SELECT * FROM food_logs WHERE user_id = $1 AND log_date = $2 ORDER BY created_at DESC', [userId, today]),
      db.query('SELECT * FROM water_logs WHERE user_id = $1 AND log_date = $2 ORDER BY created_at DESC', [userId, today]),
      db.query('SELECT * FROM caffeine_logs WHERE user_id = $1 AND log_date = $2 ORDER BY created_at DESC', [userId, today]),
      db.query('SELECT * FROM sugar_logs WHERE user_id = $1 AND log_date = $2 ORDER BY created_at DESC', [userId, today]),
      db.query('SELECT * FROM nutrition_settings WHERE user_id = $1', [userId])
    ]);

    const defaultSettings = { calorie_goal: 2000, calorie_mode: 'maintain', water_goal_ml: 1920, water_unit: 'ml', water_reminder_interval: 60, caffeine_limit_mg: 400, sugar_limit_g: 50 };

    res.json({
      food_logs: foodLogs.rows,
      water_logs: waterLogs.rows,
      caffeine_logs: caffeineLogs.rows,
      sugar_logs: sugarLogs.rows,
      settings: settings.rows[0] || { user_id: userId, ...defaultSettings },
      date: today
    });
  } catch (err) {
    console.error('Error getDailyData:', err);
    res.status(500).json({ error: 'Error al obtener datos nutricionales' });
  }
};

// ========================
// GET /api/nutrition/library
// ========================
exports.getLibrary = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT DISTINCT ON (name) * 
       FROM food_library 
       WHERE user_id IS NULL OR user_id = $1 
       ORDER BY name, user_id DESC`,
      [req.user.id]
    );
    
    // Sort by category then name in memory
    const sorted = result.rows.sort((a, b) => {
      if (a.category === b.category) {
        return a.name.localeCompare(b.name);
      }
      return a.category.localeCompare(b.category);
    });
    
    res.json(sorted);
  } catch (err) {
    console.error('Error getLibrary:', err);
    res.status(500).json({ error: 'Error al obtener librería' });
  }
};

// ========================
// POST /api/nutrition/library
// ========================
// PUT /api/nutrition/library/:id
// ========================
exports.editFood = async (req, res) => {
  try {
    const { name, category, meal_type, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, emoji } = req.body;
    
    const check = await db.query('SELECT * FROM food_library WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    if (check.rows.length === 0) {
      return res.status(403).json({ error: 'No tienes permiso para editar este alimento o no existe.' });
    }

    const result = await db.query(
      `UPDATE food_library SET name = $1, category = $2, meal_type = $3, calories_per_100g = $4, protein_per_100g = $5, carbs_per_100g = $6, fat_per_100g = $7, emoji = $8
       WHERE id = $9 AND user_id = $10 RETURNING *`,
      [name, category || 'Otros', meal_type || 'any', calories_per_100g, protein_per_100g || 0, carbs_per_100g || 0, fat_per_100g || 0, emoji || '🍽️', req.params.id, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error editFood:', err);
    res.status(500).json({ error: 'Error al editar alimento' });
  }
};

// ========================
exports.createFood = async (req, res) => {
  try {
    const { name, category, meal_type, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, emoji } = req.body;
    const result = await db.query(
      `INSERT INTO food_library (name, category, meal_type, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, emoji, user_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [name, category || 'Otros', meal_type || 'any', calories_per_100g, protein_per_100g || 0, carbs_per_100g || 0, fat_per_100g || 0, emoji || '🍽️', req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error createFood:', err);
    res.status(500).json({ error: 'Error al crear alimento' });
  }
};

// ========================
// DELETE /api/nutrition/library/:id
// ========================
exports.deleteFood = async (req, res) => {
  try {
    await db.query('DELETE FROM food_library WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleteFood:', err);
    res.status(500).json({ error: 'Error al eliminar alimento' });
  }
};

// ========================
// POST /api/nutrition/food — Log a food entry
// ========================
exports.logFood = async (req, res) => {
  try {
    const { food_library_id, food_name, grams, calories, protein, carbs, fat, meal_type, log_date } = req.body;
    const date = log_date || new Date().toLocaleDateString('en-CA', { timeZone: 'America/Caracas' });

    const result = await db.query(
      `INSERT INTO food_logs (user_id, food_library_id, food_name, grams, calories, protein, carbs, fat, meal_type, log_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [req.user.id, food_library_id || null, food_name, grams, calories, protein || 0, carbs || 0, fat || 0, meal_type || 'snack', date]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error logFood:', err);
    res.status(500).json({ error: 'Error al registrar alimento' });
  }
};

// ========================
// DELETE /api/nutrition/food/:id
// ========================
exports.deleteLogFood = async (req, res) => {
  try {
    await db.query('DELETE FROM food_logs WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleteLogFood:', err);
    res.status(500).json({ error: 'Error al eliminar registro' });
  }
};

// ========================
// POST /api/nutrition/water
// ========================
exports.logWater = async (req, res) => {
  try {
    const { amount_ml, source, log_date } = req.body;
    const date = log_date || new Date().toLocaleDateString('en-CA', { timeZone: 'America/Caracas' });

    const result = await db.query(
      'INSERT INTO water_logs (user_id, amount_ml, source, log_date) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.user.id, amount_ml, source || 'vaso', date]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error logWater:', err);
    res.status(500).json({ error: 'Error al registrar agua' });
  }
};

// ========================
// DELETE /api/nutrition/water/:id
// ========================
exports.deleteWater = async (req, res) => {
  try {
    await db.query('DELETE FROM water_logs WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleteWater:', err);
    res.status(500).json({ error: 'Error al eliminar registro de agua' });
  }
};

// ========================
// POST /api/nutrition/caffeine
// ========================
exports.logCaffeine = async (req, res) => {
  try {
    const { amount_mg, source, cups, log_date } = req.body;
    const date = log_date || new Date().toLocaleDateString('en-CA', { timeZone: 'America/Caracas' });

    const result = await db.query(
      'INSERT INTO caffeine_logs (user_id, amount_mg, source, cups, log_date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [req.user.id, amount_mg, source || 'café', cups || 1, date]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error logCaffeine:', err);
    res.status(500).json({ error: 'Error al registrar cafeína' });
  }
};

// ========================
// DELETE /api/nutrition/caffeine/:id
// ========================
exports.deleteCaffeine = async (req, res) => {
  try {
    await db.query('DELETE FROM caffeine_logs WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleteCaffeine:', err);
    res.status(500).json({ error: 'Error al eliminar registro de cafeína' });
  }
};

// ========================
// POST /api/nutrition/sugar
// ========================
exports.logSugar = async (req, res) => {
  try {
    const { amount_g, source, log_date } = req.body;
    const date = log_date || new Date().toLocaleDateString('en-CA', { timeZone: 'America/Caracas' });

    const result = await db.query(
      'INSERT INTO sugar_logs (user_id, amount_g, source, log_date) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.user.id, amount_g, source || 'azúcar', date]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error logSugar:', err);
    res.status(500).json({ error: 'Error al registrar azúcar' });
  }
};

// ========================
// DELETE /api/nutrition/sugar/:id
// ========================
exports.deleteSugar = async (req, res) => {
  try {
    await db.query('DELETE FROM sugar_logs WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleteSugar:', err);
    res.status(500).json({ error: 'Error al eliminar registro de azúcar' });
  }
};

// ========================
// POST /api/nutrition/settings
// ========================
exports.saveSettings = async (req, res) => {
  try {
    const { calorie_goal, calorie_mode, water_goal_ml, water_unit, water_reminder_interval, caffeine_limit_mg, sugar_limit_g } = req.body;

    const result = await db.query(
      `INSERT INTO nutrition_settings (user_id, calorie_goal, calorie_mode, water_goal_ml, water_unit, water_reminder_interval, caffeine_limit_mg, sugar_limit_g, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
       ON CONFLICT (user_id) DO UPDATE SET
         calorie_goal = EXCLUDED.calorie_goal,
         calorie_mode = EXCLUDED.calorie_mode,
         water_goal_ml = EXCLUDED.water_goal_ml,
         water_unit = EXCLUDED.water_unit,
         water_reminder_interval = EXCLUDED.water_reminder_interval,
         caffeine_limit_mg = EXCLUDED.caffeine_limit_mg,
         sugar_limit_g = EXCLUDED.sugar_limit_g,
         updated_at = NOW()
       RETURNING *`,
      [req.user.id, calorie_goal || 2000, calorie_mode || 'maintain', water_goal_ml || 1920, water_unit || 'ml', water_reminder_interval || 60, caffeine_limit_mg || 400, sugar_limit_g || 50]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error saveSettings:', err);
    res.status(500).json({ error: 'Error al guardar configuración' });
  }
};

// ========================
// GET /api/nutrition/profile
// ========================
exports.getProfile = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT weight_kg, height_cm, birth_date, gender FROM users WHERE id = $1',
      [req.user.id]
    );
    res.json(result.rows[0] || {});
  } catch (err) {
    console.error('Error getProfile:', err);
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
};

// ========================
// POST /api/nutrition/profile
// ========================
exports.saveProfile = async (req, res) => {
  try {
    const { weight_kg, height_cm, birth_date, gender } = req.body;
    await db.query(
      'UPDATE users SET weight_kg = $1, height_cm = $2, birth_date = $3, gender = $4 WHERE id = $5',
      [weight_kg, height_cm, birth_date, gender, req.user.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Error saveProfile:', err);
    res.status(500).json({ error: 'Error al guardar perfil' });
  }
};

// ========================
// GET /api/nutrition/bmi
// ========================
exports.getBmi = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT weight_kg, height_cm, birth_date, gender FROM users WHERE id = $1',
      [req.user.id]
    );
    const user = result.rows[0];
    if (!user || !user.weight_kg || !user.height_cm) {
      return res.json({ bmi: null, message: 'Completa tu perfil de salud primero' });
    }

    const heightM = Number(user.height_cm) / 100;
    const bmi = Number(user.weight_kg) / (heightM * heightM);
    const heightIn = Number(user.height_cm) / 2.54;

    // Devine formula for ideal weight
    let idealWeight;
    if (user.gender === 'female') {
      idealWeight = 45.5 + 2.3 * (heightIn - 60);
    } else {
      idealWeight = 50 + 2.3 * (heightIn - 60);
    }

    // BMR (Harris-Benedict)
    let bmr;
    const age = user.birth_date
      ? Math.floor((Date.now() - new Date(user.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      : 25;

    if (user.gender === 'female') {
      bmr = 447.593 + (9.247 * Number(user.weight_kg)) + (3.098 * Number(user.height_cm)) - (4.330 * age);
    } else {
      bmr = 88.362 + (13.397 * Number(user.weight_kg)) + (4.799 * Number(user.height_cm)) - (5.677 * age);
    }

    let category;
    if (bmi < 18.5) category = 'Bajo peso';
    else if (bmi < 25) category = 'Normal';
    else if (bmi < 30) category = 'Sobrepeso';
    else category = 'Obesidad';

    res.json({
      bmi: Math.round(bmi * 10) / 10,
      category,
      ideal_weight_kg: Math.round(idealWeight * 10) / 10,
      bmr: Math.round(bmr),
      tdee_sedentary: Math.round(bmr * 1.2),
      tdee_moderate: Math.round(bmr * 1.55),
      tdee_active: Math.round(bmr * 1.75),
      age
    });
  } catch (err) {
    console.error('Error getBmi:', err);
    res.status(500).json({ error: 'Error al calcular IMC' });
  }
};

// ========================
// GET /api/nutrition/history
// ========================
exports.getHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const days = parseInt(req.query.days) || 14;

    const result = await db.query(`
      WITH date_series AS (
        SELECT generate_series(
          CURRENT_DATE - INTERVAL '1 day' * $2, 
          CURRENT_DATE, 
          '1 day'::interval
        )::date AS log_date
      )
      SELECT 
        d.log_date,
        COALESCE(SUM(f.calories), 0) AS total_calories,
        COALESCE(SUM(f.protein), 0) AS total_protein,
        COALESCE(SUM(f.carbs), 0) AS total_carbs,
        COALESCE(SUM(f.fat), 0) AS total_fat,
        (SELECT COALESCE(SUM(amount_ml), 0) FROM water_logs WHERE user_id = $1 AND log_date = d.log_date) AS total_water_ml,
        (SELECT COALESCE(SUM(amount_mg), 0) FROM caffeine_logs WHERE user_id = $1 AND log_date = d.log_date) AS total_caffeine_mg,
        (SELECT COALESCE(SUM(amount_g), 0) FROM sugar_logs WHERE user_id = $1 AND log_date = d.log_date) AS total_sugar_g
      FROM date_series d
      LEFT JOIN food_logs f ON f.log_date = d.log_date AND f.user_id = $1
      GROUP BY d.log_date
      ORDER BY d.log_date DESC
    `, [userId, days]);

    res.json(result.rows);
  } catch (err) {
    console.error('Error getHistory:', err);
    res.status(500).json({ error: 'Error al obtener el historial' });
  }
};

// --- Hard Reset ---
exports.deleteAllData = async (req, res) => {
    try {
        const userId = req.user.id;
        await db.query('DELETE FROM food_library WHERE user_id = $1', [userId]);
        await db.query('DELETE FROM food_logs WHERE user_id = $1', [userId]);
        await db.query('DELETE FROM water_logs WHERE user_id = $1', [userId]);
        await db.query('DELETE FROM caffeine_logs WHERE user_id = $1', [userId]);
        await db.query('DELETE FROM sugar_logs WHERE user_id = $1', [userId]);
        await db.query('DELETE FROM nutrition_settings WHERE user_id = $1', [userId]);
        res.json({ message: 'Todos los datos de nutrición han sido eliminados.' });
    } catch (err) {
        console.error('Error deleteAllData:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};
