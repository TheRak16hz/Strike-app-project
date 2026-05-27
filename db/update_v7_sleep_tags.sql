-- ============================================
-- STRIKE v7.0 — Módulo de Sueño (Siestas y Tags)
-- ============================================

-- Remove the unique constraint to allow multiple entries per day (e.g. night sleep + nap)
ALTER TABLE sleep_logs DROP CONSTRAINT IF EXISTS sleep_logs_user_id_log_date_key;

-- Add the 'tag' column
ALTER TABLE sleep_logs ADD COLUMN IF NOT EXISTS tag VARCHAR(50) DEFAULT 'dormir';
