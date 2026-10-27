import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/auth/AuthLayout";
import TextField from "../components/auth/TextField";
import GoogleButton from "../components/auth/GoogleButton";
import { FormAlert, OrDivider, PrimaryButton } from "../components/auth/FormParts";

export default function Login() {
  const { user, loading: authLoading, login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [passwordNotSet, setPasswordNotSet] = useState(false);
  const [loading, setLoading] = useState(false);

  // Allaqachon kirgan foydalanuvchi login sahifasida turmaydi.
  if (!authLoading && user) {
    return <Navigate to={user.emailVerified ? "/dashboard" : "/verify-email"} replace />;
  }

  const goNext = (u) => navigate(u.emailVerified ? "/dashboard" : "/verify-email", { replace: true });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setPasswordNotSet(false);
    setLoading(true);
    try {
      goNext(await login(email.trim(), password));
    } catch (err) {
      // Firebase'dan ko'chirilgan yoki faqat Google bilan ochilgan hisob.
      if (err.code === "auth/password-not-set") setPasswordNotSet(true);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Xush kelibsiz"
      title="Hisobingizga kiring"
      subtitle="SAT mock testlari va natijalaringiz sizni kutmoqda."
      footer={
        <>
          Hisobingiz yo'qmi?{" "}
          <Link to="/register" className="font-semibold text-[#087fd1] hover:underline">
            Ro'yxatdan o'ting
          </Link>
        </>
      }
    >
      <GoogleButton onSuccess={goNext} onError={setError} disabled={loading} />

      <OrDivider />

      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="nomingiz@email.com"
        />
        <TextField
          label="Parol"
          type="password"
          name="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          action={
            <Link
              to="/forgot-password"
              state={{ email }}
              className="text-[13px] font-medium text-[#087fd1] hover:underline"
            >
              Parolni unutdingizmi?
            </Link>
          }
        />

        {error && (
          <FormAlert>
            {error}
            {passwordNotSet && (
              <>
                {" "}
                <Link to="/forgot-password" state={{ email }} className="font-semibold underline">
                  Parol o'rnatish
                </Link>
              </>
            )}
          </FormAlert>
        )}

        <PrimaryButton loading={loading} loadingText="Kirilmoqda..." className="!mt-6">
          Kirish
        </PrimaryButton>
      </form>
    </AuthLayout>
  );
}
