import { useEffect, useState } from "react";
import { LuUsers } from "react-icons/lu";
import { api } from "../../api/client";
import { routeLabel } from "../../utils/analytics";
import { Badge, Card, CardHeader } from "../ui";

// ------------------------------------------------------------------
// Analitika → "Hozir saytda": oxirgi ~1 daqiqada saytni ochiq tutgan
// odamlar (server/src/lib/presence.js). Har 15 soniyada yangilanadi
// (admin tabi ko'rinib turganda).
// ------------------------------------------------------------------

const REFRESH_MS = 15_000;

function duration(fromIso, now) {
  const min = Math.max(0, Math.floor((now - new Date(fromIso).getTime()) / 60_000));
  if (min < 1) return "hozirgina";
  if (min < 60) return `${min} daq`;
  const h = Math.floor(min / 60);
  return `${h} soat ${min % 60} daq`;
}

export default function OnlineNow() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let alive = true;
    const load = () => {
      if (document.visibilityState !== "visible") return;
      api
        .get("/admin/online")
        .then((d) => alive && (setData(d), setError(false)))
        .catch(() => alive && setError(true));
    };
    load();
    const timer = setInterval(load, REFRESH_MS);
    document.addEventListener("visibilitychange", load);
    return () => {
      alive = false;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", load);
    };
  }, []);

  const now = data ? new Date(data.at).getTime() : Date.now();

  return (
    <Card className="mb-6 overflow-hidden">
      <CardHeader
        title={
          <span className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60 motion-reduce:animate-none" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
            Hozir saytda
          </span>
        }
        subtitle={
          error
            ? "Ma'lumotni olib bo'lmadi — qayta urinilmoqda"
            : data
              ? `${data.users.length} ta user · ${data.guests} ta mehmon (login qilmagan) · har 15 soniyada yangilanadi`
              : "Yuklanmoqda..."
        }
        action={
          <p className="font-display text-[32px] font-extrabold leading-none tabular-nums text-[#12213D]">
            {data ? data.total : "—"}
          </p>
        }
      />
      <div className="px-5 pb-5 pt-4 sm:px-6">
        {data && data.users.length === 0 ? (
          <p className="flex items-center gap-2 py-3 text-sm text-[#12213D]/45">
            <LuUsers size={16} /> Hozir login qilgan user yo'q.
          </p>
        ) : (
          <ul className="divide-y divide-[#12213D]/[0.06]">
            {(data?.users || []).map((u) => (
              <li key={u.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-2.5 text-[13px]">
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 font-semibold text-[#12213D]">
                    <span className="truncate">{u.displayName || u.email.split("@")[0]}</span>
                    {u.isAdmin && <Badge tone="blue">Admin</Badge>}
                  </p>
                  <p className="truncate text-[12px] text-[#12213D]/45">{u.email}</p>
                </div>
                <span className="rounded-lg bg-[#087fd1]/[0.07] px-2 py-1 text-[12px] font-semibold text-[#087fd1]">
                  {routeLabel(u.page)}
                </span>
                <span className="w-24 text-right text-[12px] tabular-nums text-[#12213D]/50" title="Saytda qancha vaqtdan beri">
                  {duration(u.since, now)}
                  {u.tabs > 1 ? ` · ${u.tabs} tab` : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}
