import { MarketPriority } from "@/types";

export const marketPositions = [
  { id: "porteria", label: "Portería", tags: ["Portero titular", "Portero suplente"] },
  { id: "lateral-derecho", label: "Lateral derecho", tags: ["Lateral ofensivo", "Lateral defensivo"] },
  { id: "central", label: "Central", tags: ["Central zurdo", "Central rápido"] },
  { id: "lateral-izquierdo", label: "Lateral izquierdo", tags: ["Lateral ofensivo", "Lateral defensivo"] },
  { id: "mediocentro", label: "Mediocentro", tags: ["Pivote defensivo", "Mediocentro físico"] },
  { id: "interior", label: "Interior / organizador", tags: ["Organizador", "Interior llegador"] },
  { id: "extremo-derecho", label: "Extremo derecho", tags: ["Extremo rápido", "Extremo asociativo"] },
  { id: "extremo-izquierdo", label: "Extremo izquierdo", tags: ["Extremo rápido", "Extremo a pierna cambiada"] },
  { id: "delantero", label: "Delantero centro", tags: ["Delantero titular", "Delantero joven", "Delantero de rotación"] }
];

export const priorityLabels = {
  none: "No tocar",
  low: "Prioridad baja",
  medium: "Prioridad media",
  high: "Prioridad alta"
};

export function defaultMarketPriorities(): MarketPriority[] {
  return marketPositions.map((position) => ({
    positionId: position.id,
    positionLabel: position.label,
    priority: "none",
    profileTag: undefined
  }));
}
