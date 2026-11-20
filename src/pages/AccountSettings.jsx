import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import {
  LuUser,
  LuLockKeyhole,
  LuCheck,
  LuMail,
  LuSettings,
  LuCamera,
  LuTrash2,
  LuLink,
  LuMonitorSmartphone,
  LuRotateCcw,
  LuTriangleAlert,
  LuKeyRound,
  LuCalendar,
  LuSunMoon,
} from "react-icons/lu";
import { useAuth, CONFIRM_WORD } from "../context/AuthContext";
import { Page, PageHeader, Card, CardHeader, Button, Field, Badge, inputClass, PageLoader } from "../components/ui";
import Avatar from "../components/Avatar";
import ThemeToggle from "../components/ThemeToggle";
import ConfirmDialog from "../components/ConfirmDialog";
import PasswordStrength from "../components/PasswordStrength";
import { checkPassword } from "../utils/passwordPolicy";
import { compressAvatar } from "../utils/imageCompress";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

const SECTIONS = [
  { id: "profil", label: "Profil", icon: LuUser },
  { id: "korinish", label: "Ko'rinish", icon: LuSunMoon },
  { id: "xavfsizlik", label: "Xavfsizlik", icon: LuLockKeyhole },
  { id: "hisoblar", label: "Ulangan hisoblar", icon: LuLink },
  { id: "xavfli-zona", label: "Xavfli zona", icon: LuTriangleAlert },
];

function formatJoined(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("uz-UZ", { year: "numeric", month: "long", day: "numeric" });
}

export default function AccountSettings() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [loading, user, navigate]);

  if (loading || !user) return <PageLoader />;

  const displayName = user.displayName || user.email?.split("@")[0] || "Foydalanuvchi";

  return (
    <Page>
      <PageHeader
        eyebrow="Hisob"
        icon={LuSettings}
        title="Sozlamalar"
        subtitle="Profil, xavfsizlik va hisobingizga oid barcha sozlamalar shu yerda."
      />

      <div className="grid items-start gap-6 lg:grid-cols-[240px_1fr]">
        {/* Chap ustun: profil xulosasi va bo'limlar */}
        <aside className="space-y-4 lg:sticky lg:top-6">
          <Card className="hidden p-5 lg:block">
            <Avatar user={user} name={displayName} className="h-14 w-14 rounded-2xl bg-night text-lg" />
            <p className="mt-3 truncate font-display text-[15px] font-bold text-ink">{displayName}</p>
            <p className="mt-0.5 truncate text-[13px] text-ink/50">{user.email}</p>
            {user.createdAt && (
              <p className="mt-3 flex items-center gap-1.5 text-xs text-ink/40">
                <LuCalendar size={12} /> {formatJoined(user.createdAt)} dan beri
              </p>
            )}
          </Card>
          <nav className="-mx-5 flex gap-2 overflow-x-auto px-5 [scrollbar-width:none] lg:mx-0 lg:flex-col lg:gap-0.5 lg:px-0">
            {SECTIONS.map(({ id, label, icon: Icon }) => (
              <button
                type="button"
                key={id}
                onClick={() => scrollTo(id)}
                className={`flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2 text-[13px] font-semibold transition lg:py-2.5 ${
                  id === "xavfli-zona"
                    ? "bg-surface text-red-600/80 ring-1 ring-ink/[0.07] hover:text-red-600 lg:bg-transparent lg:ring-0 lg:hover:bg-red-50"
                    : "bg-surface text-ink/60 ring-1 ring-ink/[0.07] hover:text-ink lg:bg-transparent lg:ring-0 lg:hover:bg-surface"
                }`}
              >
                <Icon size={15} /> {label}
              </button>
            ))}
          </nav>
        </aside>

        <div className="space-y-6">
          <ProfileSection user={user} displayName={displayName} />
          <AppearanceSection />
          <SecuritySection user={user} />
          <AccountsSection user={user} />
          <DangerSection user={user} />
        </div>
      </div>
    </Page>
  );
}

