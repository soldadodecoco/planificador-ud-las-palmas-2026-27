import { Player } from "@/types";

const lineByFieldPosition: Record<string, string> = {
  POR: "Portero",
  LD: "Defensa",
  DFC_D: "Defensa",
  DFC: "Defensa",
  DFC_I: "Defensa",
  LI: "Defensa",
  MCD: "Centrocampista",
  MC_D: "Centrocampista",
  MC: "Centrocampista",
  MC_I: "Centrocampista",
  MP: "Atacante",
  MCO: "Atacante",
  ED: "Atacante",
  EI: "Atacante",
  SD: "Atacante",
  DC: "Atacante"
};

export const fieldPositionOrder = ["POR", "LD", "DFC_D", "DFC", "DFC_I", "LI", "MCD", "MC_D", "MC", "MC_I", "MP", "MCO", "ED", "EI", "SD", "DC", ""];

const visualFieldPositionOrder = ["POR", "LD", "DFC_D", "DFC", "DFC_I", "LI", "MCD", "MC_D", "MC", "MC_I", "MEDIAPUNTA", "ED", "EI", "SD", "DC", ""];

export const fieldPositionLabels: Record<string, string> = {
  POR: "Portería",
  LD: "Lateral derecho",
  DFC_D: "Central derecho",
  DFC: "Central",
  DFC_I: "Central izquierdo",
  LI: "Lateral izquierdo",
  MCD: "Pivote",
  MC_D: "Interior derecho",
  MC: "Mediocentro",
  MC_I: "Interior izquierdo",
  MEDIAPUNTA: "Mediapunta",
  MP: "Mediapunta",
  MCO: "Mediapunta",
  ED: "Extremo derecho",
  EI: "Extremo izquierdo",
  SD: "Segundo punta",
  DC: "Delantero centro",
  "": "Sin zona"
};

const visualFieldPositionsByLine: Record<string, string[]> = {
  Entrenador: [""],
  Portero: ["POR", ""],
  Defensa: ["LD", "DFC_D", "DFC", "DFC_I", "LI", ""],
  Centrocampista: ["MCD", "MC_D", "MC", "MC_I", ""],
  Atacante: ["MEDIAPUNTA", "ED", "EI", "SD", "DC", ""]
};

function visualFieldPosition(value: string) {
  if (value === "MP" || value === "MCO") return "MEDIAPUNTA";
  return value;
}

export function lineForPlayer(player: Player) {
  return lineByFieldPosition[player.posicion_campo || ""] || player.posicion;
}

function fieldPositionIndex(player: Player) {
  const index = fieldPositionOrder.indexOf(player.posicion_campo || "");
  return index === -1 ? fieldPositionOrder.length : index;
}

export function sortByFieldPosition<T extends Player>(players: T[]) {
  return [...players].sort((a, b) => fieldPositionIndex(a) - fieldPositionIndex(b) || a.jugador.localeCompare(b.jugador, "es"));
}

export function fieldPositionGroups<T extends Player>(players: T[], line?: string) {
  const basePositions = line ? visualFieldPositionsByLine[line] || visualFieldPositionOrder : visualFieldPositionOrder;
  const unknownPositions = [...new Set(players.map((player) => visualFieldPosition(player.posicion_campo || "")))].filter(
    (fieldPosition) => !basePositions.includes(fieldPosition)
  );
  const orderedPositions = [...basePositions, ...unknownPositions];

  return orderedPositions
    .map((fieldPosition) => ({
      fieldPosition,
      label: fieldPositionLabels[fieldPosition] || fieldPosition,
      players: sortByFieldPosition(players.filter((player) => visualFieldPosition(player.posicion_campo || "") === fieldPosition))
    }))
    .filter((group) => group.players.length > 0);
}
