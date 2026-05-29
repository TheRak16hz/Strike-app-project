-- ============================================
-- STRIKE v11 — Update sleep quality to decimal
-- ============================================

ALTER TABLE sleep_logs ALTER COLUMN quality TYPE DECIMAL(3,1);
