// ------------------------------------------------------------------
// DB qatorlarini frontend kutgan (eski Firestore hujjati) shaklga
// aylantirish: { id, ...data, <ustunlar> }. Sanalar ISO string bo'lib
// qaytadi (frontendda src/utils/dates.js orqali o'qiladi).
// ------------------------------------------------------------------
import { effectivePerms } from "./permissions.js";

// Profil rasmi manzili. `v` — rasm almashganda brauzer keshini yangilash uchun.
export function avatarUrl(userId, updatedAt) {
  return updatedAt ? `/api/avatars/${userId}?v=${new Date(updatedAt).getTime()}` : null;
}

export function publicUser(u) {
  return {
    uid: u.id,
    email: u.email,
    displayName: u.display_name || "",
    emailVerified: u.email_verified,
    isAdmin: u.is_admin,
    isOwner: u.is_owner,
    adminPerms: effectivePerms(u),
    hasPassword: !!u.password_hash,
    hasGoogle: !!u.google_id,
    avatarUrl: avatarUrl(u.id, u.avatar_updated_at),
    onboarding: u.onboarding || null,
    studyPlan: u.study_plan || null,
    createdAt: u.created_at,
  };
}

export function resultDoc(r) {
  return {
    ...r.data,
    id: r.id,
    uid: r.user_id,
    total: r.total,
    complete: r.complete,
    ...(r.test_id ? { testId: r.test_id } : {}),
    ...(r.session_id ? { sessionId: r.session_id } : {}),
    createdAt: r.created_at,
  };
}

export function leaderboardDoc(r) {
  return {
    id: r.user_id,
    uid: r.user_id,
    name: r.name,
    bestScore: r.best_score,
    avatarUrl: avatarUrl(r.user_id, r.avatar_updated_at),
    updatedAt: r.updated_at,
  };
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
