-- Shikoyat/taklif oynasi (Ctrl+Shift+F) va brauzerdagi JS xatolar logi.
-- O'qish: server/scripts/feedback-log.js

CREATE TABLE feedback_reports (
  id              SERIAL PRIMARY KEY,
  user_id         TEXT REFERENCES users(id) ON DELETE SET NULL,
  message         TEXT NOT NULL,
  page_url        TEXT NOT NULL DEFAULT '',
  user_agent      TEXT NOT NULL DEFAULT '',
  viewport        TEXT NOT NULL DEFAULT '',
  theme           TEXT NOT NULL DEFAULT '',
  lang            TEXT NOT NULL DEFAULT '',
  context         JSONB NOT NULL DEFAULT '{}'::jsonb,
  screenshot      BYTEA,
  screenshot_mime TEXT,
  telegram_ok     BOOLEAN NOT NULL DEFAULT FALSE,
  status          TEXT NOT NULL DEFAULT 'new',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX feedback_reports_created_idx ON feedback_reports (created_at DESC);

CREATE TABLE client_errors (
  fingerprint TEXT PRIMARY KEY,
  message     TEXT NOT NULL,
  stack       TEXT NOT NULL DEFAULT '',
  page_url    TEXT NOT NULL DEFAULT '',
  user_id     TEXT,
  user_agent  TEXT NOT NULL DEFAULT '',
  count       INTEGER NOT NULL DEFAULT 1,
  status      TEXT NOT NULL DEFAULT 'new',
  first_seen  TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX client_errors_last_seen_idx ON client_errors (last_seen DESC);
