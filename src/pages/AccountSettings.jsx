import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import {
  LuUser,
  LuLockKeyhole,
  LuCheck,
  LuMail,
  LuCamera,
  LuTrash2,
  LuLink,
  LuMonitorSmartphone,
  LuMonitor,
  LuSmartphone,
  LuTablet,
  LuRotateCcw,
  LuTriangleAlert,
  LuCalendar,
  LuSunMoon,
  LuSun,
  LuMoon,
  LuLanguages,
  LuLogOut,
} from "react-icons/lu";
import { useAuth } from "../context/AuthContext";
import { formatDate, translate, useI18n } from "../i18n";
import { useTheme } from "../context/ThemeContext";
import {
  Page,
  PageHeader,
  Button,
  Field,
  Badge,
  Skeleton,
  inputClass,
  PageLoader,
  ListGroup,
  ListRow,
  SectionTitle,
  SegmentedControl,
} from "../components/ui";
import Avatar from "../components/Avatar";
import ConfirmDialog from "../components/ConfirmDialog";
import PasswordStrength from "../components/PasswordStrength";
import { checkPassword } from "../utils/passwordPolicy";
import { compressAvatar } from "../utils/imageCompress";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

const SECTIONS = [
  { id: "profil", icon: LuUser },
  { id: "korinish", icon: LuSunMoon },
  { id: "xavfsizlik", icon: LuLockKeyhole },
  { id: "seanslar", icon: LuMonitorSmartphone },
  { id: "hisoblar", icon: LuLink },
  { id: "xavfli-zona", icon: LuTriangleAlert },
];

function formatJoined(iso) {
  if (!iso) return "";
  return formatDate(iso, { year: "numeric", month: "long", day: "numeric" });
}

export default function AccountSettings() {
  const { user, loading } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [loading, user, navigate]);

  if (loading || !user) return <PageLoader />;

  const displayName = user.displayName || user.email?.split("@")[0] || t("nav.userFallback");

  return (
    <Page>
      <PageHeader title={t("account.title")} subtitle={t("account.subtitle")} />

      <div className="grid items-start gap-8 lg:grid-cols-[220px_minmax(0,1fr)] xl:gap-12">
        {/* Kompyuter: bo'limlar ro'yxati (sticky). Telefonda — oddiy uzun sahifa. */}
        <nav aria-label={t("account.title")} className="sticky top-6 hidden space-y-0.5 lg:block">
          {SECTIONS.map(({ id, icon: Icon }) => (
            <button
              type="button"
              key={id}
              onClick={() => scrollTo(id)}
              className={`flex h-9 w-full items-center gap-3 rounded-[10px] px-2.5 text-left text-[15px] transition-colors hover:bg-ink/[0.05] ${
                id === "xavfli-zona" ? "text-danger" : "text-ink"
              }`}
            >
              <Icon size={17} className={id === "xavfli-zona" ? "text-danger" : "text-ink-2"} />
              {t(`account.sections.${id}`)}
            </button>
          ))}
        </nav>

        <div className="mx-auto w-full max-w-2xl space-y-10 lg:mx-0">
          <ProfileSection user={user} displayName={displayName} />
          <AppearanceSection />
          <SecuritySection user={user} />
          <SessionsSection user={user} />
          <AccountsSection user={user} />
          <SignOutSection />
          <DangerSection user={user} />
        </div>
      </div>
    </Page>
  );
}

// Bo'lim: kichik sarlavha + guruhlangan karta (+ ixtiyoriy izoh pastda).
function Section({ id, title, footer, children, className }) {
  return (
    <section id={id} className="scroll-mt-24 lg:scroll-mt-6">
      <SectionTitle>{title}</SectionTitle>
      <ListGroup className={className}>{children}</ListGroup>
      {footer && <p className="mt-2 px-4 text-[13px] leading-[18px] text-ink-2">{footer}</p>}
    </section>
  );
}

// Chiqish — sidebar'dan shu yerga ko'chdi.
function SignOutSection() {
  const { logout } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  return (
    <section>
      <ListGroup>
        <ListRow
          icon={LuLogOut}
          iconTone="gray"
          title={busy ? t("account.signOut.busy") : t("account.signOut.title")}
          destructive
          chevron={false}
          onClick={async () => {
            setBusy(true);
            try {
              await logout();
              navigate("/");
            } finally {
              setBusy(false);
            }
          }}
        />
      </ListGroup>
    </section>
  );
}

