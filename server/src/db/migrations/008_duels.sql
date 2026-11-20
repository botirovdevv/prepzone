-- SAT Duel — 1v1 jonli bellashuv.
-- duel_ratings — har bir o'yinchining Duel reytingi (ELO, 1000 dan boshlanadi).
-- duel_matches — tugagan janglar (tarix, juftlik limiti, tahlil).

CREATE TABLE duel_ratings (
  user_id    TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  rating     INTEGER NOT NULL DEFAULT 1000,
  wins       INTEGER NOT NULL DEFAULT 0,
  losses     INTEGER NOT NULL DEFAULT 0,
  draws      INTEGER NOT NULL DEFAULT 0,
  best       INTEGER NOT NULL DEFAULT 1000,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX duel_ratings_rating_idx ON duel_ratings (rating DESC);

CREATE TABLE duel_matches (
  id           BIGSERIAL PRIMARY KEY,
  code         TEXT NOT NULL,
  section      TEXT NOT NULL,
  player_a     TEXT REFERENCES users(id) ON DELETE SET NULL,
  player_b     TEXT REFERENCES users(id) ON DELETE SET NULL,
  score_a      INTEGER NOT NULL DEFAULT 0,
  score_b      INTEGER NOT NULL DEFAULT 0,
  -- 'a' | 'b' | 'draw'
  winner       TEXT NOT NULL,
  -- a o'yinchi reytingiga o'zgarish (b uchun teskari); reytingsiz jangda 0
  rating_delta INTEGER NOT NULL DEFAULT 0,
  rated        BOOLEAN NOT NULL DEFAULT TRUE,
  forfeit      BOOLEAN NOT NULL DEFAULT FALSE,
  questions    JSONB NOT NULL,
  answers      JSONB NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX duel_matches_a_idx ON duel_matches (player_a, created_at DESC);
CREATE INDEX duel_matches_b_idx ON duel_matches (player_b, created_at DESC);
