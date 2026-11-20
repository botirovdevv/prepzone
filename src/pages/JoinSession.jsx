import { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LuKeyRound, LuArrowRight, LuCircleAlert } from "react-icons/lu";
import { api } from "../api/client";
import { Page, Card, Button, IconTile } from "../components/ui";
import { useI18n } from "../i18n";

const CODE_LENGTH = 6;

export default function JoinSession() {
  const location = useLocation();
  const { t } = useI18n();
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
      setError(t("join.badLength"));
      return;
    }
    setLoading(true);
    try {
      const session = await api.post("/sessions/lookup", { code: code.trim() }).catch((err) => {
        if (err.status === 404) return null;
        throw err;
      });
      if (!session) {
        setError(t("join.notFound"));
        return;
      }
      if (session.status === "closed") {
        setError(t("join.closed"));
        return;
      }
      navigate(`/session/${session.id}/test`, { state: { code: code.trim() } });
    } catch (err) {
      // Masalan, juda ko'p urinish (429) — server xabari tilga moslangan.
      setError(err.message || t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page width="form" className="flex min-h-[80vh] flex-col justify-center">
      <div className="mx-auto w-full max-w-md">
        <Card className="p-7 sm:p-9">
          <IconTile icon={LuKeyRound} tone="blue" size="lg" className="mx-auto" />
          <h1 className="mt-5 text-center font-display text-2xl font-bold tracking-[-0.01em] text-ink">
            {t("join.title")}
          </h1>
          <p className="mt-1.5 text-center text-sm text-ink/50">{t("join.text")}</p>

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
                aria-label={t("join.codeLabel")}
                className="absolute inset-0 h-full w-full cursor-text opacity-0"
              />
              <div className="grid grid-cols-6 gap-2">
                {Array.from({ length: CODE_LENGTH }).map((_, i) => {
                  const active = focused && (i === code.length || (i === CODE_LENGTH - 1 && code.length === CODE_LENGTH));
                  return (
                    <div
                      key={i}
                      className={`flex h-14 items-center justify-center rounded-xl border-2 font-mono text-2xl font-bold text-ink transition ${
                        error
                          ? "border-red-300 bg-red-50/50"
                          : active
                          ? "border-accent ring-4 ring-accent/10"
                          : code[i]
                          ? "border-ink/20"
                          : "border-ink/10 bg-canvas"
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
              {loading ? t("join.checking") : t("join.continue")}
              {!loading && <LuArrowRight size={18} />}
            </Button>
          </form>
        </Card>
      </div>
    </Page>
  );
}
