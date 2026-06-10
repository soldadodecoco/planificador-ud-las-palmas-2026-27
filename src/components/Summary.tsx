"use client";

import { priorityShortLabels } from "@/lib/market";
import { calculateRosterCounts } from "@/lib/rosterCounts";
import { generateSummary } from "@/lib/summary";
import { fieldPositionGroups, lineForPlayer, sortByFieldPosition } from "@/lib/fieldPositions";
import { Decision, MarketPriority, Player, SectionId } from "@/types";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { useMemo, useState } from "react";

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

const positionOrder = ["Entrenador", "Portero", "Defensa", "Centrocampista", "Atacante"];
const salidaValues = new Set(["dejar_salir", "asumir_salida", "asumir_salida_cedido", "salida", "vender", "buscar_salida", "dejar_marchar"]);
const preseasonValues = new Set(["pretemporada", "renovar_y_pretemporada"]);
const orangeValues = new Set(["duda", "intentar_renovar"]);
const redValues = new Set(["escuchar_ofertas"]);

function decisionTextColor(decision?: Decision) {
  if (!decision) return "text-slate-900";
  if (preseasonValues.has(decision.decisionValue)) return "text-sky-500";
  if (orangeValues.has(decision.decisionValue)) return "text-orange-500";
  if (redValues.has(decision.decisionValue)) return "text-red-500";
  return "text-slate-900";
}

function isFilialDecision(player: Player) {
  return player.tipo_decision === "filial" || player.tipo_decision === "fin_contrato_filial";
}

function buildSummaryGroups(players: Player[], decisions: Record<string, Decision>) {
  const groups = generateSummary(players, decisions);

  (Object.keys(groups) as (keyof typeof groups)[]).forEach((key) => {
    if (key !== "cantera") {
      groups[key] = groups[key].filter((player) => !isFilialDecision(player));
    }
  });

  const canteraAllowed = ["subir", "pretemporada", "renovar_y_pretemporada", "renovar_y_subir"];
  groups.cantera = groups.cantera.filter(
    (player) => isFilialDecision(player) && canteraAllowed.includes(decisions[player.id]?.decisionValue as string)
  );

  return groups;
}

function PlayerLine({ player, decision, strike = false }: { player: Player; decision?: Decision; strike?: boolean }) {
  return (
    <motion.div
      layout
      layoutId={`summary-player-${player.id}`}
      initial={false}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 520, damping: 42, mass: 0.7 }}
      className="flex min-w-0 items-center gap-2 rounded bg-slate-50 p-1.5"
    >
      <div className="h-8 w-8 shrink-0 overflow-hidden rounded bg-slate-100">
        {player.foto_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={player.foto_url} alt={player.jugador} className={`h-full w-full object-cover ${strike ? "grayscale" : ""}`} />
        ) : (
          <div className="flex h-full items-center justify-center bg-[#07182f] text-sm font-black text-[#ffe000]">
            {player.jugador.slice(0, 1)}
          </div>
        )}
      </div>
      <div className="min-w-0">
        <p className={`truncate text-xs font-black ${decisionTextColor(decision)} ${strike ? "line-through decoration-2 opacity-60" : ""}`}>
          {player.jugador}
        </p>
        {decision && <p className="truncate text-[10px] font-bold leading-tight text-slate-500">{decision.decisionLabel}</p>}
      </div>
    </motion.div>
  );
}

