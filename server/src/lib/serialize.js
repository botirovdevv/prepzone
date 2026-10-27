// ------------------------------------------------------------------
// DB qatorlarini frontend kutgan (eski Firestore hujjati) shaklga
// aylantirish: { id, ...data, <ustunlar> }. Sanalar ISO string bo'lib
// qaytadi (frontendda src/utils/dates.js orqali o'qiladi).
// ------------------------------------------------------------------

export function publicUser(u) {
  return {
    uid: u.id,
    email: u.email,
    displayName: u.display_name || "",
    emailVerified: u.email_verified,
    isAdmin: u.is_admin,
    hasPassword: !!u.password_hash,
    hasGoogle: !!u.google_id,
    createdAt: u.created_at,
  };
}

export function resultDoc(r) {
  return {
    ...r.data,
    id: r.id,
    uid: r.user_id,
    total: r.total,
    ...(r.session_id ? { sessionId: r.session_id } : {}),
    createdAt: r.created_at,
  };
}

export function leaderboardDoc(r) {
  return { id: r.user_id, uid: r.user_id, name: r.name, bestScore: r.best_score, updatedAt: r.updated_at };
}

// `code` faqat adminga ko'rsatiladi — oddiy foydalanuvchi kodni
// bilmasdan "code" turidagi testga qo'shila olmasligi kerak.
export function sessionDoc(s, { includeCode = false } = {}) {
  return {
    ...s.meta,
    id: s.id,
    accessType: s.access_type,
    status: s.status,
    scheduledAt: s.scheduled_at,
    createdAt: s.created_at,
    ...(includeCode ? { code: s.code } : {}),
  };
}

export function participantDoc(p) {
  return { ...p.data, uid: p.user_id, joinedAt: p.joined_at, updatedAt: p.updated_at };
}

export function eventDoc(e) {
  return { ...e.data, id: e.id, uid: e.user_id, at: e.at };
}

export function sessionResultDoc(r) {
  return { ...r.data, uid: r.user_id, total: r.total, finishedAt: r.finished_at };
}

export function questionSetDoc(q) {
  return { ...q.data, id: q.id, createdAt: q.created_at, updatedAt: q.updated_at };
}

export function desmosDoc(d) {
  return { ...d.data, id: d.id, order: d.sort_order, createdAt: d.created_at, updatedAt: d.updated_at };
}
