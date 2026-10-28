-- ------------------------------------------------------------------
-- Admin rollari va bloklash.
--
-- is_owner    — to'liq huquq: adminlarni tayinlaydi va ruxsatlarini beradi.
-- admin_perms — owner bo'lmagan adminga berilgan bo'limlar
--               (sessions | sets | desmos | analytics | users).
-- is_admin    — admin panelga kira oladi (owner yoki kamida bitta ruxsat).
-- blocked_at  — bloklangan user tizimga kira olmaydi.
-- ------------------------------------------------------------------
ALTER TABLE users
  ADD COLUMN is_owner       BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN admin_perms    TEXT[]  NOT NULL DEFAULT '{}',
  ADD COLUMN blocked_at     TIMESTAMPTZ,
  ADD COLUMN blocked_reason TEXT;

-- Hozirgi adminlar avvalgidek to'liq huquqni saqlaydi.
UPDATE users SET is_owner = TRUE WHERE is_admin;
