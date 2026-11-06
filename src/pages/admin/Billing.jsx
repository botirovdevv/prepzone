import { useEffect, useState } from "react";
import { LuWallet, LuCheck, LuX, LuReceipt, LuMessageSquare, LuGift, LuRefreshCw } from "react-icons/lu";
import { api, API_URL } from "../../api/client";
import { Page, PageHeader, Card, CardHeader, Button, Badge, StatTile, PageLoader, inputClass } from "../../components/ui";

// ------------------------------------------------------------------
// Admin: to'lovlar (Telegram bot + SMS-agent), cheklar, SMS log, qo'lda
// tasdiqlash va tarif berish. Admin panel o'zbekcha (tarjima qilinmaydi).
// ------------------------------------------------------------------

const PLAN = { free: "Bepul", sprint: "Sprint", pro: "Pro 1600", elite: "Elite" };
const STATUS = {
  pending: ["Chek kutilmoqda", "ink"],
  receipt_sent: ["Tekshirish kerak", "amber"],
  approved: ["Tasdiqlangan", "emerald"],
  rejected: ["Rad etilgan", "red"],
  expired: ["Muddati o'tgan", "ink"],
};
const FILTERS = [
  ["", "Hammasi"],
  ["receipt_sent", "Tekshirish kerak"],
  ["approved", "Tasdiqlangan"],
  ["pending", "Kutilmoqda"],
  ["rejected", "Rad etilgan"],
];

const sum = (n) => `${Number(n || 0).toLocaleString("ru-RU")} so'm`;
const dt = (d) =>
  d ? new Date(d).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—";

function Grant({ onDone }) {
  const [form, setForm] = useState({ email: "", plan: "pro", months: 1 });
  const [msg, setMsg] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      const r = await api.post("/admin/billing/grant", { ...form, months: Number(form.months) });
      setMsg(`✓ ${PLAN[r.plan]} — ${dt(r.endsAt)} gacha`);
      onDone?.();
    } catch (err) {
      setMsg(err.message);
    }
  };
  return (
    <Card>
      <CardHeader title="Qo'lda tarif berish" subtitle="Naqd to'lov, sovg'a yoki test uchun" />
      <form onSubmit={submit} className="grid gap-3 p-5 sm:grid-cols-[1fr_140px_100px_auto] sm:p-6">
        <input
          className={inputClass}
          type="email"
          required
          placeholder="user@email.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <select className={inputClass} value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value })}>
          <option value="sprint">Sprint</option>
          <option value="pro">Pro 1600</option>
          <option value="elite">Elite</option>
        </select>
        <select className={inputClass} value={form.months} onChange={(e) => setForm({ ...form, months: e.target.value })}>
          {[1, 2, 3, 6, 12].map((m) => (
            <option key={m} value={m}>
              {m} oy
            </option>
          ))}
        </select>
        <Button type="submit">
          <LuGift size={16} /> Berish
        </Button>
        {msg && <p className="text-sm text-[#12213D]/70 sm:col-span-4">{msg}</p>}
      </form>
    </Card>
  );
}

