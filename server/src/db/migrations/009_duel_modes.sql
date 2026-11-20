-- SAT Duel vaqt rejimlari (bullet / blitz / rapid / classic) va SAT Rush.
-- Har bir reyting turi alohida ELO (chess.com kabi). Mavjud reytinglar — "classic".

ALTER TABLE duel_ratings ADD COLUMN category TEXT NOT NULL DEFAULT 'classic';
ALTER TABLE duel_ratings DROP CONSTRAINT duel_ratings_pkey;
ALTER TABLE duel_ratings ADD PRIMARY KEY (user_id, category);
DROP INDEX IF EXISTS duel_ratings_rating_idx;
CREATE INDEX duel_ratings_cat_rating_idx ON duel_ratings (category, rating DESC);

ALTER TABLE duel_matches ADD COLUMN mode TEXT NOT NULL DEFAULT 'classic';

-- SAT Rush (yakka): mode = rush3 | rush5 | survival.
CREATE TABLE rush_runs (
  id         BIGSERIAL PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mode       TEXT NOT NULL,
  score      INTEGER NOT NULL,
  strikes    INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX rush_runs_mode_score_idx ON rush_runs (mode, score DESC);
CREATE INDEX rush_runs_user_idx ON rush_runs (user_id, mode, score DESC);
