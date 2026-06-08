import { Player } from "@/types";

const typePriority = [
  "renovacion_salida",
  "renovacion",
  "cedido_en_equipo_compra",
  "cedido_en_equipo",
  "posible_venta",
  "plantilla_normal",
  "cedido_fuera",
  "fin_contrato_filial",
  "filial"
];

const salidaPriority = ["Alta", "Media alta", "Media", "Media baja", "Baja", ""];
const positionPriority = ["Entrenador", "Portero", "Defensa", "Centrocampista", "Atacante", ""];

function priorityIndex(value: string, list: string[]) {
  const index = list.indexOf(value || "");
  return index === -1 ? list.length : index;
}

function contractValue(value: string) {
  const match = String(value || "").match(/\d{4}/);
  return match ? Number(match[0]) : 9999;
}

export function sortPlayers(players: Player[]) {
  return [...players].sort((a, b) => {
    return (
      (a.orden || 999) - (b.orden || 999) ||
      priorityIndex(a.tipo_decision, typePriority) - priorityIndex(b.tipo_decision, typePriority) ||
      priorityIndex(a.posible_salida, salidaPriority) - priorityIndex(b.posible_salida, salidaPriority) ||
      contractValue(a.fin_de_contrato) - contractValue(b.fin_de_contrato) ||
      Number(Boolean(b.opcion_compra)) - Number(Boolean(a.opcion_compra)) ||
      (b.minutos_jugados || 0) - (a.minutos_jugados || 0) ||
      (b.goles || 0) - (a.goles || 0) ||
      priorityIndex(a.posicion, positionPriority) - priorityIndex(b.posicion, positionPriority) ||
      a.jugador.localeCompare(b.jugador, "es")
    );
  });
}
