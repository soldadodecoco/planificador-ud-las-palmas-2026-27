"use client";

import { LegendToast } from "@/components/LegendToast";
import { MarketPriorities } from "@/components/MarketPriorities";
import { PlayerCard } from "@/components/PlayerCard";
import { SectionNavigator } from "@/components/SectionNavigator";
import { ShareImage } from "@/components/ShareImage";
import { Summary } from "@/components/Summary";
import { defaultMarketPriorities } from "@/lib/market";
import { allPlayers } from "@/lib/players";
import { getPlayersForSection, isDecisionSection, sections } from "@/lib/sections";
import { loadDecisions, loadMarketPriorities, resetPlanningStorage, saveDecisions, saveMarketPriorities } from "@/lib/storage";
import { Decision, DecisionValue, MarketPriority, Player, SectionId } from "@/types";
import { useEffect, useMemo, useState } from "react";

const sectionTitles: Partial<Record<SectionId, string>> = {
  entrenador: "Entrenador",
  calientes: "Final de contrato",
  "cedidos-equipo": "Jugadores cedidos",
  plantilla: "Con contrato",
  "cedidos-fuera": "Vuelven tras cesión",
  cantera: "Las Palmas Atlético",
  mercado: "Prioridades de mercado por posición",
  resumen: "Resumen",
  imagen: "Mi UD Las Palmas 2026/27"
};

