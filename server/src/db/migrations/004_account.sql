-- ------------------------------------------------------------------
-- Profil rasmi. Rasm baytlari alohida jadvalda — users'dan har so'rovda
-- (SELECT *) o'qiladigan qatorga og'ir blob qo'shilmasin. users'dagi
-- avatar_updated_at — rasm bor-yo'qligi va URL'dagi kesh versiyasi.
-- ------------------------------------------------------------------
ALTER TABLE users ADD COLUMN avatar_updated_at TIMESTAMPTZ;

CREATE TABLE user_avatars (
  user_id    TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  mime       TEXT NOT NULL,
  data       BYTEA NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
