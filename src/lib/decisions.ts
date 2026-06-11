import { DecisionButton, DecisionType, DecisionValue } from "@/types";

export const decisionButtons: Record<DecisionType, DecisionButton[]> = {
  renovacion: [
    { value: "renovar", label: "Renovar" },
    { value: "dejar_salir", label: "Dejar salir" },
    { value: "duda", label: "Duda" }
  ],
  renovacion_salida: [
    { value: "intentar_renovar", label: "Intentar renovar" },
    { value: "asumir_salida", label: "Asumir salida" },
    { value: "duda", label: "Duda" }
  ],
  plantilla_normal: [
    { value: "mantener", label: "Mantener" },
    { value: "escuchar_ofertas", label: "Escuchar ofertas" },
    { value: "salida", label: "Salida" },
    { value: "duda", label: "Duda" }
  ],
  posible_venta: [
    { value: "mantener", label: "Mantener" },
    { value: "escuchar_ofertas", label: "Escuchar ofertas" },
    { value: "vender", label: "Vender" },
    { value: "duda", label: "Duda" }
  ],
  cedido_en_equipo_compra: [
    { value: "asumir_salida_cedido", label: "Asumir salida" },
    { value: "pedir_otra_cesion", label: "Pedir otra cesión" },
    { value: "intentar_compra", label: "Intentar compra" },
    { value: "duda", label: "Duda" }
  ],
  cedido_en_equipo: [
    { value: "asumir_salida_cedido", label: "Asumir salida" },
    { value: "pedir_otra_cesion", label: "Pedir otra cesión" },
    { value: "duda", label: "Duda" }
  ],
  cedido_fuera: [
    { value: "recuperar", label: "Recuperar" },
    { value: "ceder_otra_vez", label: "Ceder otra vez" },
    { value: "salida", label: "Salida" },
    { value: "duda", label: "Duda" }
  ],
  filial: [
    { value: "subir", label: "Subir" },
    { value: "pretemporada", label: "Pretemporada" }
  ],
  fin_contrato_filial: [
    { value: "renovar_y_pretemporada", label: "Renovar y pretemporada" },
    { value: "renovar_y_subir", label: "Renovar y subir" }
  ]
};

export const decisionLabels = Object.values(decisionButtons)
  .flat()
  .reduce<Record<string, string>>((labels, button) => {
    labels[button.value] = button.label;
    return labels;
  }, {});

export function getDecisionButtons(type: DecisionType): DecisionButton[] {
  return decisionButtons[type] ?? [];
}

export function getDecisionLabel(value: DecisionValue): string {
  return decisionLabels[value] ?? value;
}
