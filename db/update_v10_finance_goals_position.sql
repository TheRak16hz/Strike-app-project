-- ============================================
-- STRIKE v10.0 — Add position to savings_goals
-- ============================================

ALTER TABLE savings_goals ADD COLUMN IF NOT EXISTS position INTEGER DEFAULT 0;
