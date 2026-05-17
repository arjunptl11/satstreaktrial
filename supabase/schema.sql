-- SATstreak Supabase schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query).
-- Idempotent — safe to re-run.

-- ============================================================
-- 1) profiles (display name)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users view own profile" ON public.profiles;
CREATE POLICY "users view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "users update own profile" ON public.profiles;
CREATE POLICY "users update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- ============================================================
-- 2) user_stats (XP, streak, level — zero defaults)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_stats (
  user_id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  xp INT DEFAULT 0,
  level INT DEFAULT 1,
  streak INT DEFAULT 0,
  best_streak INT DEFAULT 0,
  total_questions INT DEFAULT 0,
  total_correct INT DEFAULT 0,
  questions_today INT DEFAULT 0,
  daily_vocab_done BOOLEAN DEFAULT false,
  last_practice_date DATE,
  daily_goal INT DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users manage own stats" ON public.user_stats;
CREATE POLICY "users manage own stats" ON public.user_stats
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 3) answered_questions (track seen question IDs — no repeats)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.answered_questions (
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  question_id TEXT,
  is_correct BOOLEAN,
  domain TEXT,
  difficulty TEXT,
  answered_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, question_id)
);

CREATE INDEX IF NOT EXISTS answered_questions_user_idx
  ON public.answered_questions (user_id);

ALTER TABLE public.answered_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users manage own answers" ON public.answered_questions;
CREATE POLICY "users manage own answers" ON public.answered_questions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 4) seen_vocab (track seen vocab words — no repeats)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.seen_vocab (
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  word TEXT,
  is_correct BOOLEAN,
  seen_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, word)
);

CREATE INDEX IF NOT EXISTS seen_vocab_user_idx
  ON public.seen_vocab (user_id);

ALTER TABLE public.seen_vocab ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users manage own vocab" ON public.seen_vocab;
CREATE POLICY "users manage own vocab" ON public.seen_vocab
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 5) Trigger: auto-create profile + user_stats on signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'display_name')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_stats (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================================
-- 6) Backfill: ensure existing users have a user_stats row
-- ============================================================
INSERT INTO public.user_stats (user_id)
SELECT id FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_stats)
ON CONFLICT (user_id) DO NOTHING;
