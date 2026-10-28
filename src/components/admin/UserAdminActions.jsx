import { useState } from "react";
import { LuBan, LuShieldCheck, LuLockOpen } from "react-icons/lu";
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { ADMIN_PERM_LABELS, useIsAdmin } from "../../hooks/useIsAdmin";
import { Button, inputClass } from "../ui";

// ------------------------------------------------------------------
// Analitika > Foydalanuvchilar: ochilgan qatordagi boshqaruv.
//   - "users" ruxsati bor admin: bloklash / blokdan chiqarish;
//   - owner: admin qilish va bo'lim ruxsatlarini berish.
// Server ham xuddi shu qoidalarni tekshiradi (server/src/routes/admin.js).
// ------------------------------------------------------------------

const PERMS = Object.keys(ADMIN_PERM_LABELS);

export default function UserAdminActions({ user, onUpdated }) {
  const { user: me } = useAuth();
  const { can, isOwner } = useIsAdmin();
  const [perms, setPerms] = useState(user.adminPerms || []);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (user.id === me?.uid || user.isOwner) return null;
  const canBlock = can("users") && (isOwner || !user.isAdmin);
  if (!canBlock && !isOwner) return null;

  const run = async (fn) => {
    setBusy(true);
    setError("");
    try {
      const { user: updated } = await fn();
      setPerms(updated.adminPerms || []);
      onUpdated(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const setBlocked = (blocked) => {
    if (blocked && !window.confirm(`${user.email} bloklansinmi? U darhol saytdan chiqariladi.`)) return;
    run(() => api.patch(`/admin/users/${user.id}/block`, { blocked, reason: reason.trim() || undefined }));
  };

  const savePerms = () => run(() => api.put(`/admin/users/${user.id}/admin`, { perms }));
  const permsChanged =
    perms.length !== (user.adminPerms || []).length || perms.some((p) => !user.adminPerms?.includes(p));

  return (
    <div className="mb-5 grid max-w-3xl gap-4 sm:grid-cols-2" onClick={(e) => e.stopPropagation()}>
      {canBlock && (
        <div className="rounded-2xl border border-[#12213D]/[0.08] bg-white p-4">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-wide text-[#12213D]/45">Bloklash</p>
          {user.blocked ? (
            <>
              <p className="mb-3 text-[13px] text-[#12213D]/70">
                Bloklangan{user.blockedReason ? `: ${user.blockedReason}` : "."}
              </p>
              <Button variant="outline" size="sm" disabled={busy} onClick={() => setBlocked(false)}>
                <LuLockOpen size={14} /> Blokdan chiqarish
              </Button>
            </>
          ) : (
            <>
              <input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                maxLength={300}
                placeholder="Sabab (ixtiyoriy)"
                className={`${inputClass} mb-3 h-9 text-[13px]`}
              />
              <Button variant="danger" size="sm" disabled={busy} onClick={() => setBlocked(true)}>
                <LuBan size={14} /> Bloklash
              </Button>
            </>
          )}
        </div>
      )}

      {isOwner && !user.blocked && (
        <div className="rounded-2xl border border-[#12213D]/[0.08] bg-white p-4">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-wide text-[#12213D]/45">
            Admin ruxsatlari
          </p>
          <div className="mb-3 space-y-1.5">
            {PERMS.map((p) => (
              <label key={p} className="flex cursor-pointer items-center gap-2 text-[13px] text-[#12213D]">
                <input
                  type="checkbox"
                  checked={perms.includes(p)}
                  onChange={(e) => setPerms((prev) => (e.target.checked ? [...prev, p] : prev.filter((x) => x !== p)))}
                  className="h-4 w-4 accent-[#087fd1]"
                />
                {ADMIN_PERM_LABELS[p]}
              </label>
            ))}
          </div>
          <Button size="sm" disabled={busy || !permsChanged} onClick={savePerms}>
            <LuShieldCheck size={14} /> {perms.length || !user.isAdmin ? "Saqlash" : "Adminlikdan olish"}
          </Button>
        </div>
      )}

      {error && <p className="text-[13px] text-red-600 sm:col-span-2">{error}</p>}
    </div>
  );
}
