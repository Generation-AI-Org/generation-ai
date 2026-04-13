-- Generation AI — Profiles Tabelle
-- Im Supabase SQL Editor ausführen

-- ─── profiles ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  university TEXT,
  study_field TEXT,
  ki_level INTEGER CHECK (ki_level >= 1 AND ki_level <= 5),
  interests TEXT[],
  questionnaire_answers JSONB,
  circle_member_id INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── RLS ──────────────────────────────────────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- User kann nur eigenes Profil lesen
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- User kann eigenes Profil updaten
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Service Role kann alles (für API Route)
CREATE POLICY "Service role has full access"
  ON profiles FOR ALL
  USING (auth.role() = 'service_role');

-- ─── updated_at Trigger ───────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_profiles_updated_at();

-- ─── Index ────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