// ------------------------------------------------------------------
// Ko'rinish: Yorug' / Qorong'i / Auto (tizim sozlamasiga ergashadi)
// ------------------------------------------------------------------
function AppearanceSection() {
  const { t, lang, setLang } = useI18n();
  const { theme, setTheme } = useTheme();
  const themeOptions = [
    { value: "light", label: t("account.theme.light"), icon: LuSun },
    { value: "dark", label: t("account.theme.dark"), icon: LuMoon },
    { value: "system", label: t("account.theme.system"), icon: LuMonitor },
  ];
  const langOptions = [
    { value: "uz", label: "O'zbekcha" },
    { value: "en", label: "English" },
  ];
  return (
    <Section id="korinish" title={t("account.sections.korinish")} footer={t("account.appearance.subtitle")}>
      <PreferenceRow icon={LuSunMoon} tone="blue" title={t("account.appearance.theme")}>
        <SegmentedControl
          label={t("account.appearance.theme")}
          options={themeOptions}
          value={theme}
          onChange={setTheme}
          className="w-full sm:w-auto"
        />
      </PreferenceRow>
      <PreferenceRow icon={LuLanguages} tone="purple" title={t("account.appearance.language")}>
        <SegmentedControl
          label={t("account.appearance.language")}
          options={langOptions}
          value={lang}
          onChange={setLang}
          className="w-full sm:w-auto"
        />
      </PreferenceRow>
    </Section>
  );
}

// Sozlama qatori: chapda ikonka + nom, o'ngda boshqaruv (telefonda pastga tushadi).
function PreferenceRow({ icon: Icon, tone, title, children }) {
  return (
    <div className="flex flex-col gap-3 border-b border-ink/[0.08] px-4 py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <span className="flex items-center gap-3">
        <span className={`flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[8px] text-white ${tone === "purple" ? "bg-purple" : "bg-accent"}`}>
          <Icon size={17} />
        </span>
        <span className="text-[16px] text-ink">{title}</span>
      </span>
      {children}
    </div>
  );
}

// ------------------------------------------------------------------
// Profil: rasm, ism, email
// ------------------------------------------------------------------
function ProfileSection({ user, displayName }) {
  const { updateDisplayName, uploadAvatar, removeAvatar } = useAuth();
  const { t } = useI18n();
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
      setNameError(t("account.profile.nameEmpty"));
      return;
    }
    setNameSaving(true);
    try {
      await updateDisplayName(name.trim());
      setNameSaved(true);
      setTimeout(() => setNameSaved(false), 2500);
    } catch {
      setNameError(t("common.error"));
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
      setPhotoError(t("account.profile.photoTooBig"));
      return;
    }
    setPhotoBusy(true);
    try {
      await uploadAvatar(await compressAvatar(file));
    } catch (err) {
      setPhotoError(err.message || t("account.profile.uploadFailed"));
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
      setPhotoError(err.message || t("account.profile.removeFailed"));
    } finally {
      setPhotoBusy(false);
    }
  };

  return (
    <section id="profil" className="scroll-mt-24 lg:scroll-mt-6">
    <SectionTitle>{t("account.profile.title")}</SectionTitle>
    <ListGroup as="form" onSubmit={handleNameSubmit}>
      <div className="space-y-5 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative w-fit">
            <Avatar user={user} name={displayName} className="h-20 w-20 rounded-full bg-ink-3 text-2xl" />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={photoBusy}
              aria-label={t("account.profile.uploadPhoto")}
              className="absolute -bottom-1.5 -right-1.5 flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-surface bg-accent text-white transition hover:bg-accent-press disabled:opacity-60"
            >
              <LuCamera size={15} />
            </button>
          </div>
          <div className="min-w-0">
            <p className="text-[16px] font-semibold text-ink">{t("account.profile.photo")}</p>
            <p className="mt-0.5 text-[13px] text-ink-2">{t("account.profile.photoHint")}</p>
            {user.createdAt && (
              <p className="mt-1 flex items-center gap-1.5 text-[13px] text-ink-3">
                <LuCalendar size={13} /> {t("account.since", { date: formatJoined(user.createdAt) })}
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <Button type="button" size="sm" variant="outline" onClick={() => fileRef.current?.click()} disabled={photoBusy}>
                <LuCamera size={14} /> {photoBusy ? t("account.profile.uploading") : user.avatarUrl ? t("account.profile.replace") : t("account.profile.uploadPhoto")}
              </Button>
              {user.avatarUrl && (
                <Button type="button" size="sm" variant="ghost" onClick={handleRemove} disabled={photoBusy}>
                  <LuTrash2 size={14} /> {t("account.profile.remove")}
                </Button>
              )}
            </div>
            {photoError && <p className="mt-2 text-sm text-red-600">{photoError}</p>}
          </div>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFile} />
        </div>

        <div className="h-px bg-ink/[0.08]" />

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("account.profile.fullName")}>
            <input type="text" maxLength={60} value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
          </Field>
          <Field label={t("account.profile.email")} hint={t("account.profile.emailHint")}>
            <div className="relative">
              <LuMail size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/30" />
              <input type="email" value={user.email || ""} disabled className={`${inputClass} cursor-not-allowed pl-10`} />
            </div>
          </Field>
        </div>
        {nameError && <p className="text-sm text-red-600">{nameError}</p>}

      </div>
      <div className="flex justify-end border-t border-ink/[0.08] px-5 py-4 sm:px-6">
        <Button type="submit" disabled={nameSaving || name.trim() === (user.displayName || "")}>
          {nameSaved ? (
            <>
              <LuCheck size={16} /> {t("account.profile.saved")}
            </>
          ) : nameSaving ? (
            t("account.profile.saving")
          ) : (
            t("account.profile.save")
          )}
        </Button>
      </div>
    </ListGroup>
    </section>
  );
}

