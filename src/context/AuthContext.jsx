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
    return cred;
  };

  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  // Google popup orqali kirish/ro'yxatdan o'tish (bir xil funksiya ikkalasi
  // uchun ham ishlaydi — Google hisob birinchi marta ishlatilsa avtomatik
  // yangi foydalanuvchi yaratiladi).
  const googleLogin = () => signInWithPopup(auth, googleProvider);

  const logout = () => signOut(auth);

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

  const value = {
    user,
    loading,
    register,
    login,
    googleLogin,
    logout,
    updateDisplayName,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
