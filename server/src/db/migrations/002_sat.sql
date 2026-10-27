-- ------------------------------------------------------------------
-- SAT platformasi: statik testlar natijalari (serverda baholanadi),
-- onboarding so'rovnomasi, Study Plan va sayt analitikasi.
-- ------------------------------------------------------------------

-- Foydalanuvchi profili: onboarding javoblari, o'quv rejasi va faollik.
ALTER TABLE users
  ADD COLUMN onboarding   JSONB,
  ADD COLUMN study_plan   JSONB,
  ADD COLUMN last_seen_at TIMESTAMPTZ,
  ADD COLUMN page_views   INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN pages        JSONB NOT NULL DEFAULT '{}'::jsonb;
CREATE INDEX users_last_seen_idx ON users (last_seen_at DESC NULLS LAST);
CREATE INDEX users_created_idx ON users (created_at);

-- Statik SAT test natijalari: qaysi test, to'liqmi, va client yuborgan
-- attempt_id (tarmoq xatosidan keyin qayta yuborilsa dublikat bo'lmaydi).
ALTER TABLE results
  ADD COLUMN test_id    TEXT,
  ADD COLUMN complete   BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN attempt_id TEXT UNIQUE;
CREATE INDEX results_user_test_idx ON results (user_id, test_id) WHERE complete;
CREATE INDEX results_created_idx ON results (created_at);

-- Kunlik sahifa ko'rishlar (date — Toshkent vaqti bo'yicha "YYYY-MM-DD").
CREATE TABLE analytics_pages (
  date  TEXT NOT NULL,
  page  TEXT NOT NULL,
  views INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (date, page)
);

-- Shu kuni faol bo'lgan foydalanuvchilar (kuniga bitta qator).
CREATE TABLE analytics_visitors (
  date    TEXT NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (date, user_id)
);

-- Oddiy kunlik limitlar (masalan, kuniga 15 ta test topshirish).
CREATE TABLE rate_limits (
  day     TEXT NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action  TEXT NOT NULL,
  count   INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, user_id, action)
);
