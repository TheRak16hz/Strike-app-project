-- ============================================
-- STRIKE v4.0 — Módulo de Sueño
-- ============================================

-- 1. Registro de sueño
CREATE TABLE IF NOT EXISTS sleep_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    hours DECIMAL(4,2) NOT NULL,
    bedtime TIME,
    wakeup_time TIME,
    quality INTEGER DEFAULT 3,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, log_date)
);

-- 2. Configuración de sueño
CREATE TABLE IF NOT EXISTS sleep_settings (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    target_hours DECIMAL(4,2) DEFAULT 8.0,
    bedtime_goal TIME DEFAULT '23:00',
    wakeup_goal TIME DEFAULT '07:00',
    reminder_enabled BOOLEAN DEFAULT false,
    reminder_time TIME DEFAULT '22:30',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sleep_logs_user_date ON sleep_logs(user_id, log_date);
