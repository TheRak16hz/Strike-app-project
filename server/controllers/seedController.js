const db = require('../db');

// ========================
// GET /api/seed
// ========================
exports.getSeedData = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Validate username strictly for this module
    const userQuery = await db.query('SELECT username FROM users WHERE id = $1', [userId]);
    if (userQuery.rows.length === 0 || userQuery.rows[0].username !== 'TheRak16hz') {
      return res.status(403).json({ error: 'Acceso denegado.' });
    }

    const logsResult = await db.query(
      'SELECT * FROM seed_logs WHERE user_id = $1 ORDER BY log_date DESC LIMIT 365', 
      [userId]
    );
    const logs = logsResult.rows;

    // Calculate current streak
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // We check from the most recent day backwards.
    // If there's a missing day, it means it wasn't tracked. We might just count contiguous 'clean' records.
    // Or we simply count days since the last 'relapse'.
    const lastRelapseQuery = await db.query(
      "SELECT log_date FROM seed_logs WHERE user_id = $1 AND status = 'relapse' ORDER BY log_date DESC LIMIT 1",
      [userId]
    );

    let lastRelapseDate = null;
    if (lastRelapseQuery.rows.length > 0) {
      lastRelapseDate = new Date(lastRelapseQuery.rows[0].log_date);
      lastRelapseDate.setHours(0,0,0,0);
      const diffTime = Math.abs(today - lastRelapseDate);
      streak = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    } else {
      // If no relapses ever, calculate streak from the first clean log, or 0 if no logs
      const firstLogQuery = await db.query(
        "SELECT log_date FROM seed_logs WHERE user_id = $1 ORDER BY log_date ASC LIMIT 1",
        [userId]
      );
      if (firstLogQuery.rows.length > 0) {
        const firstLogDate = new Date(firstLogQuery.rows[0].log_date);
        firstLogDate.setHours(0,0,0,0);
        const diffTime = Math.abs(today - firstLogDate);
        streak = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        // Ensure that if today was clean, it counts properly.
        const todayLog = logs.find(l => {
            const d = new Date(l.log_date);
            d.setHours(0,0,0,0);
            return d.getTime() === today.getTime();
        });
        if (todayLog && todayLog.status === 'clean') {
            streak += 1;
        }
      }
    }

    res.json({
      logs: logs,
      current_streak: streak
    });
  } catch (err) {
    console.error('Error getSeedData:', err);
    res.status(500).json({ error: 'Error al obtener datos' });
  }
};

// ========================
// POST /api/seed/log
// ========================
exports.logEvent = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, log_date } = req.body; // status: 'clean' | 'relapse'
    
    // Validate username strictly
    const userQuery = await db.query('SELECT username FROM users WHERE id = $1', [userId]);
    if (userQuery.rows.length === 0 || userQuery.rows[0].username !== 'TheRak16hz') {
      return res.status(403).json({ error: 'Acceso denegado.' });
    }

    const date = log_date || new Date().toLocaleDateString('en-CA', { timeZone: 'America/Caracas' });

    const result = await db.query(
      `INSERT INTO seed_logs (user_id, log_date, status)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, log_date) DO UPDATE SET
         status = EXCLUDED.status,
         created_at = NOW()
       RETURNING *`,
      [userId, date, status]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error logEvent:', err);
    res.status(500).json({ error: 'Error al registrar evento' });
  }
};

// ========================
// DELETE /api/seed/all
// ========================
exports.deleteAllSeedLogs = async (req, res) => {
  try {
    await db.query('DELETE FROM seed_logs WHERE user_id = $1', [req.user.id]);
    res.json({ success: true, message: 'Todos los registros de seed eliminados' });
  } catch (err) {
    console.error('Error deleteAllSeedLogs:', err);
    res.status(500).json({ error: 'Error al eliminar todos los registros' });
  }
};
