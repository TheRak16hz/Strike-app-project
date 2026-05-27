CREATE TABLE IF NOT EXISTS exercises_library (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  zone TEXT NOT NULL, 
  muscle TEXT NOT NULL, 
  equipment TEXT NOT NULL, 
  is_compound BOOLEAN DEFAULT FALSE,
  calories_per_rep DECIMAL(8, 2) DEFAULT 0.5,
  description TEXT,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NULL
);

CREATE TABLE IF NOT EXISTS workout_routines (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  days JSONB DEFAULT '[]',
  color TEXT DEFAULT 'var(--primary)',
  icon TEXT DEFAULT '💪',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS routine_exercises (
  id SERIAL PRIMARY KEY,
  routine_id INTEGER REFERENCES workout_routines(id) ON DELETE CASCADE,
  exercise_library_id INTEGER REFERENCES exercises_library(id) ON DELETE CASCADE,
  target_sets INTEGER NOT NULL DEFAULT 3,
  target_reps INTEGER NOT NULL DEFAULT 10,
  target_weight DECIMAL(8, 2) DEFAULT 0,
  order_index INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS workout_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  routine_id INTEGER REFERENCES workout_routines(id) ON DELETE SET NULL,
  date DATE DEFAULT CURRENT_DATE,
  total_calories_burned DECIMAL(8, 2) DEFAULT 0,
  perceived_effort INTEGER DEFAULT 5,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workout_log_exercises (
  id SERIAL PRIMARY KEY,
  log_id INTEGER REFERENCES workout_logs(id) ON DELETE CASCADE,
  routine_exercise_id INTEGER REFERENCES routine_exercises(id) ON DELETE SET NULL,
  actual_sets INTEGER NOT NULL,
  actual_reps INTEGER NOT NULL,
  actual_weight DECIMAL(8, 2) DEFAULT 0
);
