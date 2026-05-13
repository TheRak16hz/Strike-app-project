-- ============================================
-- STRIKE v4.0 — Módulo de Alimentación
-- ============================================

-- 1. Perfil de salud del usuario
ALTER TABLE users ADD COLUMN IF NOT EXISTS weight_kg DECIMAL(5,1);
ALTER TABLE users ADD COLUMN IF NOT EXISTS height_cm DECIMAL(5,1);
ALTER TABLE users ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR(10);

-- 2. Librería de alimentos (presets + custom del usuario)
CREATE TABLE IF NOT EXISTS food_library (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    meal_type TEXT DEFAULT 'any',
    calories_per_100g DECIMAL(8,2) NOT NULL,
    protein_per_100g DECIMAL(8,2) DEFAULT 0,
    carbs_per_100g DECIMAL(8,2) DEFAULT 0,
    fat_per_100g DECIMAL(8,2) DEFAULT 0,
    emoji TEXT DEFAULT '🍽️',
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Registro diario de alimentos consumidos
CREATE TABLE IF NOT EXISTS food_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    food_library_id INTEGER REFERENCES food_library(id) ON DELETE SET NULL,
    food_name TEXT NOT NULL,
    grams DECIMAL(8,2) NOT NULL,
    calories DECIMAL(8,2) NOT NULL,
    protein DECIMAL(8,2) DEFAULT 0,
    carbs DECIMAL(8,2) DEFAULT 0,
    fat DECIMAL(8,2) DEFAULT 0,
    meal_type TEXT DEFAULT 'snack',
    log_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Metas y configuración nutricional del usuario
CREATE TABLE IF NOT EXISTS nutrition_settings (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    calorie_goal INTEGER DEFAULT 2000,
    calorie_mode TEXT DEFAULT 'maintain',
    water_goal_ml INTEGER DEFAULT 1920,
    water_unit TEXT DEFAULT 'ml',
    water_reminder_interval INTEGER DEFAULT 60,
    caffeine_limit_mg INTEGER DEFAULT 400,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Registro de agua diaria
CREATE TABLE IF NOT EXISTS water_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    amount_ml INTEGER NOT NULL,
    source TEXT DEFAULT 'vaso',
    log_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Registro de café/cafeína
CREATE TABLE IF NOT EXISTS caffeine_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    amount_mg INTEGER NOT NULL,
    source TEXT DEFAULT 'café',
    cups DECIMAL(4,2) DEFAULT 1,
    log_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_food_logs_user_date ON food_logs(user_id, log_date);
CREATE INDEX IF NOT EXISTS idx_water_logs_user_date ON water_logs(user_id, log_date);
CREATE INDEX IF NOT EXISTS idx_caffeine_logs_user_date ON caffeine_logs(user_id, log_date);

-- Seed: Librería de alimentos base (user_id NULL = global)
INSERT INTO food_library (name, category, meal_type, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, emoji, user_id) VALUES
-- Proteínas
('Pechuga de Pollo', 'Proteínas', 'any', 165, 31, 0, 3.6, '🍗', NULL),
('Carne de Res', 'Proteínas', 'any', 250, 26, 0, 15, '🥩', NULL),
('Huevo', 'Proteínas', 'desayuno', 155, 13, 1.1, 11, '🥚', NULL),
('Atún en lata', 'Proteínas', 'any', 130, 28, 0, 1.5, '🐟', NULL),
('Cerdo', 'Proteínas', 'any', 242, 27, 0, 14, '🥓', NULL),
('Pescado Blanco', 'Proteínas', 'any', 96, 20, 0, 1.7, '🐠', NULL),
('Camarones', 'Proteínas', 'any', 99, 24, 0.2, 0.3, '🦐', NULL),
('Pavo', 'Proteínas', 'any', 135, 30, 0, 1, '🦃', NULL),
-- Carbohidratos
('Arroz Blanco', 'Carbohidratos', 'almuerzo', 130, 2.7, 28, 0.3, '🍚', NULL),
('Pasta', 'Carbohidratos', 'almuerzo', 131, 5, 25, 1.1, '🍝', NULL),
('Pan', 'Carbohidratos', 'desayuno', 265, 9, 49, 3.2, '🍞', NULL),
('Avena', 'Carbohidratos', 'desayuno', 389, 17, 66, 6.9, '🥣', NULL),
('Papa', 'Carbohidratos', 'any', 77, 2, 17, 0.1, '🥔', NULL),
('Arepa', 'Carbohidratos', 'desayuno', 200, 4, 43, 1, '🫓', NULL),
('Plátano Maduro', 'Carbohidratos', 'any', 122, 1.3, 32, 0.4, '🍌', NULL),
('Yuca', 'Carbohidratos', 'any', 160, 1.4, 38, 0.3, '🥖', NULL),
('Lentejas', 'Carbohidratos', 'almuerzo', 116, 9, 20, 0.4, '🫘', NULL),
('Frijoles Negros', 'Carbohidratos', 'almuerzo', 132, 9, 24, 0.5, '🫘', NULL),
-- Frutas
('Banana', 'Frutas', 'snack', 89, 1.1, 23, 0.3, '🍌', NULL),
('Manzana', 'Frutas', 'snack', 52, 0.3, 14, 0.2, '🍎', NULL),
('Naranja', 'Frutas', 'snack', 47, 0.9, 12, 0.1, '🍊', NULL),
('Mango', 'Frutas', 'snack', 60, 0.8, 15, 0.4, '🥭', NULL),
('Piña', 'Frutas', 'snack', 50, 0.5, 13, 0.1, '🍍', NULL),
('Sandía', 'Frutas', 'snack', 30, 0.6, 8, 0.2, '🍉', NULL),
('Fresas', 'Frutas', 'snack', 32, 0.7, 8, 0.3, '🍓', NULL),
-- Verduras
('Lechuga', 'Verduras', 'any', 15, 1.4, 2.9, 0.2, '🥬', NULL),
('Tomate', 'Verduras', 'any', 18, 0.9, 3.9, 0.2, '🍅', NULL),
('Cebolla', 'Verduras', 'any', 40, 1.1, 9.3, 0.1, '🧅', NULL),
('Zanahoria', 'Verduras', 'any', 41, 0.9, 10, 0.2, '🥕', NULL),
('Brócoli', 'Verduras', 'any', 34, 2.8, 7, 0.4, '🥦', NULL),
('Pimentón', 'Verduras', 'any', 31, 1, 6, 0.3, '🫑', NULL),
-- Lácteos
('Leche Entera', 'Lácteos', 'desayuno', 61, 3.2, 4.8, 3.3, '🥛', NULL),
('Queso Blanco', 'Lácteos', 'any', 250, 18, 3, 19, '🧀', NULL),
('Yogurt Natural', 'Lácteos', 'snack', 59, 3.5, 4.7, 3.3, '🥛', NULL),
-- Grasas
('Aguacate', 'Grasas', 'any', 160, 2, 9, 15, '🥑', NULL),
('Aceite de Oliva', 'Grasas', 'any', 884, 0, 0, 100, '🫒', NULL),
('Mantequilla', 'Grasas', 'any', 717, 0.9, 0.1, 81, '🧈', NULL),
('Maní', 'Grasas', 'snack', 567, 26, 16, 49, '🥜', NULL),
-- Bebidas
('Jugo de Naranja', 'Bebidas', 'desayuno', 45, 0.7, 10, 0.2, '🧃', NULL),
('Refresco', 'Bebidas', 'any', 42, 0, 11, 0, '🥤', NULL),
('Café Negro', 'Bebidas', 'desayuno', 2, 0.3, 0, 0, '☕', NULL)
ON CONFLICT DO NOTHING;
