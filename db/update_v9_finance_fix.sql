-- ============================================
-- STRIKE v9.0 — Fix Finance Transactions Constraint
-- ============================================

-- Remover restricción de tipos de transacciones para permitir "goal_withdrawal"
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_type_check;
