-- ============================================
-- STRIKE v12 — Depuración de librería de alimentos
-- ============================================

-- Eliminar registros duplicados (mismo nombre y mismo user_id / o ambos NULL), 
-- conservando solo el registro más antiguo (el de menor ID).
DELETE FROM food_library a USING food_library b 
WHERE a.id > b.id 
  AND a.name = b.name 
  AND (
      (a.user_id = b.user_id) OR 
      (a.user_id IS NULL AND b.user_id IS NULL)
  );
