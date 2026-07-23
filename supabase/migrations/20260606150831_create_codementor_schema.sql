/*
# CodeMentor AI – Full Database Schema

## Summary
Sets up all tables for the CodeMentor AI platform: user profiles, chats, messages, 
roadmaps, interview results, and progress tracking. All tables use owner-scoped RLS 
so each user can only access their own data.

## New Tables

1. **profiles** – Extended user info (skill level, goals, languages, GitHub, LeetCode)
2. **chats** – Conversation sessions with agent type and title
3. **messages** – Individual messages inside a chat (user or assistant role)
4. **roadmaps** – Personalized learning roadmaps with JSONB content
5. **interview_results** – Mock interview scores and feedback
6. **progress_reports** – Topic-level progress tracking (scores by topic)
7. **documents** – Uploaded study materials for RAG knowledge base

## Security
- RLS enabled on all tables
- All policies scoped to authenticated users via auth.uid()
- Owner column defaults to auth.uid() so client inserts don't need to pass user_id
*/

-- ===== PROFILES =====
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  username text,
  bio text,
  skill_level text NOT NULL DEFAULT 'beginner' CHECK (skill_level IN ('beginner','intermediate','advanced')),
  goals text[] DEFAULT '{}',
  preferred_languages text[] DEFAULT '{}',
  avatar_url text,
  github_url text,
  leetcode_username text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_profile" ON profiles;
CREATE POLICY "delete_own_profile" ON profiles FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ===== CHATS =====
CREATE TABLE IF NOT EXISTS chats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'New Chat',
  agent_type text NOT NULL DEFAULT 'general' CHECK (agent_type IN ('learning','dsa','review','debug','interview','roadmap','progress','general')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chats_user_id ON chats(user_id);
CREATE INDEX IF NOT EXISTS idx_chats_updated_at ON chats(updated_at DESC);

ALTER TABLE chats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_chats" ON chats;
CREATE POLICY "select_own_chats" ON chats FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_chats" ON chats;
CREATE POLICY "insert_own_chats" ON chats FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_chats" ON chats;
CREATE POLICY "update_own_chats" ON chats FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_chats" ON chats;
CREATE POLICY "delete_own_chats" ON chats FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ===== MESSAGES =====
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id uuid NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user','assistant')),
  content text NOT NULL,
  agent_type text NOT NULL DEFAULT 'general',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_messages" ON messages;
CREATE POLICY "select_own_messages" ON messages FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_messages" ON messages;
CREATE POLICY "insert_own_messages" ON messages FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_messages" ON messages;
CREATE POLICY "update_own_messages" ON messages FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_messages" ON messages;
CREATE POLICY "delete_own_messages" ON messages FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ===== ROADMAPS =====
CREATE TABLE IF NOT EXISTS roadmaps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  goal text NOT NULL,
  content jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_roadmaps_user_id ON roadmaps(user_id);

ALTER TABLE roadmaps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_roadmaps" ON roadmaps;
CREATE POLICY "select_own_roadmaps" ON roadmaps FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_roadmaps" ON roadmaps;
CREATE POLICY "insert_own_roadmaps" ON roadmaps FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_roadmaps" ON roadmaps;
CREATE POLICY "update_own_roadmaps" ON roadmaps FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_roadmaps" ON roadmaps;
CREATE POLICY "delete_own_roadmaps" ON roadmaps FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ===== INTERVIEW RESULTS =====
CREATE TABLE IF NOT EXISTS interview_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  interview_type text NOT NULL,
  score integer NOT NULL CHECK (score BETWEEN 0 AND 100),
  feedback text NOT NULL,
  topics_covered text[] DEFAULT '{}',
  duration_minutes integer DEFAULT 30,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_interview_results_user_id ON interview_results(user_id);

ALTER TABLE interview_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_interviews" ON interview_results;
CREATE POLICY "select_own_interviews" ON interview_results FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_interviews" ON interview_results;
CREATE POLICY "insert_own_interviews" ON interview_results FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_interviews" ON interview_results;
CREATE POLICY "update_own_interviews" ON interview_results FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_interviews" ON interview_results;
CREATE POLICY "delete_own_interviews" ON interview_results FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ===== PROGRESS REPORTS =====
CREATE TABLE IF NOT EXISTS progress_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  topic text NOT NULL,
  score integer NOT NULL DEFAULT 0 CHECK (score BETWEEN 0 AND 100),
  problems_solved integer NOT NULL DEFAULT 0,
  total_time_minutes integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_progress_user_id ON progress_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_topic ON progress_reports(topic);

ALTER TABLE progress_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_progress" ON progress_reports;
CREATE POLICY "select_own_progress" ON progress_reports FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_progress" ON progress_reports;
CREATE POLICY "insert_own_progress" ON progress_reports FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_progress" ON progress_reports;
CREATE POLICY "update_own_progress" ON progress_reports FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_progress" ON progress_reports;
CREATE POLICY "delete_own_progress" ON progress_reports FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ===== DOCUMENTS (RAG) =====
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text,
  file_type text,
  file_size integer,
  processing_status text DEFAULT 'pending' CHECK (processing_status IN ('pending','processing','completed','failed')),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_documents" ON documents;
CREATE POLICY "select_own_documents" ON documents FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_documents" ON documents;
CREATE POLICY "insert_own_documents" ON documents FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_documents" ON documents;
CREATE POLICY "update_own_documents" ON documents FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_documents" ON documents;
CREATE POLICY "delete_own_documents" ON documents FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ===== SEED DEFAULT PROGRESS FOR NEW USERS (function) =====
CREATE OR REPLACE FUNCTION seed_default_progress()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  topics text[] := ARRAY['Arrays','Strings','Linked Lists','Trees','Graphs','Dynamic Programming','Sorting','Binary Search','Recursion','Hashing'];
  t text;
BEGIN
  FOREACH t IN ARRAY topics
  LOOP
    INSERT INTO progress_reports (user_id, topic, score, problems_solved, total_time_minutes)
    VALUES (NEW.user_id, t, 0, 0, 0)
    ON CONFLICT DO NOTHING;
  END LOOP;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_created ON profiles;
CREATE TRIGGER on_profile_created
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION seed_default_progress();
