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
  cantera: "Suben de la cantera",
  compras: "Compras",
  escucharOfertas: "Escuchar ofertas",
  dudas: "Dudas"
};

export function Summary({ players, decisions, priorities, onEdit }: Props) {
  const groups = generateSummary(players, decisions);

  (Object.keys(groups) as (keyof typeof groups)[]).forEach((key) => {
    if (key !== "cantera") {
      groups[key] = groups[key].filter((p) => p.tipo_decision !== "filial" && p.tipo_decision !== "fin_contrato_filial");
    }
  });

  const canteraAllowed = ["subir", "pretemporada", "renovar_y_pretemporada", "renovar_y_subir"];
  groups.cantera = groups.cantera.filter(
    (p) =>
      (p.tipo_decision === "filial" || p.tipo_decision === "fin_contrato_filial") &&
      canteraAllowed.includes(decisions[p.id]?.decisionValue as string)
  );

  const activePriorities = priorities.filter((priority) => priority.priority !== "none");

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Object.entries(summaryLabels).map(([key, label]) => {
          const list = groups[key as keyof typeof groups];
          if (list.length === 0) return null;
          return (
            <section key={key} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-black text-slate-950">{label}</h3>
                <span className="rounded bg-slate-100 px-2 py-1 text-sm font-black text-slate-700">{list.length}</span>
              </div>
              <div className="mt-3 min-h-16 space-y-1 text-sm text-slate-700">
                {list.map((player) => <p key={player.id}>{player.jugador}</p>)}
              </div>
            </section>
          );
        })}
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-black text-slate-950">Objetivos de mercado</h3>
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
    </div>
  );
}
