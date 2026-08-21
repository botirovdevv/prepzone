import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LuUser, LuLockKeyhole, LuCheck } from "react-icons/lu";
import { useAuth } from "../context/AuthContext";

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

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Yuklanmoqda...
      </div>
    );
  }

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
    if (newPassword.length < 6) {
      setPwError("Yangi parol kamida 6 ta belgidan iborat bo'lishi kerak.");
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

  return (
    <div className="py-14 px-6">
      <div className="max-w-xl mx-auto">
        <h1 className="font-display text-2xl font-extrabold text-[#12213D] mb-1">
          Sozlamalar
        </h1>
        <p className="text-sm text-[#12213D]/55 mb-8">
          Profil ma'lumotlaringizni shu yerdan boshqarasiz.
        </p>

        {/* Profil */}
        <form
          onSubmit={handleNameSubmit}
          className="bg-white rounded-2xl border border-[#12213D]/8 p-6 mb-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <div className="w-9 h-9 rounded-lg bg-[#087fd1]/10 text-[#087fd1] flex items-center justify-center">
              <LuUser size={17} />
            </div>
            <h2 className="font-bold text-[#12213D]">Profil</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-[#12213D]/70">To'liq ism</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full border border-[#12213D]/15 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#087fd1]/40"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#12213D]/70">Email</label>
              <input
                type="email"
                value={user.email || ""}
                disabled
                className="mt-1 w-full border border-[#12213D]/10 rounded-lg px-3 py-2 bg-[#12213D]/[0.03] text-[#12213D]/50 cursor-not-allowed"
              />
            </div>

            {nameError && <p className="text-sm text-red-600">{nameError}</p>}

            <button
              type="submit"
              disabled={nameSaving}
              className="flex items-center gap-2 bg-[#087fd1] text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-[#066fb8] transition disabled:opacity-60"
            >
              {nameSaved ? (
                <>
                  <LuCheck size={16} /> Saqlandi
                </>
              ) : nameSaving ? (
                "Saqlanmoqda..."
              ) : (
                "Saqlash"
              )}
            </button>
          </div>
        </form>

        {/* Parol */}
        <form
          onSubmit={handlePasswordSubmit}
          className="bg-white rounded-2xl border border-[#12213D]/8 p-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <div className="w-9 h-9 rounded-lg bg-[#087fd1]/10 text-[#087fd1] flex items-center justify-center">
              <LuLockKeyhole size={17} />
            </div>
            <h2 className="font-bold text-[#12213D]">Parolni almashtirish</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-[#12213D]/70">Joriy parol</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="mt-1 w-full border border-[#12213D]/15 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#087fd1]/40"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#12213D]/70">Yangi parol</label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 w-full border border-[#12213D]/15 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#087fd1]/40"
                placeholder="Kamida 6 ta belgi"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#12213D]/70">
                Yangi parolni tasdiqlang
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 w-full border border-[#12213D]/15 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#087fd1]/40"
                placeholder="••••••••"
              />
            </div>

            {pwError && <p className="text-sm text-red-600">{pwError}</p>}

            <button
              type="submit"
              disabled={pwSaving}
              className="flex items-center gap-2 bg-[#12213D] text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-[#12213D]/85 transition disabled:opacity-60"
            >
              {pwSaved ? (
                <>
                  <LuCheck size={16} /> Yangilandi
                </>
              ) : pwSaving ? (
                "Yangilanmoqda..."
              ) : (
                "Parolni yangilash"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
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
      return "Yangi parol juda zaif.";
    default:
      return "Xatolik yuz berdi. Qaytadan urinib ko'ring.";
  }
}
