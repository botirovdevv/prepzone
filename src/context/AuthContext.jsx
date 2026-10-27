import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "../api/client";
import { resetSocket } from "../api/socket";

// ------------------------------------------------------------------
// Autentifikatsiya — endi o'z backendimiz orqali (server/src/routes/auth.js).
//
// `user` obyekti: { uid, email, displayName, emailVerified, isAdmin,
// hasPassword, hasGoogle }. Sessiya httpOnly cookie'da, shuning uchun
// sahifa yangilanganda /auth/me orqali tiklanadi.
// ------------------------------------------------------------------

const AuthContext = createContext(null);

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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
