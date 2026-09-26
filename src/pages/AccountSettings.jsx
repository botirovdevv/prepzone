import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LuUser, LuLockKeyhole, LuCheck, LuMail, LuSettings } from "react-icons/lu";
import { useAuth } from "../context/AuthContext";
import { Page, PageHeader, Card, CardHeader, Button, Field, inputClass, PageLoader } from "../components/ui";
import PasswordStrength from "../components/PasswordStrength";
import { checkPassword } from "../utils/passwordPolicy";

function initials(nameOrEmail) {
  const parts = (nameOrEmail || "?").split(/[\s@.]+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
}

export default function AccountSettings() {
  const { user, loading, updateDisplayName, changePassword } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [nameSaving, setNameSaving] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);
  const [nameError, setNameError] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);
  const [pwError, setPwError] = useState("");

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [loading, user, navigate]);

  useEffect(() => {
    if (user) setName(user.displayName || "");
  }, [user]);

  if (loading || !user) return <PageLoader />;

  const pwCheck = checkPassword(newPassword, { email: user.email || "", name });

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
    } catch (err) {
      setNameError("Xatolik yuz berdi. Qaytadan urinib ko'ring.");
    } finally {
      setNameSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwError("");
    setPwSaved(false);
    if (!pwCheck.valid) {
      setPwError("Yangi parol xavfsizlik talablariga javob bermaydi.");
      return;
    }
    if (newPassword === currentPassword) {
      setPwError("Yangi parol joriy paroldan farq qilishi kerak.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("Yangi parollar mos kelmadi.");
      return;
    }
    setPwSaving(true);
    try {
      await changePassword(currentPassword, newPassword);
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

  const displayName = user.displayName || user.email?.split("@")[0] || "Foydalanuvchi";

  return (
    <Page>
      <PageHeader
        eyebrow="Hisob"
        icon={LuSettings}
        title="Sozlamalar"
        subtitle="Profil ma'lumotlaringiz va xavfsizlik sozlamalarini shu yerdan boshqarasiz."
      />

      <div className="grid items-start gap-6 lg:grid-cols-[300px_1fr]">
        {/* Profil xulosasi */}
        <Card className="p-6 lg:sticky lg:top-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#12213D] font-display text-xl font-bold text-white">
            {initials(displayName)}
          </div>
          <p className="mt-4 truncate font-display text-lg font-bold text-[#12213D]">{displayName}</p>
          <p className="mt-1 flex items-center gap-1.5 truncate text-sm text-[#12213D]/50">
            <LuMail size={14} className="shrink-0" /> {user.email}
          </p>
        </Card>

        <div className="space-y-6">
          {/* Profil */}
          <Card as="form" onSubmit={handleNameSubmit}>
            <CardHeader title="Profil" subtitle="Ismingiz reyting va natijalarda ko'rinadi." action={<LuUser size={18} className="text-[#12213D]/30" />} />
            <div className="space-y-4 p-5 sm:p-6">
              <Field label="To'liq ism">
                <input type="text" maxLength={60} value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
              </Field>
              <Field label="Email" hint="Email manzilni o'zgartirib bo'lmaydi.">
                <input type="email" value={user.email || ""} disabled className={`${inputClass} cursor-not-allowed`} />
              </Field>
              {nameError && <p className="text-sm text-red-600">{nameError}</p>}
            </div>
            <div className="flex justify-end border-t border-[#12213D]/[0.06] px-5 py-4 sm:px-6">
              <Button type="submit" disabled={nameSaving}>
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

          {/* Parol */}
          <Card as="form" onSubmit={handlePasswordSubmit}>
            <CardHeader
              title="Parolni almashtirish"
              subtitle="Kamida 10 ta belgi: katta va kichik harf, raqam va maxsus belgi."
              action={<LuLockKeyhole size={18} className="text-[#12213D]/30" />}
            />
            <div className="space-y-4 p-5 sm:p-6">
              <Field label="Joriy parol">
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={inputClass}
                  placeholder="••••••••"
                />
              </Field>
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
            <div className="flex justify-end border-t border-[#12213D]/[0.06] px-5 py-4 sm:px-6">
              <Button type="submit" variant="dark" disabled={pwSaving || !pwCheck.valid || newPassword !== confirmPassword}>
                {pwSaved ? (
                  <>
                    <LuCheck size={16} /> Yangilandi
                  </>
                ) : pwSaving ? (
                  "Yangilanmoqda..."
                ) : (
                  "Parolni yangilash"
                )}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </Page>
  );
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
