-- ============================================
-- V12: Añadir índice único a food_library
-- ============================================

-- Eliminar duplicados previos si existen (manteniendo el de menor ID)
DELETE FROM food_library
WHERE id NOT IN (
    SELECT MIN(id)
    FROM food_library
    GROUP BY name, COALESCE(user_id, -1)
);

-- Crear un índice único utilizando COALESCE para manejar el caso de user_id = NULL
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_food_name_user ON food_library (name, COALESCE(user_id, -1));