// ------------------------------------------------------------------
// Ko'rinish: Yorug' / Qorong'i / Auto (tizim sozlamasiga ergashadi)
// ------------------------------------------------------------------
function AppearanceSection() {
  return (
    <Card id="korinish" className="scroll-mt-6">
      <CardHeader
        title="Ko'rinish"
        subtitle="Auto rejimida sayt qurilmangizning yorug'/qorong'i sozlamasiga ergashadi."
      />
      <div className="px-5 pb-6 pt-4 sm:px-6">
        <ThemeToggle />
      </div>
    </Card>
  );
}

// ------------------------------------------------------------------
// Profil: rasm, ism, email
// ------------------------------------------------------------------
function ProfileSection({ user, displayName }) {
  const { updateDisplayName, uploadAvatar, removeAvatar } = useAuth();
  const fileRef = useRef(null);

  const [name, setName] = useState(user.displayName || "");
  const [nameSaving, setNameSaving] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);
  const [nameError, setNameError] = useState("");

  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoError, setPhotoError] = useState("");

  const handleNameSubmit = async (e) => {
    e.preventDefault();
    setNameError("");
    setNameSaved(false);
    if (!name.trim()) {
      setNameError("Ism bo'sh bo'lishi mumkin emas.");
      return;
    }
    setNameSaving(true);
    try {
      await updateDisplayName(name.trim());
      setNameSaved(true);
      setTimeout(() => setNameSaved(false), 2500);
    } catch {
      setNameError("Xatolik yuz berdi. Qaytadan urinib ko'ring.");
    } finally {
      setNameSaving(false);
    }
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setPhotoError("");
    if (file.size > 15 * 1024 * 1024) {
      setPhotoError("Rasm hajmi 15 MB dan oshmasligi kerak.");
      return;
    }
    setPhotoBusy(true);
    try {
      await uploadAvatar(await compressAvatar(file));
    } catch (err) {
      setPhotoError(err.message || "Rasmni yuklab bo'lmadi.");
    } finally {
      setPhotoBusy(false);
    }
  };

  const handleRemove = async () => {
    setPhotoError("");
    setPhotoBusy(true);
    try {
      await removeAvatar();
    } catch (err) {
      setPhotoError(err.message || "Rasmni o'chirib bo'lmadi.");
    } finally {
      setPhotoBusy(false);
    }
  };

  return (
    <Card as="form" id="profil" onSubmit={handleNameSubmit} className="scroll-mt-6">
      <CardHeader title="Profil" subtitle="Ismingiz va rasmingiz reyting va natijalarda ko'rinadi." />
      <div className="space-y-5 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative w-fit">
            <Avatar user={user} name={displayName} className="h-24 w-24 rounded-3xl bg-night text-2xl" />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={photoBusy}
              aria-label="Rasm yuklash"
              className="absolute -bottom-1.5 -right-1.5 flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-white bg-accent text-white transition hover:bg-accent-press disabled:opacity-60"
            >
              <LuCamera size={15} />
            </button>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink">Profil rasmi</p>
            <p className="mt-0.5 text-[13px] text-ink/50">JPG, PNG yoki WEBP. Kvadrat shaklda kesiladi.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button type="button" size="sm" variant="outline" onClick={() => fileRef.current?.click()} disabled={photoBusy}>
                <LuCamera size={14} /> {photoBusy ? "Yuklanmoqda..." : user.avatarUrl ? "Almashtirish" : "Rasm yuklash"}
              </Button>
              {user.avatarUrl && (
                <Button type="button" size="sm" variant="ghost" onClick={handleRemove} disabled={photoBusy}>
                  <LuTrash2 size={14} /> O'chirish
                </Button>
              )}
            </div>
            {photoError && <p className="mt-2 text-sm text-red-600">{photoError}</p>}
          </div>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFile} />
        </div>

        <div className="h-px bg-ink/[0.06]" />

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="To'liq ism">
            <input type="text" maxLength={60} value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Email" hint="Email manzilni o'zgartirib bo'lmaydi.">
            <div className="relative">
              <LuMail size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/30" />
              <input type="email" value={user.email || ""} disabled className={`${inputClass} cursor-not-allowed pl-10`} />
            </div>
          </Field>
        </div>
        {nameError && <p className="text-sm text-red-600">{nameError}</p>}
      </div>
      <div className="flex justify-end border-t border-ink/[0.06] px-5 py-4 sm:px-6">
        <Button type="submit" disabled={nameSaving || name.trim() === (user.displayName || "")}>
          {nameSaved ? (
            <>
              <LuCheck size={16} /> Saqlandi
            </>
          ) : nameSaving ? (
            "Saqlanmoqda..."
          ) : (
            "Saqlash"
          )}
        </Button>
      </div>
    </Card>
  );
}

