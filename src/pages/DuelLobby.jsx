import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LuSwords, LuLink, LuShuffle, LuBot, LuTimer, LuTrophy, LuListOrdered } from "react-icons/lu";
import { api } from "../api/client";
import { getSocket } from "../api/socket";
import { Page, PageHeader, Card, Button, IconTile, SegmentedControl, Spinner, Badge, ListGroup } from "../components/ui";
import { useI18n, formatDate } from "../i18n";

// ------------------------------------------------------------------
// SAT Duel — lobby: do'stni link bilan chaqirish yoki tasodifiy raqib
// (navbat). Raqib topilmasa — PrepBot (reytingsiz). Jangning o'zi: Duel.jsx.
// Server: /api/duel (REST) va realtime.js (duel:* socket hodisalari).
// ------------------------------------------------------------------

const RULE_ICONS = [LuListOrdered, LuTimer, LuTrophy];
// Navbatda shuncha kutgandan keyin PrepBot taklif qilinadi.
const BOT_OFFER_MS = 15_000;

export default function DuelLobby() {
  const navigate = useNavigate();
  const { t, tr } = useI18n();
  const [section, setSection] = useState("mix");
  const [stats, setStats] = useState(null);
  const [busy, setBusy] = useState(false);
  const [searching, setSearching] = useState(false);
  const [offerBot, setOfferBot] = useState(false);
  const [error, setError] = useState("");
  const searchingRef = useRef(false);

  useEffect(() => {
    api.get("/duel/me").then(setStats).catch(() => {});
  }, []);

  // Navbatda turganda raqib topilsa — jangga o'tamiz.
  useEffect(() => {
    const s = getSocket();
    const onMatched = ({ code }) => {
      searchingRef.current = false;
      navigate(`/duel/${code}`);
    };
    s.on("duel:matched", onMatched);
    return () => {
      s.off("duel:matched", onMatched);
      if (searchingRef.current) s.emit("duel:unqueue");
    };
  }, [navigate]);

  useEffect(() => {
    if (!searching) return;
    const id = setTimeout(() => setOfferBot(true), BOT_OFFER_MS);
    return () => clearTimeout(id);
  }, [searching]);

  const invite = async () => {
    setBusy(true);
    setError("");
    try {
      const { code } = await api.post("/duel", { section });
      navigate(`/duel/${code}`);
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  };

  const findRandom = () => {
    setError("");
    setSearching(true);
    setOfferBot(false);
    searchingRef.current = true;
    getSocket().emit("duel:queue", section, (res) => {
      if (!res?.ok) {
        setSearching(false);
        searchingRef.current = false;
        setError(t("common.error"));
      } else if (res.code) {
        searchingRef.current = false;
        navigate(`/duel/${res.code}`);
      }
    });
  };

  const cancelSearch = () => {
    getSocket().emit("duel:unqueue");
    searchingRef.current = false;
    setSearching(false);
    setOfferBot(false);
  };

  const playBot = () => {
    setBusy(true);
    searchingRef.current = false;
    getSocket().emit("duel:bot", section, (res) => {
      if (res?.ok && res.code) navigate(`/duel/${res.code}`);
      else {
        setBusy(false);
        setError(t("common.error"));
      }
    });
  };

  const sectionOptions = ["mix", "math", "rw"].map((v) => ({
    value: v,
    label: v === "rw" ? "R&W" : t(`duel.sections.${v}`),
  }));

  return (
    <Page width="narrow">
      <PageHeader eyebrow={t("duel.eyebrow")} title={t("duel.title")} subtitle={t("duel.subtitle")} />

      {/* Reyting */}
      <Card className="mb-6 flex items-center gap-4 p-5 sm:p-6">
        <IconTile icon={LuSwords} tone="red" size="lg" />
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-medium text-ink-2">{t("duel.myRating")}</p>
          <p className="font-display text-[34px] font-bold leading-[41px] tracking-[-0.02em] text-ink tabular-nums">
            {stats ? stats.rating : "—"}
          </p>
          {stats && (
            <p className="text-[13px] text-ink-2">
              {t("duel.record", { w: stats.wins, l: stats.losses })}
              {stats.rank && stats.wins + stats.losses + stats.draws > 0 ? ` · ${t("duel.rank", { rank: stats.rank })}` : ""}
            </p>
          )}
        </div>
      </Card>

      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-[15px] font-semibold text-ink">{t("duel.section")}</p>
        <SegmentedControl options={sectionOptions} value={section} onChange={setSection} label={t("duel.section")} />
      </div>

      {searching ? (
        <Card className="p-8 text-center">
          <div className="flex justify-center"><Spinner /></div>
          <p className="mt-4 font-display text-[20px] font-semibold text-ink">{t("duel.searching")}</p>
          <p className="mx-auto mt-1 max-w-sm text-[15px] text-ink-2">{t("duel.searchingHint")}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {offerBot && (
              <Button onClick={playBot} disabled={busy}>
                <LuBot size={16} /> {t("duel.playBot")}
              </Button>
            )}
            <Button variant="outline" onClick={cancelSearch}>
              {t("duel.cancel")}
            </Button>
          </div>
          {offerBot && <p className="mt-3 text-[13px] text-ink-2">{t("duel.botNote")}</p>}
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="flex flex-col p-6">
            <IconTile icon={LuLink} tone="solid" />
            <h2 className="mt-4 font-display text-[17px] font-semibold text-ink">{t("duel.inviteTitle")}</h2>
            <p className="mt-1 flex-1 text-[15px] text-ink-2">{t("duel.inviteText")}</p>
            <Button className="mt-5" onClick={invite} disabled={busy}>
              <LuLink size={16} /> {t("duel.inviteBtn")}
            </Button>
          </Card>
          <Card className="flex flex-col p-6">
            <IconTile icon={LuShuffle} tone="dark" />
            <h2 className="mt-4 font-display text-[17px] font-semibold text-ink">{t("duel.randomTitle")}</h2>
            <p className="mt-1 flex-1 text-[15px] text-ink-2">{t("duel.randomText")}</p>
            <Button variant="dark" className="mt-5" onClick={findRandom} disabled={busy}>
              <LuShuffle size={16} /> {t("duel.randomBtn")}
            </Button>
          </Card>
        </div>
      )}

      {error && <p className="mt-4 text-[15px] font-medium text-danger">{error}</p>}

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {tr("duel.rules").map((r, i) => (
          <div key={r.title} className="flex items-start gap-3 rounded-2xl bg-fill/60 p-4">
            <IconTile icon={RULE_ICONS[i]} tone="blue" size="sm" />
            <div>
              <p className="text-[15px] font-semibold text-ink">{r.title}</p>
              <p className="text-[13px] text-ink-2">{r.text}</p>
            </div>
          </div>
        ))}
      </div>

      <h2 className="mb-3 mt-10 font-display text-[20px] font-semibold tracking-[-0.01em] text-ink">{t("duel.recent")}</h2>
      {stats?.recent?.length ? (
        <ListGroup className="divide-y divide-ink/[0.08]">
          {stats.recent.map((m) => (
            <div key={m.id} className="flex items-center gap-3 px-4 py-3">
              <Badge tone={m.outcome === "win" ? "emerald" : m.outcome === "loss" ? "red" : "ink"}>
                {t(`duel.${m.outcome}`)}
              </Badge>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-medium text-ink">
                  {t("duel.vs")} {m.opponent}
                </p>
                <p className="text-[12px] text-ink-2">
                  {t(`duel.sections.${m.section}`)} · {formatDate(m.at, { day: "numeric", month: "short" })}
                </p>
              </div>
              <div className="text-right">
                <p className="font-display text-[17px] font-semibold tabular-nums text-ink">
                  {m.myScore} : {m.oppScore}
                </p>
                {m.delta != null && (
                  <p className={`text-[12px] font-semibold tabular-nums ${m.delta >= 0 ? "text-success" : "text-danger"}`}>
                    {m.delta >= 0 ? `+${m.delta}` : m.delta}
                  </p>
                )}
              </div>
            </div>
          ))}
        </ListGroup>
      ) : (
        <p className="text-[15px] text-ink-2">{stats ? t("duel.noRecent") : ""}</p>
      )}
    </Page>
  );
}
