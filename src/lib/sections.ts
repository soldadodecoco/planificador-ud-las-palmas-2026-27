import { Player, SectionId } from "@/types";
import { sortPlayers } from "./sorting";

export const sections: { id: SectionId; label: string; shortLabel: string }[] = [
  { id: "inicio", label: "Inicio", shortLabel: "Inicio" },
  { id: "entrenador", label: "Entrenador", shortLabel: "Entrenador" },
  { id: "calientes", label: "Final de contrato", shortLabel: "Final" },
  { id: "cedidos-equipo", label: "Jugadores cedidos", shortLabel: "Cedidos" },
  { id: "plantilla", label: "Con contrato", shortLabel: "Contrato" },
  { id: "cedidos-fuera", label: "Vuelven tras cesión", shortLabel: "Vuelven" },
  { id: "cantera", label: "Las Palmas Atlético", shortLabel: "Atlético" },
  { id: "mercado", label: "Prioridades de mercado", shortLabel: "Mercado" },
  { id: "resumen", label: "Resumen editable", shortLabel: "Resumen" },
  { id: "imagen", label: "Imagen final", shortLabel: "Imagen" }
];

function isFilial(player: Player) {
  return player.filial.trim().toLowerCase().startsWith("s");
}

export function getPlayersForSection(players: Player[], sectionId: SectionId) {
  const filtered = players.filter((player) => {
    if (sectionId === "entrenador") {
      return player.posicion === "Entrenador" || player.orden === 0;
    }

    if (sectionId === "calientes") {
      return (
        player.posicion !== "Entrenador" &&
        player.orden !== 0 &&
        (player.tipo_decision === "renovacion_salida" ||
          player.tipo_decision === "renovacion" ||
          (player.tipo_decision === "plantilla_normal" && player.fin_de_contrato === "2026" && player.tipo === "") ||
          (player.tipo_decision === "posible_venta" && player.orden <= 2))
      );
    }

    if (sectionId === "cedidos-equipo") {
      return player.tipo_decision === "cedido_en_equipo_compra" || player.tipo_decision === "cedido_en_equipo";
    }

    if (sectionId === "plantilla") {
      return (
        (player.tipo_decision === "plantilla_normal" && !(player.fin_de_contrato === "2026" && player.tipo === "")) ||
        (player.tipo_decision === "posible_venta" && player.orden > 2 && player.tipo !== "Cedido fuera")
      );
    }

    if (sectionId === "cedidos-fuera") {
      return !isFilial(player) && (player.tipo_decision === "cedido_fuera" || player.tipo === "Cedido fuera");
    }

    if (sectionId === "cantera") {
      return isFilial(player) || player.tipo_decision === "filial" || player.tipo_decision === "fin_contrato_filial";
    }

    return false;
  });

  return sortPlayers(filtered);
}

export function isDecisionSection(sectionId: SectionId) {
  return ["entrenador", "calientes", "cedidos-equipo", "plantilla", "cedidos-fuera", "cantera"].includes(sectionId);
}
