import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LuVideo, LuPlus, LuLogIn, LuMic, LuMonitorUp, LuPencilLine } from "react-icons/lu";
import { api } from "../api/client";
import { Page, PageHeader, Card, Button, IconTile, inputClass } from "../components/ui";
import { useI18n } from "../i18n";

// ------------------------------------------------------------------
// Study Room — kirish sahifasi: yangi xona ochish yoki sherik yuborgan
// kod bilan kirish. Xonaning o'zi (video + doska) StudyRoom.jsx'da.
// ------------------------------------------------------------------

const FEATURE_ICONS = [LuVideo, LuMic, LuMonitorUp, LuPencilLine];

// Butun link tashlansa ham (…/study-room/K7QF2M) oxirgi 6 belgini olamiz.
function normalizeCode(value) {
  const chars = String(value || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  return chars.length >= 6 ? chars.slice(-6) : "";
}

export default function StudyRoomLobby() {
  const navigate = useNavigate();
  const { t, tr } = useI18n();
  const [enabled, setEnabled] = useState(true);
  const [creating, setCreating] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/study-room/config").then((r) => setEnabled(r.enabled)).catch(() => {});
  }, []);

  const createRoom = async () => {
    setCreating(true);
    setError("");
    try {
      const { code: newCode } = await api.post("/study-room");
      navigate(`/study-room/${newCode}`);
    } catch (err) {
      setError(err.message);
      setCreating(false);
    }
  };

  const join = (e) => {
    e.preventDefault();
    const c = normalizeCode(code);
    if (!c) return setError(t("studyRoom.badCode"));
    navigate(`/study-room/${c}`);
  };

  return (
    <Page width="narrow">
      <PageHeader
        eyebrow={t("studyRoom.eyebrow")}
        icon={LuVideo}
        title="Study Room"
        subtitle={t("studyRoom.subtitle")}
      />

      {!enabled ? (
        <Card className="mb-6 border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">{t("studyRoom.notConfigured")}</Card>
      ) : (
        <Card className="mb-6 border-amber-200 bg-amber-50/60 p-4 text-[13px] leading-relaxed text-amber-800">
          {t("studyRoom.betaNote")}
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="flex flex-col p-6">
          <IconTile icon={LuPlus} tone="solid" />
          <h2 className="mt-4 font-display text-[17px] font-bold text-[#12213D]">{t("studyRoom.newRoom")}</h2>
          <p className="mt-1 flex-1 text-sm text-[#12213D]/55">{t("studyRoom.newRoomText")}</p>
          <Button className="mt-5" onClick={createRoom} disabled={!enabled || creating}>
            <LuPlus size={16} /> {creating ? t("studyRoom.opening") : t("studyRoom.openRoom")}
          </Button>
        </Card>

        <Card as="form" onSubmit={join} className="flex flex-col p-6">
          <IconTile icon={LuLogIn} tone="ink" />
          <h2 className="mt-4 font-display text-[17px] font-bold text-[#12213D]">{t("studyRoom.joinTitle")}</h2>
          <p className="mt-1 text-sm text-[#12213D]/55">{t("studyRoom.joinText")}</p>
          <input
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setError("");
            }}
            placeholder={t("studyRoom.codePlaceholder")}
            autoCapitalize="characters"
            className={`${inputClass} mt-4 font-mono tracking-[0.2em] uppercase`}
          />
          <Button type="submit" variant="dark" className="mt-3" disabled={!enabled || !code.trim()}>
            <LuLogIn size={16} /> {t("studyRoom.join")}
          </Button>
        </Card>
      </div>

      {error && <p className="mt-4 text-sm font-medium text-red-600">{error}</p>}

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {tr("studyRoom.features").map((f, i) => (
          <div key={f.title} className="flex items-start gap-3 rounded-2xl bg-white/60 p-4">
            <IconTile icon={FEATURE_ICONS[i]} tone="blue" size="sm" />
            <div>
              <p className="text-sm font-semibold text-[#12213D]">{f.title}</p>
              <p className="text-[13px] text-[#12213D]/55">{f.text}</p>
            </div>
          </div>
        ))}
      </div>
    </Page>
  );
}
