-- ------------------------------------------------------------------
-- Server tomonidagi sessiyalar va QR orqali kirish.
--
-- user_sessions — har bir kirish (qurilma) uchun bitta qator. JWT'dagi
--   `sid` shu qatorga ishora qiladi; qator o'chirilsa sessiya tugaydi.
-- qr_logins     — kompyuterdagi QR so'rovi. Kodlarning faqat hashi saqlanadi.
-- ------------------------------------------------------------------
CREATE TABLE user_sessions (
  id           TEXT PRIMARY KEY,
  user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_agent   TEXT NOT NULL DEFAULT '',
  ip           TEXT NOT NULL DEFAULT '',
  method       TEXT NOT NULL DEFAULT 'password',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Faqat 'legacy' (sid'siz eski token) seanslar uchun: tugatilganda qator
  -- o'chirilmaydi, aks holda eski token keyingi so'rovda qayta tiklanardi.
  revoked      BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE INDEX user_sessions_user_idx ON user_sessions (user_id, last_seen_at DESC);

CREATE TABLE qr_logins (
  id         TEXT PRIMARY KEY,
  scan_hash  TEXT NOT NULL,
  poll_hash  TEXT NOT NULL,
  status     TEXT NOT NULL DEFAULT 'pending',
  user_id    TEXT REFERENCES users(id) ON DELETE CASCADE,
  user_agent TEXT NOT NULL DEFAULT '',
  ip         TEXT NOT NULL DEFAULT '',
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX qr_logins_expires_idx ON qr_logins (expires_at);
