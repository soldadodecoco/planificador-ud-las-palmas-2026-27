import { Decision, MarketPriority } from "@/types";

const firstTeamValues = new Set([
  "renovar",
  "intentar_renovar",
  "mantener",
  "recuperar",
  "intentar_compra",
  "subir",
  "renovar_y_subir"
]);

const preseasonValues = new Set(["pretemporada", "renovar_y_pretemporada"]);

export function calculateRosterCounts(decisions: Record<string, Decision>, priorities: MarketPriority[]) {
  const decisionValues = Object.values(decisions).map((decision) => decision.decisionValue);
  const firstTeam = decisionValues.filter((value) => firstTeamValues.has(value)).length;
  const preseason = decisionValues.filter((value) => preseasonValues.has(value)).length;
  const signings = priorities.reduce((sum, priority) => sum + (priority.priority === "none" ? 0 : priority.targetCount || 0), 0);

  return {
    firstTeam,
    preseason,
    signings,
    estimatedSquad: firstTeam + signings
  };
}
