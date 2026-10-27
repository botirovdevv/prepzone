-- ------------------------------------------------------------------
-- Prepzone — boshlang'ich sxema.
--
-- Firestore hujjatlari erkin tuzilishda edi, shuning uchun har bir
-- jadvalda qidiruv/tartiblash uchun kerakli maydonlar alohida ustun,
-- qolgan hamma narsa esa "data" (JSONB) ichida saqlanadi. Shu tufayli
-- API javoblari frontend kutgan eski hujjat shaklida qaytadi.
-- ------------------------------------------------------------------

CREATE TABLE users (
  id             TEXT PRIMARY KEY,
  email          TEXT NOT NULL,
  password_hash  TEXT,
  google_id      TEXT UNIQUE,
  display_name   TEXT NOT NULL DEFAULT '',
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  is_admin       BOOLEAN NOT NULL DEFAULT FALSE,
  token_version  INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX users_email_lower_idx ON users (lower(email));

-- 6 xonali kodlar: purpose = 'verify' (email tasdiqlash) | 'reset' (parol tiklash)
CREATE TABLE otp_codes (
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  purpose    TEXT NOT NULL,
  code_hash  TEXT NOT NULL,
  email      TEXT NOT NULL,
  attempts   INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, purpose)
);

CREATE TABLE results (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total      INTEGER NOT NULL DEFAULT 0,
  session_id TEXT,
  data       JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX results_user_created_idx ON results (user_id, created_at DESC);

CREATE TABLE leaderboard (
  user_id    TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  best_score INTEGER NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX leaderboard_best_idx ON leaderboard (best_score DESC);

-- meta: title, sections (savollarsiz), createdBy, createdByName
-- content: { sections: [...] } — savollar va to'g'ri javoblar. FAQAT admin
-- va sessiyaga qo'shilgan ishtirokchiga qaytariladi.
CREATE TABLE test_sessions (
  id           TEXT PRIMARY KEY,
  code         TEXT NOT NULL UNIQUE,
  access_type  TEXT NOT NULL DEFAULT 'code',
  status       TEXT NOT NULL DEFAULT 'scheduled',
  scheduled_at TIMESTAMPTZ,
  meta         JSONB NOT NULL DEFAULT '{}'::jsonb,
  content      JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE session_participants (
  session_id TEXT NOT NULL REFERENCES test_sessions(id) ON DELETE CASCADE,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  data       JSONB NOT NULL DEFAULT '{}'::jsonb,
  joined_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (session_id, user_id)
);

CREATE TABLE session_events (
  id         TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES test_sessions(id) ON DELETE CASCADE,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  data       JSONB NOT NULL DEFAULT '{}'::jsonb,
  at         TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX session_events_session_at_idx ON session_events (session_id, at DESC);

CREATE TABLE session_results (
  session_id  TEXT NOT NULL REFERENCES test_sessions(id) ON DELETE CASCADE,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total       INTEGER NOT NULL DEFAULT 0,
  data        JSONB NOT NULL DEFAULT '{}'::jsonb,
  finished_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (session_id, user_id)
);

CREATE TABLE question_sets (
  id         TEXT PRIMARY KEY,
  data       JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE desmos_tutorials (
  id         TEXT PRIMARY KEY,
  sort_order INTEGER NOT NULL DEFAULT 0,
  data       JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
