-- ------------------------------------------------------------------
-- Tariflar va to'lovlar.
--
-- users.plan / plan_ends_at — joriy tarif (tez o'qish uchun; har so'rovda
--   req.user bilan birga keladi). Muddat o'tgan bo'lsa tarif "free".
-- subscriptions — tarif berilgan har bir holat (tarix).
-- payments      — Telegram bot orqali karta-to'lov. `amount` — unikal summa
--   (asosiy narx + 1..999 so'm), bank SMS'i bilan aniq moslash uchun.
-- sms_messages  — Android SMS-agent yuborgan bank xabarlari.
-- mistakes      — xatolar daftari (spaced repetition).
-- question_explanations — AI tutor javoblari keshi (savol + til).
-- user_streaks  — kunlik streak va XP.
-- ------------------------------------------------------------------
ALTER TABLE users
  ADD COLUMN plan             TEXT NOT NULL DEFAULT 'free',
  ADD COLUMN plan_ends_at     TIMESTAMPTZ,
  ADD COLUMN telegram_chat_id BIGINT;

CREATE TABLE subscriptions (
  id          BIGSERIAL PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan        TEXT NOT NULL,
  months      INTEGER NOT NULL,
  starts_at   TIMESTAMPTZ NOT NULL,
  ends_at     TIMESTAMPTZ NOT NULL,
  payment_id  TEXT,
  granted_by  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX subscriptions_user_idx ON subscriptions (user_id, created_at DESC);

CREATE TABLE payments (
  id              TEXT PRIMARY KEY,
  user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan            TEXT NOT NULL,
  months          INTEGER NOT NULL,
  base_amount     INTEGER NOT NULL,
  amount          INTEGER NOT NULL,
  -- pending → receipt_sent → approved | rejected; javobsiz qolsa expired
  status          TEXT NOT NULL DEFAULT 'pending',
  tg_chat_id      BIGINT,
  receipt_file_id TEXT,
  receipt_kind    TEXT,
  receipt_at      TIMESTAMPTZ,
  sms_id          BIGINT,
  auto            BOOLEAN NOT NULL DEFAULT FALSE,
  admin_notified  BOOLEAN NOT NULL DEFAULT FALSE,
  decided_by      TEXT,
  decided_at      TIMESTAMPTZ,
  note            TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at      TIMESTAMPTZ NOT NULL
);
CREATE INDEX payments_user_idx ON payments (user_id, created_at DESC);
CREATE INDEX payments_status_idx ON payments (status, created_at DESC);
-- Bir vaqtda kutilayotgan ikki to'lov bir xil summaga ega bo'lmasin.
CREATE UNIQUE INDEX payments_open_amount_idx ON payments (amount)
  WHERE status IN ('pending', 'receipt_sent');

CREATE TABLE sms_messages (
  id          BIGSERIAL PRIMARY KEY,
  sender      TEXT NOT NULL DEFAULT '',
  body        TEXT NOT NULL,
  amount      INTEGER,
  is_income   BOOLEAN NOT NULL DEFAULT FALSE,
  received_at TIMESTAMPTZ NOT NULL,
  device_ref  TEXT,
  payment_id  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX sms_messages_received_idx ON sms_messages (received_at DESC);
-- Agent bir SMS'ni qayta yuborsa (retry) dublikat bo'lmasin.
CREATE UNIQUE INDEX sms_messages_device_ref_idx ON sms_messages (device_ref) WHERE device_ref IS NOT NULL;

CREATE TABLE mistakes (
  user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question_key TEXT NOT NULL,
  source       TEXT NOT NULL DEFAULT '',
  section      TEXT NOT NULL DEFAULT '',
  domain       TEXT NOT NULL DEFAULT '',
  question     JSONB NOT NULL,
  -- 0 → 1 kun, 1 → 3 kun, 2 → 7 kun; 3 marta ketma-ket to'g'ri = o'zlashtirildi
  stage        INTEGER NOT NULL DEFAULT 0,
  due_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  wrong_count  INTEGER NOT NULL DEFAULT 1,
  mastered_at  TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, question_key)
);
CREATE INDEX mistakes_due_idx ON mistakes (user_id, mastered_at, due_at);

CREATE TABLE question_explanations (
  question_hash TEXT NOT NULL,
  lang          TEXT NOT NULL,
  data          JSONB NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (question_hash, lang)
);

CREATE TABLE user_streaks (
  user_id      TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  current      INTEGER NOT NULL DEFAULT 0,
  best         INTEGER NOT NULL DEFAULT 0,
  last_day     TEXT,
  xp           INTEGER NOT NULL DEFAULT 0,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX user_streaks_xp_idx ON user_streaks (xp DESC);
