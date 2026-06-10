export type Position = "Entrenador" | "Portero" | "Defensa" | "Centrocampista" | "Atacante" | "";
export type FieldPosition =
  | "POR"
  | "LD"
  | "DFC_D"
  | "DFC"
  | "DFC_I"
  | "LI"
  | "MCD"
  | "MCO"
  | "MC_D"
  | "MC"
  | "MC_I"
  | "MP"
  | "ED"
  | "EI"
  | "SD"
  | "DC"
  | "";

export type DecisionType =
  | "posible_venta"
  | "renovacion"
  | "plantilla_normal"
  | "renovacion_salida"
  | "cedido_en_equipo_compra"
  | "cedido_en_equipo"
  | "cedido_fuera"
  | "filial"
  | "fin_contrato_filial";

export type DecisionValue =
  | "renovar"
  | "dejar_salir"
  | "duda"
  | "intentar_renovar"
  | "asumir_salida"
  | "mantener"
  | "escuchar_ofertas"
  | "salida"
  | "vender"
  | "dejar_marchar"
  | "asumir_salida_cedido"
  | "pedir_otra_cesion"
  | "intentar_compra"
  | "recuperar"
  | "ceder_otra_vez"
  | "buscar_salida"
  | "subir"
  | "pretemporada"
  | "seguir_filial"
  | "ceder"
  | "renovar_y_pretemporada"
  | "renovar_y_subir"
  | "renovar_y_filial";

export type MarketPriorityLevel = "none" | "low" | "medium" | "high";

export type Player = {
  id: string;
  jugador: string;
  posicion: Position;
  posicion_campo: FieldPosition;
  fin_de_contrato: string;
  tipo: string;
  opcion_compra: string;
  obligatoria: string;
  precio_opcion_compra: string;
  filial: string;
  posible_salida: string;
  tipo_decision: DecisionType;
  foto_url: string;
  minutos_jugados: number;
  goles: number;
  orden: number;
};

export type Decision = {
  playerId: string;
  decisionValue: DecisionValue;
  decisionLabel: string;
  updatedAt: string;
};

export type MarketPriority = {
  positionId: string;
  positionLabel: string;
  priority: MarketPriorityLevel;
  targetCount: number;
  profileTag?: string;
};

export type SectionId =
  | "inicio"
  | "entrenador"
  | "calientes"
  | "cedidos-equipo"
  | "plantilla"
  | "cedidos-fuera"
  | "cantera"
  | "mercado"
  | "resumen"
  | "imagen";

export type DecisionButton = {
  value: DecisionValue;
  label: string;
};

export type SummaryGroups = Record<
  | "renovaciones"
  | "salidas"
  | "cesiones"
  | "siguen"
  | "cantera"
  | "dudas"
  | "compras"
  | "escucharOfertas",
  Player[]
>;
