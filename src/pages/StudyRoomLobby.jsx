import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LuVideo, LuPlus, LuLogIn, LuMic, LuMonitorUp, LuPencilLine } from "react-icons/lu";
import { api } from "../api/client";
import { Page, PageHeader, Card, Button, IconTile, inputClass } from "../components/ui";

// ------------------------------------------------------------------
// Study Room — kirish sahifasi: yangi xona ochish yoki sherik yuborgan
// kod bilan kirish. Xonaning o'zi (video + doska) StudyRoom.jsx'da.
// ------------------------------------------------------------------

const FEATURES = [
  { icon: LuVideo, title: "Kamera", text: "Bir-biringizni ko'rib dars qiling." },
  { icon: LuMic, title: "Mikrofon", text: "Ovozli suhbat — telefon raqamsiz." },
  { icon: LuMonitorUp, title: "Ekran ulashish", text: "Test yoki masalani ekranda ko'rsating." },
  { icon: LuPencilLine, title: "Umumiy doska", text: "Kim yozsa — ikkalangizga darhol ko'rinadi." },
];

// Butun link tashlansa ham (…/study-room/K7QF2M) oxirgi 6 belgini olamiz.
function normalizeCode(value) {
  const chars = String(value || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  return chars.length >= 6 ? chars.slice(-6) : "";
}

export default function StudyRoomLobby() {
  const navigate = useNavigate();
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
    if (!c) return setError("Kod 6 ta belgidan iborat bo'lishi kerak.");
    navigate(`/study-room/${c}`);
  };

  return (
    <Page width="narrow">
      <PageHeader
        eyebrow="Learn · Beta"
        icon={LuVideo}
        title="Study Room"
        subtitle="Do'stingiz bilan birga dars qiling: video, ovoz, ekran ulashish va ikkalangiz yozadigan umumiy doska."
      />

      {!enabled && (
        <Card className="mb-6 border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Study Room hozircha sozlanmagan. Tez orada ishga tushadi.
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="flex flex-col p-6">
          <IconTile icon={LuPlus} tone="solid" />
          <h2 className="mt-4 font-display text-[17px] font-bold text-[#12213D]">Yangi xona</h2>
          <p className="mt-1 flex-1 text-sm text-[#12213D]/55">
            Xona oching va linkni sherigingizga yuboring. Xonada 2 kishi bo'ladi.
          </p>
          <Button className="mt-5" onClick={createRoom} disabled={!enabled || creating}>
            <LuPlus size={16} /> {creating ? "Ochilmoqda…" : "Xona ochish"}
          </Button>
        </Card>

        <Card as="form" onSubmit={join} className="flex flex-col p-6">
          <IconTile icon={LuLogIn} tone="ink" />
          <h2 className="mt-4 font-display text-[17px] font-bold text-[#12213D]">Kod bilan kirish</h2>
          <p className="mt-1 text-sm text-[#12213D]/55">Sherigingiz yuborgan kod yoki linkni kiriting.</p>
          <input
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setError("");
            }}
            placeholder="Masalan: K7QF2M"
            autoCapitalize="characters"
            className={`${inputClass} mt-4 font-mono tracking-[0.2em] uppercase`}
          />
          <Button type="submit" variant="dark" className="mt-3" disabled={!enabled || !code.trim()}>
            <LuLogIn size={16} /> Kirish
          </Button>
        </Card>
      </div>

      {error && <p className="mt-4 text-sm font-medium text-red-600">{error}</p>}

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {FEATURES.map((f) => (
          <div key={f.title} className="flex items-start gap-3 rounded-2xl bg-white/60 p-4">
            <IconTile icon={f.icon} tone="blue" size="sm" />
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
