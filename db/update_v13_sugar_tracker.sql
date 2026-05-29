-- ============================================
-- STRIKE v13 — Historial de Nutrición, Rastreador de Azúcar y Expansión de Librería
-- ============================================

-- 1. Añadir límite de azúcar a la configuración
ALTER TABLE nutrition_settings ADD COLUMN IF NOT EXISTS sugar_limit_g INTEGER DEFAULT 50;

-- 2. Registro de Azúcar
CREATE TABLE IF NOT EXISTS sugar_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    amount_g INTEGER NOT NULL,
    source TEXT DEFAULT 'azúcar',
    log_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sugar_logs_user_date ON sugar_logs(user_id, log_date);

-- 3. Expandir la librería de alimentos con nuevas opciones
-- Utilizamos ON CONFLICT DO NOTHING para evitar duplicados si la semilla se ejecuta más de una vez
-- Requiere la constraint unique que ya aseguramos (o simplemente dependemos de que no se use ON CONFLICT si no hay unique,
-- pero como no tenemos unique por diseño anterior, insertamos cuidadosamente si no existen).

-- Para evitar errores de ON CONFLICT sin constraint, hacemos un insert select condicional:
INSERT INTO food_library (name, category, meal_type, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, emoji, user_id)
SELECT * FROM (VALUES
    -- Comida Venezolana y Desayunos/Almuerzos/Cenas adicionales
    ('Arepa de Trigo', 'Carbohidratos', 'desayuno', 280, 7, 50, 4, '🫓', NULL::INTEGER),
    ('Empanada Frita (Queso/Carne)', 'Carbohidratos', 'desayuno', 350, 10, 45, 15, '🥟', NULL),
    ('Tequeños (x5)', 'Snacks', 'snack', 450, 12, 40, 25, '🧀', NULL),
    ('Cachapa con Queso', 'Carbohidratos', 'almuerzo', 380, 15, 60, 10, '🌽', NULL),
    ('Pabellón Criollo', 'Otros', 'almuerzo', 650, 35, 75, 20, '🍛', NULL),
    ('Sopa / Hervido', 'Otros', 'almuerzo', 180, 12, 25, 4, '🥣', NULL),
    ('Panquecas', 'Carbohidratos', 'desayuno', 227, 6, 28, 9, '🥞', NULL),
    ('Cereal con Leche', 'Desayuno', 'desayuno', 170, 5, 30, 2, '🥣', NULL),
    ('Sándwich de Jamón y Queso', 'Otros', 'cena', 250, 15, 28, 10, '🥪', NULL),
    ('Hamburguesa', 'Otros', 'cena', 550, 25, 45, 30, '🍔', NULL),
    ('Pizza (1 slice)', 'Otros', 'cena', 285, 12, 35, 10, '🍕', NULL),
    ('Sushi (Rollo)', 'Otros', 'cena', 350, 15, 60, 5, '🍣', NULL),
    ('Pollo Frito', 'Proteínas', 'almuerzo', 320, 20, 15, 20, '🍗', NULL),
    ('Ensalada Mixta', 'Verduras', 'almuerzo', 50, 2, 8, 1, '🥗', NULL),
    
    -- Chucherías y Azúcares
    ('Chocolate (Barra pequeña)', 'Snacks', 'snack', 250, 3, 30, 15, '🍫', NULL),
    ('Galletas dulces', 'Snacks', 'snack', 480, 5, 65, 20, '🍪', NULL),
    ('Helado (1 porción)', 'Snacks', 'snack', 200, 3, 25, 10, '🍨', NULL),
    ('Torta / Pastel', 'Snacks', 'snack', 350, 4, 50, 15, '🍰', NULL),
    ('Pepitos / Doritos', 'Snacks', 'snack', 500, 5, 60, 25, '🧀', NULL),
    ('Papas Fritas de bolsa', 'Snacks', 'snack', 530, 6, 50, 35, '🍟', NULL),
    ('Donas', 'Snacks', 'snack', 450, 4, 50, 25, '🍩', NULL),
    
    -- Refrescos y Bebidas Dulces
    ('Coca-Cola / Pepsi', 'Bebidas', 'snack', 42, 0, 11, 0, '🥤', NULL), -- por 100ml
    ('Malta', 'Bebidas', 'snack', 60, 1, 14, 0, '🥤', NULL),
    ('Té frío azucarado', 'Bebidas', 'snack', 35, 0, 9, 0, '🧃', NULL),
    ('Jugo pasteurizado', 'Bebidas', 'snack', 45, 0.5, 11, 0, '🧃', NULL),
    
    -- Más bebidas saludables
    ('Agua de coco', 'Bebidas', 'snack', 19, 0.7, 3.7, 0.2, '🥥', NULL),
    ('Leche de Almendras', 'Bebidas', 'desayuno', 15, 0.5, 0.3, 1.2, '🥛', NULL)
) AS t(name, category, meal_type, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, emoji, user_id)
WHERE NOT EXISTS (
    SELECT 1 FROM food_library WHERE food_library.name = t.name AND food_library.user_id IS NULL
);
