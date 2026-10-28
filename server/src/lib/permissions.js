// ------------------------------------------------------------------
// Admin bo'limlari bo'yicha ruxsatlar. Owner hamma narsaga ega; boshqa
// adminlar faqat owner bergan bo'limlarni boshqaradi.
// ------------------------------------------------------------------

export const ADMIN_PERMS = ["sessions", "sets", "desmos", "analytics", "users"];

export function hasPerm(user, perm) {
  if (!user) return false;
  return user.is_owner || (user.is_admin && (user.admin_perms || []).includes(perm));
}

export function effectivePerms(user) {
  if (user.is_owner) return [...ADMIN_PERMS];
  if (!user.is_admin) return [];
  return ADMIN_PERMS.filter((p) => (user.admin_perms || []).includes(p));
}