// ------------------------------------------------------------------
// Xavfsizlik: parol va sessiyalar
// ------------------------------------------------------------------
function SecuritySection({ user }) {
  const { changePassword, revokeOtherSessions } = useAuth();
  const hasPassword = user.hasPassword;

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);
  const [pwError, setPwError] = useState("");

  const [revokeBusy, setRevokeBusy] = useState(false);
  const [revokeDone, setRevokeDone] = useState(false);
  const [revokeError, setRevokeError] = useState("");

  const pwCheck = checkPassword(newPassword, { email: user.email || "", name: user.displayName || "" });

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwError("");
    setPwSaved(false);
    if (!pwCheck.valid) {
      setPwError("Yangi parol xavfsizlik talablariga javob bermaydi.");
      return;
    }
    if (hasPassword && newPassword === currentPassword) {
      setPwError("Yangi parol joriy paroldan farq qilishi kerak.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("Yangi parollar mos kelmadi.");
      return;
    }
    setPwSaving(true);
    try {
      await changePassword(hasPassword ? currentPassword : undefined, newPassword);
      setPwSaved(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPwSaved(false), 2500);
    } catch (err) {
      setPwError(mapPasswordError(err.code));
    } finally {
      setPwSaving(false);
    }
  };

  const handleRevoke = async () => {
    setRevokeError("");
    setRevokeBusy(true);
    try {
      await revokeOtherSessions();
      setRevokeDone(true);
      setTimeout(() => setRevokeDone(false), 3000);
    } catch (err) {
      setRevokeError(err.message || "Xatolik yuz berdi.");
    } finally {
      setRevokeBusy(false);
    }
  };

  return (
    <Card id="xavfsizlik" className="scroll-mt-6">
      <form onSubmit={handlePasswordSubmit}>
        <CardHeader
          title={hasPassword ? "Parolni almashtirish" : "Parol o'rnatish"}
          subtitle={
            hasPassword
              ? "Kamida 10 ta belgi: katta va kichik harf, raqam va maxsus belgi."
              : "Siz Google orqali kirgansiz. Parol o'rnatsangiz, email va parol bilan ham kira olasiz."
          }
          action={<LuKeyRound size={18} className="text-ink/30" />}
        />
        <div className="space-y-4 p-5 sm:p-6">
          {hasPassword && (
            <Field label="Joriy parol">
              <input
                type="password"
                required
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={inputClass}
                placeholder="••••••••"
              />
            </Field>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Yangi parol">
              <input
                type="password"
                required
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={inputClass}
                placeholder="Kamida 10 ta belgi"
              />
            </Field>
            <Field label="Yangi parolni tasdiqlang">
              <input
                type="password"
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputClass}
                placeholder="••••••••"
              />
            </Field>
          </div>
          <PasswordStrength check={pwCheck} show={newPassword.length > 0} />
          {pwError && <p className="text-sm text-red-600">{pwError}</p>}
        </div>
        <div className="flex justify-end border-t border-ink/[0.06] px-5 py-4 sm:px-6">
          <Button type="submit" variant="dark" disabled={pwSaving || !pwCheck.valid || newPassword !== confirmPassword}>
            {pwSaved ? (
              <>
                <LuCheck size={16} /> Saqlandi
              </>
            ) : pwSaving ? (
              "Saqlanmoqda..."
            ) : hasPassword ? (
              "Parolni yangilash"
            ) : (
              "Parol o'rnatish"
            )}
          </Button>
        </div>
      </form>

      <SettingRow
        icon={LuMonitorSmartphone}
        title="Barcha qurilmalardan chiqish"
        text="Telefon yoki kompyuter yo'qolsa foydali. Boshqa qurilmalardagi kirishlar bekor qilinadi, shu qurilmada qolasiz."
        error={revokeError}
        action={
          <Button type="button" size="sm" variant="outline" onClick={handleRevoke} disabled={revokeBusy || revokeDone}>
            {revokeDone ? (
              <>
                <LuCheck size={14} /> Chiqarildi
              </>
            ) : revokeBusy ? (
              "Bajarilmoqda..."
            ) : (
              "Chiqish"
            )}
          </Button>
        }
      />
    </Card>
  );
}

