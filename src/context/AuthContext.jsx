import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "../api/client";
import { resetSocket } from "../api/socket";

// ------------------------------------------------------------------
// Autentifikatsiya — endi o'z backendimiz orqali (server/src/routes/auth.js).
//
// `user` obyekti: { uid, email, displayName, emailVerified, isAdmin,
// isOwner, adminPerms, hasPassword, hasGoogle }. Sessiya httpOnly cookie'da, shuning uchun
// sahifa yangilanganda /auth/me orqali tiklanadi.
// ------------------------------------------------------------------

const AuthContext = createContext(null);

// server/src/routes/auth.js → CONFIRM_WORD bilan bir xil.
export const CONFIRM_WORD = "O'CHIRISH";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/auth/me")
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const expire = () => {
      resetSocket();
      setUser(null);
    };
    window.addEventListener("auth:expired", expire);
    return () => window.removeEventListener("auth:expired", expire);
  }, []);

  // Har bir auth javobi yangilangan foydalanuvchini qaytaradi.
  const apply = useCallback((data) => {
    resetSocket();
    setUser(data.user);
    return data.user;
  }, []);

  const register = (email, password, displayName) =>
    api.post("/auth/register", { email, password, displayName }).then(apply);

  const login = (email, password) => api.post("/auth/login", { email, password }).then(apply);

  // Google — bitta funksiya ham kirish, ham ro'yxatdan o'tish uchun.
  // Server Google foydalanuvchini darhol tasdiqlangan deb belgilaydi.
  const googleLogin = (accessToken) => api.post("/auth/google", { accessToken }).then(apply);

  const logout = async () => {
    await api.post("/auth/logout").catch(() => {});
    resetSocket();
    setUser(null);
  };

  const sendVerificationCode = () => api.post("/auth/otp/send");

  const verifyEmailCode = (code) => api.post("/auth/otp/verify", { code }).then(apply);

  const requestPasswordReset = (email) => api.post("/auth/password/forgot", { email });

  const resetPassword = (email, code, password) =>
    api.post("/auth/password/reset", { email, code, password }).then(apply);

  const updateDisplayName = (displayName) =>
    api.patch("/auth/profile", { displayName }).then(apply);

  const changePassword = (currentPassword, newPassword) =>
    api.post("/auth/password/change", { currentPassword, newPassword }).then(apply);

  // Email noto'g'ri kiritilgan bo'lsa (VerifyEmail sahifasi) — joriy parol
  // bilan almashtiriladi, yangi manzil qayta tasdiqlanishi kerak bo'ladi.
  const changeEmail = (currentPassword, newEmail) =>
    api.post("/auth/email/change", { currentPassword, newEmail }).then(apply);

  // Profil ma'lumotlari (socket'ni qayta ochmasdan, faqat user yangilanadi).
  const applyProfile = useCallback((data) => {
    setUser(data.user);
    return data.user;
  }, []);

  // Onboarding so'rovnomasi: { source, sourceOther, targets: { sat } }.
  const saveOnboarding = (answers) => api.put("/me/onboarding", answers).then(applyProfile);

  // Study Plan: sozlamalar va bitta kunning bajarilgan vazifalari.
  const saveStudyPlan = (settings) => api.put("/me/study-plan", { settings }).then(applyProfile);
  const setStudyPlanDone = (date, done) =>
    api.patch("/me/study-plan/done", { date, done }).then(applyProfile);

  // Profil rasmi (data URL — src/utils/imageCompress.js → compressAvatar).
  const uploadAvatar = (dataUrl) => api.put("/me/avatar", { dataUrl }).then(applyProfile);
  const removeAvatar = () => api.delete("/me/avatar").then(applyProfile);

  // Boshqa qurilmalardagi sessiyalar bekor bo'ladi, shu qurilmada yangi cookie beriladi.
  const revokeOtherSessions = () => api.post("/auth/sessions/revoke-all").then(apply);

  const linkGoogle = (accessToken) => api.post("/auth/google/link", { accessToken }).then(applyProfile);

  // Xavfli amallar — `confirm` so'zi server tomonda ham tekshiriladi.
  const resetProgress = (currentPassword) =>
    api.post("/auth/progress/reset", { currentPassword, confirm: CONFIRM_WORD }).then(applyProfile);

  const deleteAccount = async (currentPassword) => {
    await api.post("/auth/account/delete", { currentPassword, confirm: CONFIRM_WORD });
    resetSocket();
    setUser(null);
  };

  const value = {
    user,
    loading,
    register,
    login,
    googleLogin,
    logout,
    sendVerificationCode,
    verifyEmailCode,
    requestPasswordReset,
    resetPassword,
    updateDisplayName,
    changePassword,
    changeEmail,
    saveOnboarding,
    saveStudyPlan,
    setStudyPlanDone,
    uploadAvatar,
    removeAvatar,
    revokeOtherSessions,
    linkGoogle,
    resetProgress,
    deleteAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
