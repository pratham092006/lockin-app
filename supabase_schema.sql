-- ═══════════════════════════════════════════════════════════════════════════════
-- LockIn Health App — Supabase Database Setup & Indexes (#36)
-- Run this in your Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── PROFILES ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id),
  user_id      UUID NOT NULL REFERENCES auth.users(id),
  display_name TEXT DEFAULT '',
  age          INT,
  gender       TEXT DEFAULT 'male',
  height_cm    NUMERIC,
  height       NUMERIC,
  weight_kg    NUMERIC,
  weight       NUMERIC,
  goal_weight_kg NUMERIC,
  goal_weight  NUMERIC,
  daily_calorie_goal INT DEFAULT 2200,
  water_intake_goal  INT DEFAULT 8,
  activity_level     NUMERIC DEFAULT 1.55,
  fitness_goal       TEXT DEFAULT 'maintain',
  onboarding_done    BOOLEAN DEFAULT FALSE,
  protein_target     INT DEFAULT 150,
  carbs_target       INT DEFAULT 250,
  fats_target        INT DEFAULT 70,
  water_unit         TEXT DEFAULT 'ml',
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own profile"  ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, user_id, display_name)
  VALUES (NEW.id, NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ── WORKOUT TEMPLATES ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS workout_templates (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id),
  name        TEXT NOT NULL,
  description TEXT DEFAULT '',
  exercises   JSONB DEFAULT '[]',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE workout_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own templates" ON workout_templates FOR ALL USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_workout_templates_user ON workout_templates(user_id);


-- ── WORKOUT LOGS ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS workout_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id),
  template_id     UUID REFERENCES workout_templates(id) ON DELETE SET NULL,
  exercises       JSONB DEFAULT '[]',
  duration        INT DEFAULT 0,
  calories_burned INT DEFAULT 0,
  notes           TEXT DEFAULT '',
  date            DATE DEFAULT CURRENT_DATE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own logs" ON workout_logs FOR ALL USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_workout_logs_user_date ON workout_logs(user_id, date DESC);


-- ── MEALS ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS meals (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id),
  name       TEXT NOT NULL,
  calories   INT DEFAULT 0,
  protein    INT DEFAULT 0,
  carbs      INT DEFAULT 0,
  fats       INT DEFAULT 0,
  meal_type  TEXT DEFAULT 'Other',
  notes      TEXT DEFAULT '',
  date       DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own meals" ON meals FOR ALL USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_meals_user_date ON meals(user_id, date);


-- ── HABITS ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS habits (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id),
  name         TEXT NOT NULL,
  description  TEXT DEFAULT '',
  color        TEXT DEFAULT '#42e355',
  daily_target INT DEFAULT 1,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own habits" ON habits FOR ALL USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_habits_user ON habits(user_id);


-- ── HABIT LOGS ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS habit_logs (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   UUID NOT NULL REFERENCES auth.users(id),
  habit_id  UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  date      DATE NOT NULL DEFAULT CURRENT_DATE,
  completed BOOLEAN DEFAULT TRUE,
  UNIQUE(user_id, habit_id, date)
);

ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own habit_logs" ON habit_logs FOR ALL USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_user_date ON habit_logs(user_id, date);
CREATE INDEX IF NOT EXISTS idx_habit_logs_habit ON habit_logs(habit_id, date);


-- ── WATER LOGS ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS water_logs (
  id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id  UUID NOT NULL REFERENCES auth.users(id),
  date     DATE NOT NULL DEFAULT CURRENT_DATE,
  cups     INT DEFAULT 0,
  UNIQUE(user_id, date)
);

ALTER TABLE water_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own water_logs" ON water_logs FOR ALL USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_water_logs_user_date ON water_logs(user_id, date);


-- ── WEIGHT LOGS ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS weight_logs (
  id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id  UUID NOT NULL REFERENCES auth.users(id),
  date     DATE NOT NULL DEFAULT CURRENT_DATE,
  weight   NUMERIC NOT NULL,
  UNIQUE(user_id, date)
);

ALTER TABLE weight_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own weight_logs" ON weight_logs FOR ALL USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_weight_logs_user_date ON weight_logs(user_id, date);
