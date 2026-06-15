
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS xp integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS streak integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_active_day date,
  ADD COLUMN IF NOT EXISTS mastered_topics text[] NOT NULL DEFAULT '{}';
