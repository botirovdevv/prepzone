import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  browserPopupRedirectResolver,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile,
  updatePassword,
  updateEmail,
  sendEmailVerification,
  sendPasswordResetEmail,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { auth } from "../firebase/app";

const AuthContext = createContext(null);
const googleProvider = new GoogleAuthProvider();

// Email havolalari (tasdiqlash, parolni tiklash) bosilgandan keyin qaytish manzili.
const actionSettings = () => ({ url: `${window.location.origin}/login` });

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  const register = useCallback(async (email, password, displayName) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
      await updateProfile(cred.user, { displayName });
      // onAuthStateChanged snapshot may not include the fresh displayName yet,
      // shuning uchun local state'ni ham darhol yangilaymiz.
      setUser({ ...cred.user, displayName });
    }
    // Email tasdiqlash havolasini yuboramiz — foydalanuvchi shu havolani
    // bosmaguncha ProtectedRoute uni /verify-email'da tutib turadi.
    // Google orqali ro'yxatdan o'tganlar Google tomonidan allaqachon
    // tasdiqlangan bo'ladi, shuning uchun bu shart faqat email/parol
    // bilan ro'yxatdan o'tganlarga tegishli.
    try {
      await sendEmailVerification(cred.user, actionSettings());
    } catch (err) {
      console.error("Tasdiqlash xatini yuborishda xatolik:", err);
    }
    return cred;
  }, []);

  const login = useCallback((email, password) => signInWithEmailAndPassword(auth, email, password), []);

  // Google popup orqali kirish/ro'yxatdan o'tish (bir xil funksiya ikkalasi
  // uchun ham ishlaydi — Google hisob birinchi marta ishlatilsa avtomatik
  // yangi foydalanuvchi yaratiladi).
  const googleLogin = useCallback(
    () => signInWithPopup(auth, googleProvider, browserPopupRedirectResolver),
    []
  );

  // Chiqishdan oldin yig'ilgan analitikani yuboramiz (keyin ruxsat bo'lmaydi).
  // Analitika moduli Firestore'ni tortadi — shuning uchun dinamik import.
  const logout = useCallback(async () => {
    try {
      const { flushPageViews } = await import("../utils/analytics");
      await flushPageViews();
    } catch {
      /* analitika yuborilmasa ham chiqish davom etadi */
    }
    return signOut(auth);
  }, []);

  // "Parolni unutdingizmi?" — tiklash havolasini emailga yuboradi.
  const resetPassword = useCallback(
    (email) => sendPasswordResetEmail(auth, email.trim(), actionSettings()),
    []
  );

  // Tasdiqlash havolasini qayta yuborish (VerifyEmail sahifasidagi
  // "Qayta yuborish" tugmasi uchun).
  const resendVerificationEmail = useCallback(() => {
    if (!auth.currentUser) throw new Error("Foydalanuvchi topilmadi");
    return sendEmailVerification(auth.currentUser, actionSettings());
  }, []);

  // Foydalanuvchi havolani bosgandan keyin Firebase'dagi holatni qayta
  // yuklab, local "user" state'ni yangilaydi (aks holda emailVerified
  // eski qiymatda "yopishib" qolaveradi).
  const refreshEmailVerified = useCallback(async () => {
    if (!auth.currentUser) return false;
    await auth.currentUser.reload();
    // ID token'dagi email_verified ham yangilansin (server API shunga qaraydi).
    await auth.currentUser.getIdToken(true);
    setUser({ ...auth.currentUser });
    return auth.currentUser.emailVerified;
  }, []);

  const updateDisplayName = useCallback(async (displayName) => {
    if (!auth.currentUser) throw new Error("Foydalanuvchi topilmadi");
    await updateProfile(auth.currentUser, { displayName });
    setUser((prev) => (prev ? { ...prev, displayName } : prev));
  }, []);

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    if (!auth.currentUser?.email) throw new Error("Foydalanuvchi topilmadi");
    const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
    await reauthenticateWithCredential(auth.currentUser, credential);
    await updatePassword(auth.currentUser, newPassword);
  }, []);

  // Email manzilini o'zgartirish (masalan ro'yxatdan o'tishda xato email
  // kiritilgan bo'lsa) — xavfsizlik uchun joriy parol bilan qayta
  // autentifikatsiya talab qilinadi, so'ng yangi manzilga tasdiqlash
  // havolasi qayta yuboriladi.
  const changeEmail = useCallback(async (currentPassword, newEmail) => {
    if (!auth.currentUser?.email) throw new Error("Foydalanuvchi topilmadi");
    const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
    await reauthenticateWithCredential(auth.currentUser, credential);
    await updateEmail(auth.currentUser, newEmail);
    await sendEmailVerification(auth.currentUser, actionSettings());
    setUser({ ...auth.currentUser });
  }, []);

  // Barqaror qiymat: faqat user/loading o'zgarganda iste'molchilar qayta render bo'ladi.
  const value = useMemo(
    () => ({
      user,
      loading,
      register,
      login,
      googleLogin,
      logout,
      resetPassword,
      updateDisplayName,
      changePassword,
      changeEmail,
      resendVerificationEmail,
      refreshEmailVerified,
    }),
    [
      user,
      loading,
      register,
      login,
      googleLogin,
      logout,
      resetPassword,
      updateDisplayName,
      changePassword,
      changeEmail,
      resendVerificationEmail,
      refreshEmailVerified,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
