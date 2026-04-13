-- ─────────────────────────────────────────────────────────────────────────────
-- Generation AI — tools-app Datenbankschema
-- Einmalig im Supabase SQL Editor ausführen
-- ─────────────────────────────────────────────────────────────────────────────

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── content_items ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS content_items (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  type          text NOT NULL CHECK (type IN ('tool', 'guide', 'faq')),
  status        text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  title         text NOT NULL,
  slug          text NOT NULL UNIQUE,
  summary       text NOT NULL,
  content       text NOT NULL DEFAULT '',
  category      text NOT NULL,
  tags          text[] NOT NULL DEFAULT '{}',
  use_cases     text[] NOT NULL DEFAULT '{}',
  pricing_model text CHECK (pricing_model IN ('free', 'freemium', 'paid', 'open_source')),
  external_url  text,
  logo_domain   text,
  quick_win     text,
  updated_at    timestamptz NOT NULL DEFAULT now(),
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- ─── chat_sessions ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_sessions (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  metadata   jsonb DEFAULT '{}',
  user_id    uuid REFERENCES auth.users(id) -- NULL = V1 (public), set = V2 (member)
);

-- Add user_id column if table already exists (migration)
ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user ON chat_sessions(user_id);

-- ─── chat_messages ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_messages (
  id                 uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id         uuid NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  user_id            uuid REFERENCES auth.users(id), -- Denormalized for RLS performance
  role               text NOT NULL CHECK (role IN ('user', 'assistant')),
  content            text NOT NULL,
  recommended_slugs  text[] DEFAULT '{}',
  created_at         timestamptz NOT NULL DEFAULT now()
);

-- Add user_id column if table already exists (migration)
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user ON chat_messages(user_id);

-- ─── Indexes ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_content_items_status   ON content_items(status);
CREATE INDEX IF NOT EXISTS idx_content_items_type     ON content_items(type);
CREATE INDEX IF NOT EXISTS idx_content_items_category ON content_items(category);
CREATE INDEX IF NOT EXISTS idx_content_items_slug     ON content_items(slug);
CREATE INDEX IF NOT EXISTS idx_content_items_tags     ON content_items USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_content_items_cases    ON content_items USING GIN(use_cases);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session  ON chat_messages(session_id);

-- ─── RLS ──────────────────────────────────────────────────────────────────────
ALTER TABLE content_items  ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages  ENABLE ROW LEVEL SECURITY;

-- Nur published Items sind öffentlich lesbar
CREATE POLICY "public_read_published"
  ON content_items FOR SELECT
  USING (status = 'published');

-- ─── Hybrid RLS Policies (V1 public, V2 user-isolated) ────────────────────────
-- Per D-01 to D-05 from CONTEXT.md

-- Drop old open policies (safe to run multiple times)
DROP POLICY IF EXISTS "open_chat_sessions_select" ON chat_sessions;
DROP POLICY IF EXISTS "open_chat_sessions_insert" ON chat_sessions;
DROP POLICY IF EXISTS "open_chat_sessions_update" ON chat_sessions;
DROP POLICY IF EXISTS "open_chat_messages_select" ON chat_messages;
DROP POLICY IF EXISTS "open_chat_messages_insert" ON chat_messages;

-- chat_sessions: Hybrid SELECT (D-01)
-- V1 (user_id NULL) = public readable, V2 (user_id set) = owner only
CREATE POLICY "hybrid_chat_sessions_select" ON chat_sessions
FOR SELECT USING (
  user_id IS NULL
  OR (SELECT auth.uid()) = user_id
);

-- chat_sessions: Hybrid INSERT (D-04)
-- Anon can create V1 (user_id NULL), Auth can create V2 (must be owner)
CREATE POLICY "hybrid_chat_sessions_insert" ON chat_sessions
FOR INSERT WITH CHECK (
  (user_id IS NULL)
  OR ((SELECT auth.uid()) IS NOT NULL AND (SELECT auth.uid()) = user_id)
);

-- chat_sessions: UPDATE only owner (D-05)
-- V1 is immutable, V2 only owner can update
CREATE POLICY "hybrid_chat_sessions_update" ON chat_sessions
FOR UPDATE USING (
  (SELECT auth.uid()) = user_id AND user_id IS NOT NULL
);

-- chat_sessions: DELETE only owner (D-05)
CREATE POLICY "hybrid_chat_sessions_delete" ON chat_sessions
FOR DELETE USING (
  (SELECT auth.uid()) = user_id AND user_id IS NOT NULL
);

-- chat_messages: Hybrid SELECT (inherits session visibility)
CREATE POLICY "hybrid_chat_messages_select" ON chat_messages
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM chat_sessions s
    WHERE s.id = chat_messages.session_id
    AND (s.user_id IS NULL OR (SELECT auth.uid()) = s.user_id)
  )
);

-- chat_messages: Hybrid INSERT (D-04)
-- Can only insert into sessions you own or anonymous sessions
CREATE POLICY "hybrid_chat_messages_insert" ON chat_messages
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM chat_sessions s
    WHERE s.id = session_id
    AND (s.user_id IS NULL OR (SELECT auth.uid()) = s.user_id)
  )
);

-- ─── updated_at Trigger ───────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER content_items_updated_at
  BEFORE UPDATE ON content_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER chat_sessions_updated_at
  BEFORE UPDATE ON chat_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
