"use client";

import { marketPositions, priorityShortLabels } from "@/lib/market";
import { allPlayers } from "@/lib/players";
import { calculateRosterCounts } from "@/lib/rosterCounts";
import { Decision, MarketPriority, MarketPriorityLevel } from "@/types";
import { useMemo, useState } from "react";

type Props = {
  priorities: MarketPriority[];
  decisions: Record<string, Decision>;
  onChange: (priorities: MarketPriority[]) => void;
};

const levels: MarketPriorityLevel[] = ["none", "low", "medium", "high"];

const positionGroups: Record<string, { label: string; playerPosition: string }> = {
  porteria: { label: "porteros", playerPosition: "Portero" },
  "lateral-derecho": { label: "defensas", playerPosition: "Defensa" },
  central: { label: "defensas", playerPosition: "Defensa" },
  "lateral-izquierdo": { label: "defensas", playerPosition: "Defensa" },
  mediocentro: { label: "centrocampistas", playerPosition: "Centrocampista" },
  interior: { label: "centrocampistas", playerPosition: "Centrocampista" },
  "extremo-derecho": { label: "atacantes", playerPosition: "Atacante" },
  "extremo-izquierdo": { label: "atacantes", playerPosition: "Atacante" },
  delantero: { label: "atacantes", playerPosition: "Atacante" }
};

const continuityDecisions = new Set([
  "renovar",
  "intentar_renovar",
  "mantener",
  "recuperar",
  "intentar_compra",
  "subir",
  "pretemporada",
  "renovar_y_pretemporada",
  "renovar_y_subir"
]);

function levelToIndex(level: MarketPriorityLevel) {
  return levels.indexOf(level);
}

function indexToLevel(index: number): MarketPriorityLevel {
  return levels[Math.max(0, Math.min(3, index))];
}

export function MarketPriorities({ priorities, decisions, onChange }: Props) {
  const [openPositionId, setOpenPositionId] = useState<string | null>(null);
  const rosterCounts = useMemo(() => calculateRosterCounts(decisions, priorities), [decisions, priorities]);

  function update(positionId: string, patch: Partial<MarketPriority>) {
    onChange(
      priorities.map((priority) => {
        if (priority.positionId !== positionId) return priority;
        const next = { ...priority, ...patch };
        if (next.priority === "none") next.targetCount = 0;
        if ((next.targetCount || 0) > 0 && next.priority === "none") next.priority = "low";
        return next;
      })
    );
  }

  function changeCount(positionId: string, current: MarketPriority, delta: number) {
    const targetCount = Math.max(0, Math.min(4, (current.targetCount || 0) + delta));
    update(positionId, {
      targetCount,
      priority: targetCount > 0 && current.priority === "none" ? "low" : current.priority
    });
  }

  return (
    <div className="space-y-5">
      <div className="mx-auto flex max-w-3xl flex-wrap justify-center gap-x-4 gap-y-1 text-sm font-black text-slate-800">
        <span>
          {rosterCounts.firstTeam} + {rosterCounts.signings} fichajes = {rosterCounts.estimatedSquad}
        </span>
        <span className="text-slate-500">{rosterCounts.preseason} pretemporada</span>
      </div>

      <div className="grid justify-center gap-3 md:grid-cols-[repeat(2,minmax(0,390px))] xl:grid-cols-[repeat(3,minmax(0,390px))]">
        {marketPositions.map((position) => {
          const current =
            priorities.find((priority) => priority.positionId === position.id) ||
            ({ positionId: position.id, positionLabel: position.label, priority: "none", targetCount: 0 } as MarketPriority);
          const group = positionGroups[position.id];
          const players = allPlayers.filter((player) => {
            const decision = decisions[player.id]?.decisionValue;
            return player.posicion === group.playerPosition && Boolean(decision && continuityDecisions.has(decision));
          });

          return (
            <section key={position.id} className="relative rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-base font-black text-slate-950">{position.label}</h3>
                <span className="text-xs font-black text-slate-500">
                  {priorityShortLabels[current.priority]}
                  {current.targetCount > 0 ? ` · ${current.targetCount}` : ""}
                </span>
              </div>

              <div className="mt-3 space-y-3">
                <input
                  type="range"
                  min={0}
                  max={3}
                  step={1}
                  value={levelToIndex(current.priority)}
                  onChange={(event) => {
                    const priority = indexToLevel(Number(event.target.value));
                    update(position.id, {
                      priority,
                      targetCount: priority === "none" ? 0 : current.targetCount || 1
                    });
                  }}
                  className="w-full cursor-pointer accent-[#0057b8]"
                  aria-label={`Prioridad ${position.label}`}
                />

                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-slate-700">Jugadores</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => changeCount(position.id, current, -1)}
                      className="h-8 w-8 cursor-pointer rounded-md border border-slate-200 bg-white text-lg font-black text-slate-900 hover:border-[#0057b8]"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-lg font-black text-slate-950">{current.targetCount || 0}</span>
                    <button
                      type="button"
                      onClick={() => changeCount(position.id, current, 1)}
                      className="h-8 w-8 cursor-pointer rounded-md border border-slate-200 bg-white text-lg font-black text-slate-900 hover:border-[#0057b8]"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setOpenPositionId((currentOpen) => (currentOpen === position.id ? null : position.id))}
                className="mt-3 flex w-full cursor-pointer items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-black text-[#0057b8] transition hover:border-[#0057b8] hover:bg-white"
                aria-expanded={openPositionId === position.id}
              >
                <span>Ver {group.label}</span>
                <span className={`transition-transform duration-200 ${openPositionId === position.id ? "rotate-180" : ""}`}>⌄</span>
              </button>

              {openPositionId === position.id && (
                <div className="market-popover absolute left-4 right-4 top-[calc(100%-8px)] z-30 rounded-md border border-slate-200 bg-white p-3 shadow-[0_18px_45px_rgba(7,24,47,0.18)]">
                  <div className="grid max-h-72 gap-2 overflow-auto">
                    {players.length ? (
                      players.map((player) => (
                        <div key={player.id} className="flex items-center gap-2 rounded bg-white p-2">
                          <div className="h-9 w-9 shrink-0 overflow-hidden rounded bg-slate-100">
                            {player.foto_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={player.foto_url} alt={player.jugador} className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-[#07182f] text-sm font-black text-[#ffe000]">
                                {player.jugador.slice(0, 1)}
                              </div>
                            )}
                          </div>
                          <span className="min-w-0 truncate text-sm font-bold text-slate-800">{player.jugador}</span>
                        </div>
                      ))
                    ) : (
                      <div className="rounded bg-white p-2 text-sm font-bold text-slate-500">Sin jugadores elegidos.</div>
                    )}
                  </div>
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