// ------------------------------------------------------------------
// Ulangan hisoblar: Google va email/parol
// ------------------------------------------------------------------
function AccountsSection({ user }) {
  const [error, setError] = useState("");

  return (
    <Card id="hisoblar" className="scroll-mt-6">
      <CardHeader title="Ulangan hisoblar" subtitle="Hisobingizga qaysi usullar bilan kirish mumkin." />
      <div className="mt-4">
        <SettingRow
          icon={GoogleIcon}
          title="Google"
          text={user.hasGoogle ? "Google hisobingiz orqali bir bosishda kirasiz." : "Google hisobini ulab, tezroq kiring."}
          action={
            user.hasGoogle ? (
              <Badge tone="emerald" icon={LuCheck}>
                Ulangan
              </Badge>
            ) : GOOGLE_CLIENT_ID ? (
              <LinkGoogleButton onError={setError} />
            ) : (
              <Badge tone="ink">Ulanmagan</Badge>
            )
          }
          error={error}
        />
        <SettingRow
          icon={LuMail}
          title="Email va parol"
          text={user.email}
          action={
            user.hasPassword ? (
              <Badge tone="emerald" icon={LuCheck}>
                O'rnatilgan
              </Badge>
            ) : (
              <Button size="sm" variant="outline" type="button" onClick={() => scrollTo("xavfsizlik")}>
                Parol o'rnatish
              </Button>
            )
          }
        />
      </div>
    </Card>
  );
}

function LinkGoogleButton({ onError }) {
  const { linkGoogle } = useAuth();
  const [busy, setBusy] = useState(false);

  const start = useGoogleLogin({
    flow: "implicit",
    scope: "openid email profile",
    onSuccess: async (tokenResponse) => {
      try {
        await linkGoogle(tokenResponse.access_token);
        onError("");
      } catch (err) {
        onError(err.message || "Google'ni ulab bo'lmadi.");
      } finally {
        setBusy(false);
      }
    },
    onError: () => {
      setBusy(false);
      onError("Google'ni ulab bo'lmadi. Qaytadan urinib ko'ring.");
    },
    onNonOAuthError: (err) => {
      setBusy(false);
      if (err?.type === "popup_failed_to_open") {
        onError("Brauzer Google oynasini ochishga ruxsat bermadi. Popup'larga ruxsat bering.");
      }
    },
  });

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      disabled={busy}
      onClick={() => {
        setBusy(true);
        start();
      }}
    >
      <LuLink size={14} /> {busy ? "Ulanmoqda..." : "Ulash"}
    </Button>
  );
}

