"use client";

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

  return (
    <main>
      <SectionNavigator activeSection={activeSection} />

      {activeSection === "inicio" ? (
        <section className="min-h-[calc(100vh-73px)] bg-[#07182f] text-white">
          <div className="section-transition mx-auto max-w-5xl px-4 py-14 md:py-24">
            <div className="max-w-3xl">
              <p className="text-sm font-black uppercase tracking-[0.2em] text-[#ffe000]">Temporada 2026/27</p>
              <h1 className="mt-5 text-5xl font-black leading-tight sm:text-7xl">Planifica la UD Las Palmas 2026/27</h1>
              <div className="mt-8 flex flex-wrap gap-3">
                <button type="button" onClick={() => setActiveSection("entrenador")} className="rounded-md bg-[#ffe000] px-5 py-4 font-black text-[#07182f]">
                  Empezar planificación
                </button>
                {hasPreviousPlan && (
                  <button type="button" onClick={() => setActiveSection("resumen")} className="rounded-md bg-white px-5 py-4 font-black text-[#07182f]">
                    Continuar planificación anterior
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>
      ) : (
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
                    <p className="mt-2 max-w-2xl text-sm font-bold text-slate-600">
                      Puedes escoger únicamente a quienes llevarías de pretemporada o subirías directamente.
                    </p>
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
      )}
    </main>
  );
}
