import { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LuKeyRound, LuArrowRight, LuCircleAlert } from "react-icons/lu";
import { findSessionByCode } from "../utils/sessionCode";
import { Page, Card, Button, IconTile } from "../components/ui";

const CODE_LENGTH = 6;

export default function JoinSession() {
  const location = useLocation();
  const [code, setCode] = useState(location.state?.prefillCode || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(true);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (code.trim().length !== CODE_LENGTH) {
      setError("Kod 6 ta raqamdan iborat bo'lishi kerak.");
      return;
    }
    setLoading(true);
    try {
      const session = await findSessionByCode(code.trim());
      if (!session) {
        setError("Bunday kod bilan test topilmadi.");
        return;
      }
      if (session.status === "closed") {
        setError("Bu test allaqachon yakunlangan.");
        return;
      }
      navigate(`/session/${session.id}/test`, { state: { code: code.trim() } });
    } catch (err) {
      console.error(err);
      setError("Xatolik yuz berdi. Qaytadan urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page width="form" className="flex min-h-[80vh] flex-col justify-center">
      <div className="mx-auto w-full max-w-md">
        <Card className="p-7 sm:p-9">
          <IconTile icon={LuKeyRound} tone="dark" size="lg" className="mx-auto" />
          <h1 className="mt-5 text-center font-display text-2xl font-extrabold tracking-[-0.01em] text-[#12213D]">
            Kirish kodi bilan test
          </h1>
          <p className="mt-1.5 text-center text-sm text-[#12213D]/50">
            O'qituvchingiz yoki tashkilotchi bergan 6 xonali kodni kiriting.
          </p>

          <form onSubmit={handleSubmit} className="mt-7">
            {/* Ko'rinadigan 6 ta katak — haqiqiy kiritish yashirin input orqali */}
            <div className="relative" onClick={() => inputRef.current?.focus()}>
              <input
                ref={inputRef}
                value={code}
                onChange={(e) => {
                  setError("");
                  setCode(e.target.value.replace(/\D/g, "").slice(0, CODE_LENGTH));
                }}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                inputMode="numeric"
                autoComplete="one-time-code"
                autoFocus
                aria-label="Kirish kodi"
                className="absolute inset-0 h-full w-full cursor-text opacity-0"
              />
              <div className="grid grid-cols-6 gap-2">
                {Array.from({ length: CODE_LENGTH }).map((_, i) => {
                  const active = focused && (i === code.length || (i === CODE_LENGTH - 1 && code.length === CODE_LENGTH));
                  return (
                    <div
                      key={i}
                      className={`flex h-14 items-center justify-center rounded-xl border-2 font-mono text-2xl font-black text-[#12213D] transition ${
                        error
                          ? "border-red-300 bg-red-50/50"
                          : active
                          ? "border-[#087fd1] ring-4 ring-[#087fd1]/10"
                          : code[i]
                          ? "border-[#12213D]/20"
                          : "border-[#12213D]/10 bg-[#F6F7FB]"
                      }`}
                    >
                      {code[i] || ""}
                    </div>
                  );
                })}
              </div>
            </div>

            {error && (
              <p className="mt-4 flex items-center justify-center gap-1.5 text-sm text-red-600">
                <LuCircleAlert size={15} /> {error}
              </p>
            )}

            <Button type="submit" size="lg" disabled={loading} className="mt-6 w-full">
              {loading ? "Tekshirilmoqda..." : "Davom etish"}
              {!loading && <LuArrowRight size={18} />}
            </Button>
          </form>
        </Card>
      </div>
    </Page>
  );
}
