import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LuLink, LuShuffle, LuBot, LuZap, LuFlame, LuTimer, LuSwords, LuChevronRight } from "react-icons/lu";
import { api } from "../api/client";
import { getSocket } from "../api/socket";
import { Page, PageHeader, Card, Button, SegmentedControl, Spinner, Badge, ListGroup } from "../components/ui";
import { TitleBadge } from "../components/duel/DuelParts";
import { useI18n, formatDate } from "../i18n";
import { CATEGORIES, DUEL_GROUPS, DUEL_MODES, modeById } from "../data/duelModes";

// ------------------------------------------------------------------
// SAT Duel — lobby (chess.com "New Game" kabi): vaqt nazoratini tanlash
// (Bullet / Blitz / Rapid / Klassik), bo'lim, "Raqib topish" (navbat; topilmasa
// PrepBot) yoki "Do'stni chaqirish" (link). Yakka SAT Rush — alohida karta.
// Server: /api/duel (REST) va realtime.js (duel:* socket hodisalari).
// ------------------------------------------------------------------

const GROUP_ICONS = { bullet: LuZap, blitz: LuFlame, rapid: LuTimer, classic: LuSwords };
const GROUP_TONES = { bullet: "text-warning", blitz: "text-danger", rapid: "text-success", classic: "text-accent" };
const BOT_OFFER_MS = 15_000;