export function Summary({ players, decisions, priorities, onEdit }: Props) {
  const [view, setView] = useState<"categories" | "positions">("categories");
  const [hideOutgoing, setHideOutgoing] = useState(false);
  const groups = useMemo(() => buildSummaryGroups(players, decisions), [players, decisions]);
  const decidedPlayers = useMemo(() => players.filter((player) => decisions[player.id]), [players, decisions]);
  const activePriorities = priorities.filter((priority) => priority.priority !== "none");
  const rosterCounts = useMemo(() => calculateRosterCounts(decisions, priorities), [decisions, priorities]);

  const positionGroups = useMemo(
    () =>
      positionOrder.map((position) => ({
        position,
        players: sortByFieldPosition(
          decidedPlayers.filter((player) => {
            const decision = decisions[player.id];
            const isOutgoing = Boolean(decision && salidaValues.has(decision.decisionValue));
            return lineForPlayer(player) === position && (!hideOutgoing || !isOutgoing);
          })
        )
      })),
    [decidedPlayers, decisions, hideOutgoing]
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setView("categories")}
          className={`rounded-md border px-4 py-2 text-sm font-black ${
            view === "categories" ? "border-[#07182f] bg-[#07182f] text-white" : "border-slate-200 bg-white text-slate-800"
          }`}
        >
          Por decisión
        </button>
        <button
          type="button"
          onClick={() => setView("positions")}
          className={`rounded-md border px-4 py-2 text-sm font-black ${
            view === "positions" ? "border-[#07182f] bg-[#07182f] text-white" : "border-slate-200 bg-white text-slate-800"
          }`}
        >
          Por posición
        </button>
      </div>
      {view === "positions" && (
        <div>
          <button
            type="button"
            onClick={() => setHideOutgoing((value) => !value)}
            className={`rounded-md border px-4 py-2 text-sm font-black ${
              hideOutgoing ? "border-[#0057b8] bg-[#0057b8] text-white" : "border-slate-200 bg-white text-slate-800"
            }`}
          >
            {hideOutgoing ? "Mostrar salidas" : "Quitar salidas"}
          </button>
        </div>
      )}

      <LayoutGroup>
        {view === "categories" ? (
          <motion.div layout className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {Object.entries(summaryLabels).map(([key, label]) => {
              const list = sortByFieldPosition(groups[key as keyof typeof groups]);
              if (list.length === 0) return null;
              return (
                <motion.section
                  layout
                  key={key}
                  transition={{ type: "spring", stiffness: 420, damping: 38 }}
                  className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-base font-black text-slate-950">{label}</h3>
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-black text-slate-700">{list.length}</span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-1.5">
                    {list.map((player) => (
                      <PlayerLine key={player.id} player={player} decision={decisions[player.id]} />
                    ))}
                  </div>
                </motion.section>
              );
            })}
          </motion.div>
        ) : (
          <motion.div layout className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {positionGroups.filter((group) => group.players.length > 0).map((group) => (
              <motion.section
                layout
                key={group.position}
                initial={false}
                transition={{ type: "spring", stiffness: 420, damping: 38 }}
                className="min-h-32 rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-base font-black text-slate-950">{group.position}</h3>
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-black text-slate-700">{group.players.length}</span>
                </div>
                <div className="mt-2 space-y-2">
                  {fieldPositionGroups(group.players, group.position).map((fieldGroup) => (
                    <div key={fieldGroup.fieldPosition}>
                      <p className="mb-1 text-[10px] font-black uppercase tracking-wide text-slate-400">{fieldGroup.label}</p>
                      <div className="grid grid-cols-2 gap-1.5">
                        <AnimatePresence initial={false}>
                          {fieldGroup.players.map((player) => {
                            const decision = decisions[player.id];
                            return (
                              <PlayerLine
                                key={player.id}
                                player={player}
                                decision={decision}
                                strike={Boolean(decision && salidaValues.has(decision.decisionValue))}
                              />
                            );
                          })}
                        </AnimatePresence>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.section>
            ))}
          </motion.div>
        )}
      </LayoutGroup>

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
                {priority.positionLabel}: {priorityShortLabels[priority.priority]}
                {priority.targetCount > 0 ? ` · ${priority.targetCount}` : ""}
              </span>
            ))
          ) : (
            <p className="text-sm text-slate-700">Sin prioridades marcadas.</p>
          )}
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-sm font-black text-slate-800">
          <span className="rounded bg-slate-50 px-3 py-2">{rosterCounts.firstTeam} en plantilla</span>
          <span className="rounded bg-slate-50 px-3 py-2">{rosterCounts.signings} fichajes buscados</span>
          <span className="rounded bg-slate-50 px-3 py-2">{rosterCounts.estimatedSquad} plantilla estimada</span>
          <span className="rounded bg-slate-50 px-3 py-2">{rosterCounts.preseason} harían pretemporada</span>
        </div>
      </section>
    </div>
  );
}