// ------------------------------------------------------------------
// Xavfsizlik: parol
// ------------------------------------------------------------------
function SecuritySection({ user }) {
  const { changePassword } = useAuth();
  const { t } = useI18n();
  const hasPassword = user.hasPassword;

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);
  const [pwError, setPwError] = useState("");

  const pwCheck = checkPassword(newPassword, { email: user.email || "", name: user.displayName || "" });

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwError("");
    setPwSaved(false);
    if (!pwCheck.valid) {
      setPwError(t("account.security.weak"));
      return;
    }
    if (hasPassword && newPassword === currentPassword) {
      setPwError(t("account.security.same"));
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError(t("account.security.mismatch"));
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
      setPwError(mapPasswordError(err.code) || err.message || translate("common.error"));
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <Section
      id="xavfsizlik"
      title={hasPassword ? t("account.security.change") : t("account.security.set")}
      footer={hasPassword ? t("account.security.changeHint") : t("account.security.setHint")}
    >
      <form onSubmit={handlePasswordSubmit}>
        <div className="space-y-4 p-5 sm:p-6">
          {hasPassword && (
            <Field label={t("account.security.current")}>
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
            <Field label={t("account.security.new")}>
              <input
                type="password"
                required
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={inputClass}
                placeholder={t("account.security.newPlaceholder")}
              />
            </Field>
            <Field label={t("account.security.confirm")}>
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
        <div className="flex justify-end border-t border-ink/[0.08] px-5 py-4 sm:px-6">
          <Button type="submit" disabled={pwSaving || !pwCheck.valid || newPassword !== confirmPassword}>
            {pwSaved ? (
              <>
                <LuCheck size={16} /> {t("account.profile.saved")}
              </>
            ) : pwSaving ? (
              t("account.profile.saving")
            ) : hasPassword ? (
              t("account.security.update")
            ) : (
              t("account.security.set")
            )}
          </Button>
        </div>
      </form>
    </Section>
  );
}

// ------------------------------------------------------------------
// Faol seanslar: qaysi qurilmalarda kirilgan, bittasini yoki hammasini tugatish
// ------------------------------------------------------------------
function timeAgo(iso) {
  const sec = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (sec < 5 * 60) return translate("account.sessions.activeNow");
  if (sec < 3600) return translate("account.sessions.minutesAgo", { n: Math.floor(sec / 60) });
  if (sec < 86400) return translate("account.sessions.hoursAgo", { n: Math.floor(sec / 3600) });
  if (sec < 30 * 86400) return translate("account.sessions.daysAgo", { n: Math.floor(sec / 86400) });
  return formatDate(iso, { day: "2-digit", month: "2-digit", year: "numeric" });
}

function SessionsSection({ user }) {
  const { listSessions, endSession, revokeOtherSessions } = useAuth();
  const { t } = useI18n();
  const [sessions, setSessions] = useState(null);
  const [error, setError] = useState("");
  const [ending, setEnding] = useState(null); // seans id yoki "all"
  const listRef = useRef(listSessions);
  listRef.current = listSessions;

  // Parol almashsa yoki "hammasidan chiqish" bo'lsa user yangilanadi — ro'yxat ham.
  useEffect(() => {
    let cancelled = false;
    listRef
      .current()
      .then((items) => !cancelled && setSessions(items))
      .catch((err) => !cancelled && setError(err.message || translate("account.sessions.loadFailed")));
    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleEnd = async (id) => {
    setError("");
    setEnding(id);
    try {
      await endSession(id);
      setSessions((list) => list.filter((s) => s.id !== id));
    } catch (err) {
      setError(err.message || t("account.sessions.endFailed"));
    } finally {
      setEnding(null);
    }
  };

  const handleEndAll = async () => {
    setError("");
    setEnding("all");
    try {
      await revokeOtherSessions();
      setSessions((list) => list.filter((s) => s.current));
    } catch (err) {
      setError(err.message || t("common.error"));
    } finally {
      setEnding(null);
    }
  };

  const others = sessions ? sessions.filter((s) => !s.current).length : 0;

  return (
    <Section id="seanslar" title={t("account.sessions.title")} footer={t("account.sessions.subtitle")}>
      <div>
        {sessions === null && !error && (
          <div className="space-y-2 px-4 py-4">
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
          </div>
        )}
        {sessions?.map((s) => {
          const Icon = s.device === "phone" ? LuSmartphone : s.device === "tablet" ? LuTablet : LuMonitor;
          return (
            <SettingRow
              key={s.id}
              icon={Icon}
              title={
                <span className="flex flex-wrap items-center gap-2">
                  {s.browser} · {s.os}
                  {s.current && <Badge tone="emerald">{t("account.sessions.thisDevice")}</Badge>}
                </span>
              }
              text={[
                s.ip && `IP ${s.ip}`,
                s.current ? t("account.sessions.activeNow") : timeAgo(s.lastSeenAt),
                s.method && t(`account.sessions.methods.${s.method}`),
              ]
                .filter(Boolean)
                .join(" · ")}
              action={
                !s.current && (
                  <Button
                    type="button"
                    size="sm"
                    variant="danger"
                    onClick={() => handleEnd(s.id)}
                    disabled={ending !== null}
                  >
                    {ending === s.id ? t("account.sessions.ending") : t("account.sessions.end")}
                  </Button>
                )
              }
            />
          );
        })}
        {sessions && others === 0 && (
          <p className="px-4 py-3.5 text-[15px] text-ink-2">{t("account.sessions.none")}</p>
        )}
        {others > 0 && (
          <ListRow
            title={ending === "all" ? t("account.sessions.endingAll") : t("account.sessions.endAll")}
            destructive
            chevron={false}
            onClick={ending !== null ? undefined : handleEndAll}
          />
        )}
        {error && <p className="px-4 py-3.5 text-[15px] text-danger">{error}</p>}
      </div>
    </Section>
  );
}

// ------------------------------------------------------------------
// Ulangan hisoblar: Google va email/parol
// ------------------------------------------------------------------
function AccountsSection({ user }) {
  const { t } = useI18n();
  const [error, setError] = useState("");

  return (
    <Section id="hisoblar" title={t("account.accounts.title")} footer={t("account.accounts.subtitle")}>
      <div>
        <SettingRow
          icon={GoogleIcon}
          title="Google"
          text={user.hasGoogle ? t("account.accounts.googleOn") : t("account.accounts.googleOff")}
          action={
            user.hasGoogle ? (
              <Badge tone="emerald" icon={LuCheck}>
                {t("account.accounts.connected")}
              </Badge>
            ) : GOOGLE_CLIENT_ID ? (
              <LinkGoogleButton onError={setError} />
            ) : (
              <Badge tone="ink">{t("account.accounts.notConnected")}</Badge>
            )
          }
          error={error}
        />
        <SettingRow
          icon={LuMail}
          title={t("account.accounts.emailPassword")}
          text={user.email}
          action={
            user.hasPassword ? (
              <Badge tone="emerald" icon={LuCheck}>
                {t("account.accounts.passwordSet")}
              </Badge>
            ) : (
              <Button size="sm" variant="outline" type="button" onClick={() => scrollTo("xavfsizlik")}>
                {t("account.accounts.setPassword")}
              </Button>
            )
          }
        />
      </div>
    </Section>
  );
}

function LinkGoogleButton({ onError }) {
  const { linkGoogle } = useAuth();
  const { t } = useI18n();
  const [busy, setBusy] = useState(false);

  const start = useGoogleLogin({
    flow: "implicit",
    scope: "openid email profile",
    onSuccess: async (tokenResponse) => {
      try {
        await linkGoogle(tokenResponse.access_token);
        onError("");
      } catch (err) {
        onError(err.message || t("account.accounts.linkFailed"));
      } finally {
        setBusy(false);
      }
    },
    onError: () => {
      setBusy(false);
      onError(t("account.accounts.linkFailed"));
    },
    onNonOAuthError: (err) => {
      setBusy(false);
      if (err?.type === "popup_failed_to_open") {
        onError(t("account.accounts.popupBlocked"));
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
      <LuLink size={14} /> {busy ? t("account.accounts.linking") : t("account.accounts.link")}
    </Button>
  );
}

// ------------------------------------------------------------------
// Xavfli zona: progressni tiklash va hisobni o'chirish
// ------------------------------------------------------------------
function DangerSection({ user }) {
  const { resetProgress, deleteAccount } = useAuth();
  const { t } = useI18n();
  // Faqat brauzerda tekshiriladi — serverga AuthContext doim CONFIRM_WORD yuboradi.
  const confirmWord = t("account.danger.confirmWord");
  const navigate = useNavigate();
  const [dialog, setDialog] = useState(null); // "reset" | "delete" | null
  const [resetDone, setResetDone] = useState(false);

  return (
    <Section id="xavfli-zona" title={t("account.danger.title")} footer={t("account.danger.subtitle")}>
      <div>
        <SettingRow
          icon={LuRotateCcw}
          tone="red"
          title={t("account.danger.resetTitle")}
          text={t("account.danger.resetText")}
          action={
            <Button type="button" size="sm" variant="danger" onClick={() => setDialog("reset")} disabled={resetDone}>
              {resetDone ? (
                <>
                  <LuCheck size={14} /> {t("account.danger.resetDone")}
                </>
              ) : (
                t("account.danger.reset")
              )}
            </Button>
          }
        />
        <SettingRow
          icon={LuTrash2}
          tone="red"
          title={t("account.danger.deleteTitle")}
          text={t("account.danger.deleteText")}
          action={
            <Button type="button" size="sm" variant="danger" onClick={() => setDialog("delete")}>
              {t("account.danger.delete")}
            </Button>
          }
        />
      </div>

      <ConfirmDialog
        open={dialog === "reset"}
        title={t("account.danger.resetConfirmTitle")}
        description={t("account.danger.resetConfirmText")}
        confirmLabel={t("account.danger.resetTitle")}
        confirmWord={confirmWord}
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
        title={t("account.danger.deleteConfirmTitle")}
        description={t("account.danger.deleteConfirmText")}
        confirmLabel={t("account.danger.deleteTitle")}
        confirmWord={confirmWord}
        askPassword={user.hasPassword}
        onClose={() => setDialog(null)}
        onConfirm={async ({ password }) => {
          await deleteAccount(password || undefined);
          navigate("/", { replace: true });
        }}
      />
    </Section>
  );
}

// ------------------------------------------------------------------
// Umumiy qism: ikonka + matn + o'ngda amal
// ------------------------------------------------------------------
function SettingRow({ icon: Icon, tone = "ink", title, text, action, error }) {
  return (
    <div className="group/srow flex gap-3 pl-4">
      <span
        className={`mt-3 flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[8px] ${
          tone === "red" ? "bg-danger text-white" : "bg-fill text-ink-2"
        }`}
      >
        <Icon size={16} />
      </span>
      <div className="min-w-0 flex-1 border-b border-ink/[0.08] py-3 pr-4 group-last/srow:border-b-0">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1">
            <div className="text-[16px] leading-[21px] text-ink">{title}</div>
            <p className="mt-0.5 break-words text-[13px] leading-[18px] text-ink-2">{text}</p>
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
        {error && <p className="mt-2 text-[13px] text-danger">{error}</p>}
      </div>
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
      return translate("account.security.wrongCurrent");
    case "auth/too-many-requests":
      return translate("account.security.tooMany");
    case "auth/weak-password":
    case "auth/password-does-not-meet-requirements":
      return translate("account.security.weak");
    default:
      return null;
  }
}
