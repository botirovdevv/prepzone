import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile,
  updatePassword,
  updateEmail,
  sendEmailVerification,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { auth } from "../firebase/config";

const AuthContext = createContext(null);
const googleProvider = new GoogleAuthProvider();

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

  const register = async (email, password, displayName) => {
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
      await sendEmailVerification(cred.user);
    } catch (err) {
      console.error("Tasdiqlash xatini yuborishda xatolik:", err);
    }
    return cred;
  };

  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  // Google popup orqali kirish/ro'yxatdan o'tish (bir xil funksiya ikkalasi
  // uchun ham ishlaydi — Google hisob birinchi marta ishlatilsa avtomatik
  // yangi foydalanuvchi yaratiladi).
  const googleLogin = () => signInWithPopup(auth, googleProvider);

  const logout = () => signOut(auth);

  // Tasdiqlash havolasini qayta yuborish (VerifyEmail sahifasidagi
  // "Qayta yuborish" tugmasi uchun).
  const resendVerificationEmail = () => {
    if (!auth.currentUser) throw new Error("Foydalanuvchi topilmadi");
    return sendEmailVerification(auth.currentUser);
  };

  // Foydalanuvchi havolani bosgandan keyin Firebase'dagi holatni qayta
  // yuklab, local "user" state'ni yangilaydi (aks holda emailVerified
  // eski qiymatda "yopishib" qolaveradi).
  const refreshEmailVerified = async () => {
    if (!auth.currentUser) return false;
    await auth.currentUser.reload();
    setUser({ ...auth.currentUser });
    return auth.currentUser.emailVerified;
  };

  const updateDisplayName = async (displayName) => {
    if (!auth.currentUser) throw new Error("Foydalanuvchi topilmadi");
    await updateProfile(auth.currentUser, { displayName });
    setUser((prev) => (prev ? { ...prev, displayName } : prev));
  };

  const changePassword = async (currentPassword, newPassword) => {
    if (!auth.currentUser?.email) throw new Error("Foydalanuvchi topilmadi");
    const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
    await reauthenticateWithCredential(auth.currentUser, credential);
    await updatePassword(auth.currentUser, newPassword);
  };

  // Email manzilini o'zgartirish (masalan ro'yxatdan o'tishda xato email
  // kiritilgan bo'lsa) — xavfsizlik uchun joriy parol bilan qayta
  // autentifikatsiya talab qilinadi, so'ng yangi manzilga tasdiqlash
  // havolasi qayta yuboriladi.
  const changeEmail = async (currentPassword, newEmail) => {
    if (!auth.currentUser?.email) throw new Error("Foydalanuvchi topilmadi");
    const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
    await reauthenticateWithCredential(auth.currentUser, credential);
    await updateEmail(auth.currentUser, newEmail);
    await sendEmailVerification(auth.currentUser);
    setUser({ ...auth.currentUser });
  };

  const value = {
    user,
    loading,
    register,
    login,
    googleLogin,
    logout,
    updateDisplayName,
    changePassword,
    changeEmail,
    resendVerificationEmail,
    refreshEmailVerified,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