// ------------------------------------------------------------------
// Xavfli zona: progressni tiklash va hisobni o'chirish
// ------------------------------------------------------------------
function DangerSection({ user }) {
  const { resetProgress, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const [dialog, setDialog] = useState(null); // "reset" | "delete" | null
  const [resetDone, setResetDone] = useState(false);

  return (
    <Card id="xavfli-zona" className="scroll-mt-6 border-danger/25">
      <CardHeader title="Xavfli zona" subtitle="Bu amallarni ortga qaytarib bo'lmaydi." />
      <div className="mt-4">
        <SettingRow
          icon={LuRotateCcw}
          tone="red"
          title="Progressni tiklash"
          text="Barcha test natijalari, reytingdagi o'rningiz va Study Plan o'chiriladi. Hisobingiz qoladi."
          action={
            <Button type="button" size="sm" variant="danger" onClick={() => setDialog("reset")} disabled={resetDone}>
              {resetDone ? (
                <>
                  <LuCheck size={14} /> Tiklandi
                </>
              ) : (
                "Tiklash"
              )}
            </Button>
          }
        />
        <SettingRow
          icon={LuTrash2}
          tone="red"
          title="Hisobni o'chirish"
          text="Hisobingiz va unga tegishli barcha ma'lumotlar butunlay o'chiriladi."
          action={
            <Button type="button" size="sm" variant="danger" onClick={() => setDialog("delete")}>
              O'chirish
            </Button>
          }
        />
      </div>

      <ConfirmDialog
        open={dialog === "reset"}
        title="Progressni tiklaysizmi?"
        description="Barcha test natijalaringiz, reytingdagi o'rningiz va Study Plan o'chiriladi. Buni ortga qaytarib bo'lmaydi."
        confirmLabel="Progressni tiklash"
        confirmWord={CONFIRM_WORD}
        askPassword={user.hasPassword}
        onClose={() => setDialog(null)}
        onConfirm={async ({ password }) => {
          await resetProgress(password || undefined);
          setDialog(null);
          setResetDone(true);
        }}
      />
      <ConfirmDialog
        open={dialog === "delete"}
        title="Hisobni o'chirasizmi?"
        description="Hisobingiz, natijalaringiz va barcha sozlamalaringiz butunlay o'chiriladi. Buni ortga qaytarib bo'lmaydi."
        confirmLabel="Hisobni o'chirish"
        confirmWord={CONFIRM_WORD}
        askPassword={user.hasPassword}
        onClose={() => setDialog(null)}
        onConfirm={async ({ password }) => {
          await deleteAccount(password || undefined);
          navigate("/", { replace: true });
        }}
      />
    </Card>
  );
}

// ------------------------------------------------------------------
// Umumiy qism: ikonka + matn + o'ngda amal
// ------------------------------------------------------------------
function SettingRow({ icon: Icon, tone = "ink", title, text, action, error }) {
  return (
    <div className="border-t border-ink/[0.06] px-5 py-4 sm:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
              tone === "red" ? "bg-red-500/10 text-red-600" : "bg-ink/[0.05] text-ink/60"
            }`}
          >
            <Icon size={16} />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink">{title}</p>
            <p className="mt-0.5 break-words text-[13px] leading-relaxed text-ink/50">{text}</p>
          </div>
        </div>
        <div className="shrink-0 pl-12 sm:pl-0">{action}</div>
      </div>
      {error && <p className="mt-2 pl-12 text-sm text-red-600">{error}</p>}
    </div>
  );
}

function GoogleIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
    </svg>
  );
}

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function mapPasswordError(code) {
  switch (code) {
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Joriy parol noto'g'ri.";
    case "auth/too-many-requests":
      return "Juda ko'p urinish. Birozdan keyin qayta urinib ko'ring.";
    case "auth/weak-password":
    case "auth/password-does-not-meet-requirements":
      return "Yangi parol xavfsizlik talablariga javob bermaydi.";
    default:
      return "Xatolik yuz berdi. Qaytadan urinib ko'ring.";
  }
}