export default function Billing() {
  const [summary, setSummary] = useState(null);
  const [payments, setPayments] = useState(null);
  const [sms, setSms] = useState([]);
  const [filter, setFilter] = useState("receipt_sent");
  const [tab, setTab] = useState("payments");
  const [receipt, setReceipt] = useState(null);

  const load = async () => {
    const [s, p, m] = await Promise.all([
      api.get("/admin/billing/summary"),
      api.get(`/admin/billing/payments${filter ? `?status=${filter}` : ""}`),
      api.get("/admin/billing/sms"),
    ]);
    setSummary(s);
    setPayments(p);
    setSms(m);
  };
  useEffect(() => {
    load().catch(() => setPayments([]));
    const id = setInterval(() => load().catch(() => {}), 20_000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const act = async (id, action) => {
    if (action === "reject" && !window.confirm("To'lovni rad etasizmi?")) return;
    try {
      await api.post(`/admin/billing/payments/${id}/${action}`, {});
      await load();
    } catch (err) {
      alert(err.message);
    }
  };

  if (!summary || !payments) return <PageLoader />;

  return (
    <Page>
      <PageHeader
        eyebrow="Admin"
        icon={LuWallet}
        title="To'lovlar"
        subtitle="Telegram bot orqali kelgan cheklar va SMS-agent yuborgan bank xabarlari. Summa va vaqt mos kelsa to'lov avtomatik tasdiqlanadi."
        actions={
          <Button variant="outline" onClick={() => load()}>
            <LuRefreshCw size={16} /> Yangilash
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Bu oy tushum" value={sum(summary.monthRevenue)} tone="emerald" />
        <StatTile label="Jami tushum" value={sum(summary.totalRevenue)} tone="blue" />
        <StatTile label="Tekshirish kerak" value={summary.waiting} tone="amber" />
        <StatTile
          label="Faol obunalar"
          value={Object.values(summary.activeByPlan).reduce((a, b) => a + b, 0)}
          hint={Object.entries(summary.activeByPlan).map(([k, v]) => `${PLAN[k]}: ${v}`).join(" · ") || "—"}
          tone="ink"
        />
      </div>

      <div className="mb-6">
        <Grant onDone={load} />
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {[
          ["payments", "To'lovlar", LuReceipt],
          ["sms", "SMS log", LuMessageSquare],
        ].map(([id, label, Icon]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
              tab === id ? "bg-[#12213D] text-white" : "border border-[#12213D]/10 bg-white text-[#12213D]/60"
            }`}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {tab === "payments" && (
        <>
          <div className="mb-4 flex flex-wrap gap-1.5">
            {FILTERS.map(([id, label]) => (
              <button
                key={id}
                onClick={() => setFilter(id)}
                className={`rounded-lg px-3 py-1.5 text-[13px] font-semibold ${
                  filter === id ? "bg-[#087fd1] text-white" : "text-[#12213D]/55 hover:bg-[#12213D]/5"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <Card className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-[13px]">
              <thead className="border-b border-[#12213D]/[0.06] text-[11px] uppercase tracking-wide text-[#12213D]/45">
                <tr>
                  <th className="p-3">Vaqt</th>
                  <th className="p-3">Foydalanuvchi</th>
                  <th className="p-3">Tarif</th>
                  <th className="p-3">Summa</th>
                  <th className="p-3">Holat</th>
                  <th className="p-3">SMS</th>
                  <th className="p-3" />
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-[#12213D]/45">
                      To'lov yo'q
                    </td>
                  </tr>
                )}
                {payments.map((p) => {
                  const [label, tone] = STATUS[p.status] || [p.status, "ink"];
                  return (
                    <tr key={p.id} className="border-b border-[#12213D]/[0.04] align-top last:border-0">
                      <td className="p-3 tabular-nums text-[#12213D]/60">
                        {dt(p.createdAt)}
                        {p.receiptAt && <div className="text-[11px]">chek: {dt(p.receiptAt)}</div>}
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-[#12213D]">{p.user.name || "—"}</div>
                        <div className="text-[#12213D]/50">{p.user.email}</div>
                      </td>
                      <td className="p-3">
                        {PLAN[p.plan]} · {p.months} oy
                      </td>
                      <td className="p-3 font-bold tabular-nums">{sum(p.amount)}</td>
                      <td className="p-3">
                        <Badge tone={tone}>{label}</Badge>
                        {p.auto && <div className="mt-1 text-[11px] text-emerald-600">avtomatik</div>}
                      </td>
                      <td className="max-w-[220px] p-3 text-[12px] text-[#12213D]/60">
                        {p.sms ? (
                          <>
                            <div className="line-clamp-2">{p.sms.body}</div>
                            <div className="text-[11px]">{dt(p.sms.receivedAt)}</div>
                          </>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex justify-end gap-1.5">
                          {p.hasReceipt && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setReceipt(`${API_URL}/api/admin/billing/payments/${p.id}/receipt`)}
                            >
                              <LuReceipt size={14} /> Chek
                            </Button>
                          )}
                          {p.status !== "approved" && (
                            <Button size="sm" onClick={() => act(p.id, "approve")}>
                              <LuCheck size={14} />
                            </Button>
                          )}
                          {p.status !== "approved" && p.status !== "rejected" && (
                            <Button size="sm" variant="danger" onClick={() => act(p.id, "reject")}>
                              <LuX size={14} />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        </>
      )}

      {tab === "sms" && (
        <Card className="divide-y divide-[#12213D]/[0.05]">
          {sms.length === 0 && (
            <p className="p-6 text-center text-sm text-[#12213D]/45">
              SMS yo'q. Android SMS-agent sozlanganini tekshiring (sms-agent/README.md).
            </p>
          )}
          {sms.map((s) => (
            <div key={s.id} className="flex items-start gap-4 p-4 text-[13px]">
              <div className="w-24 shrink-0 tabular-nums text-[#12213D]/50">{dt(s.receivedAt)}</div>
              <div className="min-w-0 flex-1">
                <div className="text-[#12213D]/80">{s.body}</div>
                <div className="mt-1 text-[11px] text-[#12213D]/45">{s.sender}</div>
              </div>
              <div className="shrink-0 text-right">
                {s.isIncome ? <div className="font-bold text-emerald-600">+{sum(s.amount)}</div> : <div className="text-[#12213D]/40">kirim emas</div>}
                {s.paymentId ? <Badge tone="emerald">moslandi</Badge> : s.isIncome ? <Badge tone="amber">mos chek yo'q</Badge> : null}
              </div>
            </div>
          ))}
        </Card>
      )}

      {receipt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#12213D]/70 p-4" onClick={() => setReceipt(null)}>
          <div className="max-h-full overflow-auto rounded-2xl bg-white p-2" onClick={(e) => e.stopPropagation()}>
            <img src={receipt} alt="Chek" className="max-h-[85vh] max-w-full rounded-xl" />
            <a href={receipt} target="_blank" rel="noreferrer" className="block p-2 text-center text-sm font-semibold text-[#087fd1]">
              Yangi oynada ochish (PDF bo'lsa)
            </a>
          </div>
        </div>
      )}
    </Page>
  );
}
