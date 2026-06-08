"use client";

import { priorityLabels } from "@/lib/market";
import { generateSummary } from "@/lib/summary";
import { Decision, MarketPriority, Player, SectionId } from "@/types";

type Props = {
  players: Player[];
  decisions: Record<string, Decision>;
  priorities: MarketPriority[];
  onEdit: (section: SectionId) => void;
};

const summaryLabels = {
  renovaciones: "Renovaciones",
  salidas: "Salidas",
  cesiones: "Cesiones",
  siguen: "Siguen",
  cantera: "Cantera",
  compras: "Compras",
  escucharOfertas: "Escuchar ofertas",
  dudas: "Dudas"
};

export function Summary({ players, decisions, priorities, onEdit }: Props) {
  const groups = generateSummary(players, decisions);
  const activePriorities = priorities.filter((priority) => priority.priority !== "none");

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Object.entries(summaryLabels).map(([key, label]) => {
          const list = groups[key as keyof typeof groups];
          return (
            <section key={key} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-black text-slate-950">{label}</h3>
                <span className="rounded bg-slate-100 px-2 py-1 text-sm font-black text-slate-700">{list.length}</span>
              </div>
              <div className="mt-3 min-h-16 space-y-1 text-sm text-slate-700">
                {list.length ? list.map((player) => <p key={player.id}>{player.jugador}</p>) : <p>Sin jugadores.</p>}
              </div>
            </section>
          );
        })}
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-black text-slate-950">Prioridades de mercado</h3>
          <button type="button" onClick={() => onEdit("mercado")} className="text-sm font-bold text-[#0057b8]">
            Editar mercado
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {activePriorities.length ? (
            activePriorities.map((priority) => (
              <span key={priority.positionId} className="rounded bg-slate-100 px-3 py-2 text-sm font-bold text-slate-800">
                {priority.positionLabel}: {priorityLabels[priority.priority]}
                {priority.profileTag ? ` · ${priority.profileTag}` : ""}
              </span>
            ))
          ) : (
            <p className="text-sm text-slate-700">Sin prioridades marcadas.</p>
          )}
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => onEdit("calientes")} className="rounded-md bg-slate-900 px-4 py-3 font-bold text-white">
          Editar jugadores
        </button>
        <button type="button" onClick={() => onEdit("imagen")} className="rounded-md bg-[#ffe000] px-4 py-3 font-black text-[#07182f]">
          Ir a imagen final
        </button>
      </div>
    </div>
  );
}