export default function DuelLobby() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [modeId, setModeId] = useState("blitz3");
  const [section, setSection] = useState("mix");
  const [stats, setStats] = useState(null);
  const [busy, setBusy] = useState(false);
  const [searching, setSearching] = useState(false);
  const [offerBot, setOfferBot] = useState(false);
  const [error, setError] = useState("");
  const searchingRef = useRef(false);

  const mode = modeById(modeId);
  const sec = mode.noRw && section === "rw" ? "mix" : section;

  useEffect(() => {
    api.get("/duel/me").then(setStats).catch(() => {});
  }, []);

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
      const { code } = await api.post("/duel", { section: sec, mode: modeId });
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
    getSocket().emit("duel:queue", { mode: modeId, section: sec }, (res) => {
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
    getSocket().emit("duel:bot", { mode: modeId, section: sec }, (res) => {
      if (res?.ok && res.code) navigate(`/duel/${res.code}`);
      else {
        setBusy(false);
        setError(t("common.error"));
      }
    });
  };

  const sectionOptions = ["mix", "math", "rw"]
    .filter((v) => !(mode.noRw && v === "rw"))
    .map((v) => ({ value: v, label: v === "rw" ? "R&W" : t(`duel.sections.${v}`) }));

  return (
    <Page width="narrow">
      <PageHeader eyebrow={t("duel.eyebrow")} title={t("duel.title")} subtitle={t("duel.subtitle")} />

      {/* Reytinglar */}
      <p className="mb-3 text-[13px] font-semibold text-ink-2">{t("duel.ratingsTitle")}</p>
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {CATEGORIES.map((c) => {
          const r = stats?.ratings?.[c];
          const Icon = GROUP_ICONS[c];
          return (
            <Card key={c} className="p-4">
              <p className="flex items-center gap-1.5 text-[13px] font-medium text-ink-2">
                <Icon size={14} className={GROUP_TONES[c]} /> {t(`duel.groups.${c}`)}
              </p>
              <p className="mt-1 font-display text-[28px] font-bold leading-[34px] tracking-[-0.02em] tabular-nums text-ink">
                {r ? r.rating : "—"}
              </p>
              <div className="mt-1 flex items-center gap-1.5">
                {r && <TitleBadge rating={r.rating} />}
                {r && r.wins + r.losses > 0 && (
                  <span className="text-[11px] tabular-nums text-ink-3">
                    {r.wins}–{r.losses}
                  </span>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {searching ? (
        <Card className="p-8 text-center">
          <div className="flex justify-center">
            <Spinner />
          </div>
          <p className="mt-4 font-display text-[20px] font-semibold text-ink">{t("duel.searching")}</p>
          <p className="mt-1 text-[13px] font-semibold text-ink-2">
            {t(`duel.groups.${mode.group}`)} {mode.short} · {t(`duel.sections.${sec}`)}
          </p>
          <p className="mx-auto mt-2 max-w-sm text-[15px] text-ink-2">{t("duel.searchingHint")}</p>
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
        <Card className="p-5 sm:p-6">
          <h2 className="font-display text-[20px] font-semibold tracking-[-0.01em] text-ink">{t("duel.timeControl")}</h2>
          <div className="mt-4 space-y-4">
            {DUEL_GROUPS.map((g) => {
              const Icon = GROUP_ICONS[g];
              return (
                <div key={g}>
                  <p className="mb-2 flex items-center gap-1.5 text-[13px] font-semibold text-ink">
                    <Icon size={15} className={GROUP_TONES[g]} /> {t(`duel.groups.${g}`)}
                    <span className="font-normal text-ink-3">· {t(`duel.groupHint.${g}`)}</span>
                  </p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {DUEL_MODES.filter((m) => m.group === g).map((m) => {
                      const active = m.id === modeId;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setModeId(m.id)}
                          aria-pressed={active}
                          className={`rounded-xl px-3 py-3 text-center transition-colors ${
                            active ? "bg-accent text-white" : "bg-fill text-ink hover:bg-ink/10"
                          }`}
                        >
                          <span className="block font-display text-[17px] font-semibold tabular-nums">{m.label}</span>
                          <span className={`block text-[12px] ${active ? "text-white/80" : "text-ink-2"}`}>
                            {t("duel.questionsN", { n: m.total })}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-ink/[0.08] pt-5">
            <p className="text-[15px] font-semibold text-ink">{t("duel.section")}</p>
            <SegmentedControl options={sectionOptions} value={sec} onChange={setSection} label={t("duel.section")} />
          </div>
          {mode.noRw && <p className="mt-2 text-[12px] text-ink-3">{t("duel.noRwInBullet")}</p>}

          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            <Button size="lg" onClick={findRandom} disabled={busy}>
              <LuShuffle size={18} /> {t("duel.randomBtn")}
            </Button>
            <Button size="lg" variant="outline" onClick={invite} disabled={busy}>
              <LuLink size={18} /> {t("duel.inviteBtn")}
            </Button>
          </div>
        </Card>
      )}

      {error && <p className="mt-4 text-[15px] font-medium text-danger">{error}</p>}

      {/* SAT Rush */}
      <Link
        to="/duel/rush"
        className="group mt-4 flex items-center gap-4 rounded-card border border-ink/[0.06] bg-surface p-5 shadow-card transition hover:-translate-y-0.5 sm:p-6"
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-warning text-white">
          <LuZap size={24} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-display text-[17px] font-semibold text-ink">{t("duel.rush.title")}</span>
          <span className="block text-[15px] leading-[20px] text-ink-2">{t("duel.rush.card")}</span>
        </span>
        <LuChevronRight size={18} className="shrink-0 text-ink-3" />
      </Link>

      <h2 className="mb-3 mt-10 font-display text-[20px] font-semibold tracking-[-0.01em] text-ink">{t("duel.recent")}</h2>
      {stats?.recent?.length ? (
        <ListGroup className="divide-y divide-ink/[0.08]">
          {stats.recent.map((m) => {
            const md = modeById(m.mode);
            return (
              <div key={m.id} className="flex items-center gap-3 px-4 py-3">
                <Badge tone={m.outcome === "win" ? "emerald" : m.outcome === "loss" ? "red" : "ink"}>{t(`duel.${m.outcome}`)}</Badge>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-medium text-ink">
                    {t("duel.vs")} {m.opponent}
                  </p>
                  <p className="text-[12px] text-ink-2">
                    {t(`duel.groups.${md.group}`)} {md.short} · {t(`duel.sections.${m.section}`)} ·{" "}
                    {formatDate(m.at, { day: "numeric", month: "short" })}
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
            );
          })}
        </ListGroup>
      ) : (
        <p className="text-[15px] text-ink-2">{stats ? t("duel.noRecent") : ""}</p>
      )}
    </Page>
  );
}
