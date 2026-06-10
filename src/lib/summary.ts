import { Decision, MarketPriority, Player, SummaryGroups } from "@/types";
import { priorityShortLabels } from "@/lib/market";

const summaryMap: Record<keyof SummaryGroups, string[]> = {
  renovaciones: ["renovar", "intentar_renovar", "renovar_y_pretemporada", "renovar_y_subir", "renovar_y_filial"],
  salidas: ["dejar_salir", "asumir_salida", "asumir_salida_cedido", "salida", "vender", "buscar_salida", "dejar_marchar"],
  cesiones: ["pedir_otra_cesion", "ceder_otra_vez", "ceder"],
  siguen: ["mantener", "recuperar"],
  cantera: ["subir", "pretemporada", "seguir_filial", "renovar_y_pretemporada", "renovar_y_subir", "renovar_y_filial"],
  dudas: ["duda"],
  compras: ["intentar_compra"],
  escucharOfertas: ["escuchar_ofertas"]
};

export function generateSummary(players: Player[], decisions: Record<string, Decision>): SummaryGroups {
  const groups = Object.keys(summaryMap).reduce((acc, key) => {
    acc[key as keyof SummaryGroups] = [];
    return acc;
  }, {} as SummaryGroups);

  players.forEach((player) => {
    const value = decisions[player.id]?.decisionValue;
    if (!value) return;

    Object.entries(summaryMap).forEach(([group, values]) => {
      if (values.includes(value)) {
        groups[group as keyof SummaryGroups].push(player);
      }
    });
  });

  return groups;
}

export function calculatePlanningLabel(
  players: Player[],
  decisions: Record<string, Decision>,
  priorities: MarketPriority[]
) {
  const values = Object.values(decisions).map((decision) => decision.decisionValue);
  const salidas = values.filter((value) =>
    ["dejar_salir", "asumir_salida", "asumir_salida_cedido", "salida", "vender", "buscar_salida", "dejar_marchar"].includes(value)
  ).length;
  const siguen = values.filter((value) => ["mantener", "recuperar"].includes(value)).length;
  const cantera = values.filter((value) =>
    ["subir", "pretemporada", "seguir_filial", "renovar_y_pretemporada", "renovar_y_subir", "renovar_y_filial"].includes(value)
  ).length;
  const altas = priorities
    .filter((priority) => priority.priority === "high")
    .reduce((sum, priority) => sum + Math.max(1, priority.targetCount || 0), 0);
  const decididos = Math.max(values.length, 1);

  if (salidas >= Math.max(5, players.length * 0.25)) return salidas >= 8 ? "Revolución" : "Reconstrucción";
  if (cantera >= 4) return "Apuesta por cantera";
  if (altas >= 4) return "Mercado agresivo";
  if (siguen / decididos > 0.55) return "Plan continuista";
  if (salidas <= 2 && altas <= 1) return "Plan prudente";
  if (altas >= 2 && salidas >= 3) return "Plan ambicioso";
  return "Refuerzo quirúrgico";
}

export function copyableSummary(groups: SummaryGroups, priorities: MarketPriority[], label: string) {
  const lines = [`Mi planificación UD Las Palmas 2026/27`, `Tipo: ${label}`, ""];
  const names = (players: Player[]) => players.map((player) => player.jugador).join(", ") || "Sin decisiones";

  lines.push(`Renovaciones: ${names(groups.renovaciones)}`);
  lines.push(`Salidas: ${names(groups.salidas)}`);
  lines.push(`Cesiones: ${names(groups.cesiones)}`);
  lines.push(`Siguen: ${names(groups.siguen)}`);
  lines.push(`Cantera: ${names(groups.cantera)}`);
  lines.push(`Compras: ${names(groups.compras)}`);
  lines.push(`Escuchar ofertas: ${names(groups.escucharOfertas)}`);
  lines.push(`Dudas: ${names(groups.dudas)}`);
  lines.push(
    `Prioridades: ${
      priorities
        .filter((priority) => priority.priority !== "none")
        .map((priority) => `${priority.positionLabel} (${priorityShortLabels[priority.priority]}${priority.targetCount ? `, ${priority.targetCount}` : ""})`)
        .join("; ") || "Sin prioridades"
    }`
  );

  return lines.join("\n");
}
