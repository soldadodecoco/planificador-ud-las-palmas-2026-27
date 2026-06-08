"use client";

import { marketPositions, priorityLabels } from "@/lib/market";
import { allPlayers } from "@/lib/players";
import { Decision, MarketPriority, MarketPriorityLevel } from "@/types";
import { useState } from "react";

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
  "pedir_otra_cesion",
  "intentar_compra",
  "subir",
  "pretemporada",
  "seguir_filial",
  "renovar_y_pretemporada",
  "renovar_y_subir",
  "renovar_y_filial"
]);

export function MarketPriorities({ priorities, decisions, onChange }: Props) {
  const [openPositionId, setOpenPositionId] = useState<string | null>(null);

  function update(positionId: string, patch: Partial<MarketPriority>) {
    onChange(priorities.map((priority) => (priority.positionId === positionId ? { ...priority, ...patch } : priority)));
  }

  return (
    <div className="grid justify-center gap-4 md:grid-cols-[repeat(2,minmax(0,420px))] xl:grid-cols-[repeat(3,minmax(0,420px))]">
      {marketPositions.map((position) => {
        const current = priorities.find((priority) => priority.positionId === position.id);
        const group = positionGroups[position.id];
        const players = allPlayers.filter((player) => {
          const decision = decisions[player.id]?.decisionValue;
          return player.posicion === group.playerPosition && Boolean(decision && continuityDecisions.has(decision));
        });

        return (
          <section key={position.id} className="relative rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-lg font-black text-slate-950">{position.label}</h3>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {levels.map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() =>
                    update(position.id, {
                      priority: current?.priority === level ? "none" : level,
                      profileTag: undefined
                    })
                  }
                  className={`group relative min-h-11 cursor-pointer overflow-hidden rounded-md border py-2 pl-9 pr-3 text-sm font-black transition duration-150 active:scale-[0.98] ${
                    current?.priority === level
                      ? "selected-decision border-[#07182f] bg-[#07182f] text-white shadow-[0_10px_24px_rgba(0,87,184,0.25)]"
                      : "border-slate-200 bg-white text-slate-800 hover:border-[#0057b8] hover:bg-slate-50"
                  }`}
                >
                  <span
                    className={`absolute left-2 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-xs ${
                      current?.priority === level ? "bg-[#ffe000] text-[#07182f]" : "bg-transparent text-transparent"
                    }`}
                  >
                    ✓
                  </span>
                  {priorityLabels[level]}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setOpenPositionId((current) => (current === position.id ? null : position.id))}
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
                  <div className="rounded bg-white p-2 text-sm font-bold text-slate-500">
                    Sin jugadores elegidos.
                  </div>
                )}
              </div>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