export default function Home() {
  const [activeSection, setActiveSection] = useState<SectionId>("inicio");
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const [priorities, setPriorities] = useState<MarketPriority[]>(defaultMarketPriorities);
  const [hydrated, setHydrated] = useState(false);
  const [canteraSearch, setCanteraSearch] = useState("");

  useEffect(() => {
    const defaults = defaultMarketPriorities();
    setDecisions(loadDecisions());
    setPriorities(loadMarketPriorities(defaults));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveDecisions(decisions);
  }, [decisions, hydrated]);

  useEffect(() => {
    if (hydrated) saveMarketPriorities(priorities);
  }, [priorities, hydrated]);

  const currentPlayers = useMemo(() => getPlayersForSection(allPlayers, activeSection), [activeSection]);
  const completedCount = Object.keys(decisions).length;
  const pendingCount = Math.max(allPlayers.length - completedCount, 0);
  const hasPreviousPlan = hydrated && (completedCount > 0 || priorities.some((priority) => priority.priority !== "none"));
  const activeIndex = sections.findIndex((section) => section.id === activeSection);

  function setDecision(player: Player, decisionValue: DecisionValue, decisionLabel: string) {
    setDecisions((current) => ({
      ...current,
      [player.id]: {
        playerId: player.id,
        decisionValue,
        decisionLabel,
        updatedAt: new Date().toISOString()
      }
    }));
  }

  function clearDecision(player: Player) {
    setDecisions((current) => {
      const next = { ...current };
      delete next[player.id];
      return next;
    });
  }

  function goNext() {
    const next = sections[Math.min(activeIndex + 1, sections.length - 1)];
    setActiveSection(next.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goPrevious() {
    const previous = sections[Math.max(activeIndex - 1, 0)];
    setActiveSection(previous.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetPlan() {
    resetPlanningStorage();
    setDecisions({});
    setPriorities(defaultMarketPriorities());
    setActiveSection("inicio");
  }

  function scrollToCanteraPlayer(name: string) {
    const query = name.trim().toLowerCase();
    if (!query) return;

    const player = currentPlayers.find((currentPlayer) => currentPlayer.jugador.toLowerCase().includes(query));
    if (!player) return;

    document.getElementById(`player-${player.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  return (
    <main>
      {activeSection !== "inicio" && <SectionNavigator activeSection={activeSection} />}

      {activeSection === "inicio" ? (
        <section className="min-h-screen flex items-center justify-center bg-[#07182f] text-white">
          <div className="section-transition mx-auto max-w-5xl px-4 py-14 md:py-24 flex flex-col items-center text-center">
            <p className="text-sm font-black uppercase tracking-[0.3em] text-[#ffe000]">Temporada 2026/27</p>
            <h1 className="mt-8 text-6xl font-black leading-[1.1] sm:text-[6.5rem] tracking-tight">
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300">Planifica la</span>
              <span className="block mt-2 text-[#ffe000] drop-shadow-lg">UD Las Palmas</span>
            </h1>
            <div className="mt-14 flex flex-wrap justify-center gap-4">
              <button type="button" onClick={() => setActiveSection("entrenador")} className="rounded-full bg-[#ffe000] px-8 py-5 text-lg font-black text-[#07182f] shadow-xl hover:scale-105 transition-transform">
                Empezar planificación
              </button>
              {hasPreviousPlan && (
                <button type="button" onClick={() => setActiveSection("resumen")} className="rounded-full bg-white/10 backdrop-blur-sm px-8 py-5 text-lg font-black text-white hover:bg-white/20 transition-colors ring-1 ring-white/20">
                  Continuar planificación anterior
                </button>
              )}
            </div>
          </div>
        </section>
      ) : (
        <div className="planning-enter-bg min-h-[calc(100vh-73px)]">
          <section key={activeSection} className="section-transition mx-auto max-w-7xl px-4 py-8">
          <div className="mb-6">
            <div>
              {activeIndex > 0 && activeIndex <= 7 && (
                <p className="text-sm font-black uppercase tracking-[0.18em] text-[#0057b8]">
                  {activeIndex} de 7
                </p>
              )}
              {activeSection !== "entrenador" && (
                <>
                  <h2 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">{sectionTitles[activeSection]}</h2>
                  {activeSection === "cantera" && (
                    <>
                    <p className="mt-2 max-w-2xl text-sm font-bold text-slate-600">
                      Puedes escoger únicamente a quienes llevarías de pretemporada o subirías directamente.
                    </p>
                    <form
                      className="mt-4 max-w-md"
                      onSubmit={(event) => {
                        event.preventDefault();
                        scrollToCanteraPlayer(canteraSearch);
                      }}
                    >
                      <label className="sr-only" htmlFor="cantera-search">
                        Buscar jugador
                      </label>
                      <div className="flex gap-2">
                        <input
                          id="cantera-search"
                          list="cantera-players"
                          value={canteraSearch}
                          onChange={(event) => setCanteraSearch(event.target.value)}
                          placeholder="Buscar jugador"
                          className="min-w-0 flex-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-900 outline-none focus:border-[#0057b8]"
                        />
                        <button type="submit" className="cursor-pointer rounded-md bg-[#07182f] px-4 py-2 text-sm font-black text-white">
                          Ir
                        </button>
                      </div>
                      <datalist id="cantera-players">
                        {currentPlayers.map((player) => (
                          <option key={player.id} value={player.jugador} />
                        ))}
                      </datalist>
                    </form>
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          {isDecisionSection(activeSection) && (
            <div className="grid justify-center gap-4 sm:grid-cols-[minmax(0,420px)] lg:grid-cols-[repeat(2,minmax(0,420px))] xl:grid-cols-[repeat(3,minmax(0,420px))]">
              {currentPlayers.map((player) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  decision={decisions[player.id]}
                  decisionTypeOverride={
                    activeSection === "calientes" && player.tipo_decision === "plantilla_normal"
                      ? "renovacion"
                      : activeSection === "cedidos-fuera" && player.tipo_decision === "posible_venta"
                        ? "cedido_fuera"
                        : undefined
                  }
                  onDecision={setDecision}
                  onClearDecision={clearDecision}
                />
              ))}
            </div>
          )}

          {activeSection === "mercado" && <MarketPriorities priorities={priorities} decisions={decisions} onChange={setPriorities} />}

          {activeSection === "resumen" && (
            <Summary players={allPlayers} decisions={decisions} priorities={priorities} onEdit={setActiveSection} />
          )}

          {activeSection === "imagen" && (
            <ShareImage players={allPlayers} decisions={decisions} priorities={priorities} pendingCount={pendingCount} onEdit={setActiveSection} onReset={resetPlan} />
          )}

          <div className="mt-8 flex flex-wrap justify-between gap-3 border-t border-slate-200 pt-5">
            <button type="button" onClick={goPrevious} className="rounded-md bg-white px-4 py-3 font-bold text-slate-900 ring-1 ring-slate-200">
              Atrás
            </button>
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={resetPlan} className="rounded-md bg-white px-4 py-3 font-bold text-red-700 ring-1 ring-red-200">
                Reiniciar
              </button>
              <button type="button" onClick={goNext} className="rounded-md bg-[#07182f] px-5 py-3 font-black text-white">
                {activeSection === "imagen" ? "Finalizado" : "Siguiente"}
              </button>
            </div>
          </div>
        </section>
        </div>
      )}
    </main>
  );
}
