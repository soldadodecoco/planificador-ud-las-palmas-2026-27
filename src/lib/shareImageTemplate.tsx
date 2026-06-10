import { MarketPriority, Player, SummaryGroups } from "@/types";

type ImagePlayer = Player & { imageSrc?: string; imageStatus?: string };
type ImageGroups = Record<keyof SummaryGroups, ImagePlayer[]>;

type Props = {
  groups: ImageGroups;
  priorities: MarketPriority[];
  label: string;
  background?: string;
  logo?: string;
  variant?: "planning" | "positions";
};

const W = 2160;
const H = 2700;

const panel = {
  display: "flex",
  flexDirection: "column" as const,
  background: "rgba(255,255,255,0.10)",
  border: "2px solid rgba(255,255,255,0.18)",
  borderRadius: 30,
  padding: 26
};

const salidaValues = new Set([
  "dejar_salir",
  "asumir_salida",
  "asumir_salida_cedido",
  "salida",
  "vender",
  "buscar_salida",
  "dejar_marchar"
]);
const pretemporadaValues = new Set(["pretemporada", "renovar_y_pretemporada"]);

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function PlayerPill({
  player,
  muted = false,
  preseason = false
}: {
  player: ImagePlayer;
  muted?: boolean;
  preseason?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        width: 300,
        minHeight: 66,
        padding: "8px 12px",
        borderRadius: 18,
        background: muted ? "rgba(226,232,240,0.82)" : "rgba(255,255,255,0.94)",
        color: "#07182f"
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 50,
          height: 50,
          borderRadius: 14,
          overflow: "hidden",
          background: "#07182f",
          position: "relative",
          flexShrink: 0,
          color: "#ffe000",
          fontSize: 18,
          fontWeight: 900
        }}
      >
        {player.imageSrc ? (
          <img
            src={player.imageSrc}
            width={50}
            height={50}
            style={{ objectFit: "cover", opacity: muted ? 0.45 : 1 }}
          />
        ) : (
          initials(player.jugador)
        )}
        {muted && (
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              display: "flex",
              background: "rgba(148,163,184,0.62)"
            }}
          />
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            fontSize: 23,
            lineHeight: 1.05,
            fontWeight: 900,
            color: preseason ? "#38bdf8" : "#07182f",
            textDecoration: muted ? "line-through" : "none"
          }}
        >
          {player.jugador}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 4,
            fontSize: 15,
            lineHeight: 1,
            fontWeight: 700,
            color: preseason ? "#38bdf8" : "#0057b8"
          }}
        >
          {player.posicion}
        </div>
      </div>
    </div>
  );
}

function Block({
  title,
  players,
  compact = false,
  color = "#ffe000"
}: {
  title: string;
  players: ImagePlayer[];
  compact?: boolean;
  color?: string;
}) {
  return (
    <div style={{ ...panel, width: "100%", minHeight: compact ? 220 : 300 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        <div style={{ display: "flex", fontSize: 42, lineHeight: 1, fontWeight: 900, color }}>{title}</div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minWidth: 58,
            height: 48,
            borderRadius: 999,
            background: color,
            color: color === "#ffe000" ? "#07182f" : "white",
            fontSize: 28,
            fontWeight: 900
          }}
        >
          {players.length}
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 20 }}>
        {players.length ? (
          players.map((player) => <PlayerPill key={player.id} player={player} />)
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: 70,
              borderRadius: 18,
              border: "2px dashed rgba(255,255,255,0.22)",
              color: "rgba(255,255,255,0.55)",
              fontSize: 24,
              fontWeight: 800
            }}
          >
            Sin decisiones
          </div>
        )}
      </div>
    </div>
  );
}

function MarketBlock({ priorities }: { priorities: MarketPriority[] }) {
  const active = priorities.filter((priority) => priority.priority !== "none");
  if (active.length === 0) return null;

  const high = active.filter((p) => p.priority === "high");
  const medium = active.filter((p) => p.priority === "medium");
  const low = active.filter((p) => p.priority === "low");

  const PriorityList = ({ title, items, color }: { title: string; items: MarketPriority[]; color: string }) => {
    if (items.length === 0) return null;
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", fontSize: 28, fontWeight: 900, color }}>{title}</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {items.map((p) => (
            <div
              key={p.positionId}
              style={{
                display: "flex",
                background: "rgba(255,255,255,0.94)",
                color: "#07182f",
                borderRadius: 14,
                padding: "8px 16px",
                fontSize: 24,
                fontWeight: 800
              }}
            >
              {p.positionLabel}
              {p.targetCount > 0 ? ` · ${p.targetCount}` : ""}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div style={{ ...panel, width: "100%", marginTop: "auto", minHeight: "auto", padding: 35 }}>
      <div style={{ display: "flex", fontSize: 42, lineHeight: 1, fontWeight: 900, color: "#ffe000", marginBottom: 24 }}>
        Objetivos de mercado
      </div>
      <div style={{ display: "flex", gap: 40 }}>
        <PriorityList title="PRIORIDAD ALTA" items={high} color="#ef4444" />
        <PriorityList title="PRIORIDAD MEDIA" items={medium} color="#f97316" />
        <PriorityList title="PRIORIDAD BAJA" items={low} color="#eab308" />
      </div>
    </div>
  );
}

function uniquePlayers(groups: ImageGroups) {
  const byId = new Map<string, ImagePlayer>();
  Object.values(groups)
    .flat()
    .forEach((player) => {
      if (!byId.has(player.id)) byId.set(player.id, player);
    });
  return [...byId.values()];
}

function PositionBlocks({ groups }: { groups: ImageGroups }) {
  const players = uniquePlayers(groups).filter((player) => player.posicion !== "Entrenador");
  const blocks = [
    { title: "Porteros", value: "Portero" },
    { title: "Defensas", value: "Defensa" },
    { title: "Centrocampistas", value: "Centrocampista" },
    { title: "Atacantes", value: "Atacante" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, flex: 1, marginTop: 40 }}>
      {blocks.map((block) => {
        const blockPlayers = players.filter((player) => player.posicion === block.value);
        const stayingCount = blockPlayers.filter((player) => !salidaValues.has(player.imageStatus || "")).length;
        if (blockPlayers.length === 0) return null;

        return (
          <div key={block.title} style={{ ...panel, width: "100%", minHeight: 260 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
              <div style={{ display: "flex", fontSize: 42, lineHeight: 1, fontWeight: 900, color: "#ffe000" }}>{block.title}</div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: 58,
                  height: 48,
                  borderRadius: 999,
                  background: "#ffe000",
                  color: "#07182f",
                  fontSize: 28,
                  fontWeight: 900
                }}
              >
                {stayingCount}
              </div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 20 }}>
              {blockPlayers.map((player) => (
                <PlayerPill
                  key={player.id}
                  player={player}
                  muted={salidaValues.has(player.imageStatus || "")}
                  preseason={pretemporadaValues.has(player.imageStatus || "")}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CoachPill({ entrenador, status }: { entrenador: ImagePlayer; status: string }) {
  return (
    <div style={{ display: "flex", width: "100%", justifyContent: "center", marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 20, padding: "12px 32px 12px 12px", background: "rgba(255,255,255,0.95)", borderRadius: 100, border: "4px solid rgba(255,255,255,0.15)", backgroundClip: "padding-box" }}>
        <div style={{ display: "flex", width: 80, height: 80, borderRadius: 999, overflow: "hidden", background: "#07182f", color: "#ffe000", fontSize: 28, fontWeight: 900, alignItems: "center", justifyContent: "center" }}>
          {entrenador.imageSrc ? <img src={entrenador.imageSrc} width={80} height={80} style={{ objectFit: "cover" }} /> : initials(entrenador.jugador)}
        </div>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ display: "flex", fontSize: 20, fontWeight: 900, color: "#0057b8", marginBottom: 4 }}>ENTRENADOR</div>
          <div style={{ display: "flex", fontSize: 34, fontWeight: 900, color: "#07182f", lineHeight: 1 }}>{entrenador.jugador}</div>
        </div>
        <div style={{ width: 3, height: 60, background: "#e2e8f0", marginLeft: 16, marginRight: 16 }} />
        <div style={{ display: "flex", fontSize: 34, fontWeight: 900, color: status === "Se marcha" ? "#ef4444" : status === "Se queda" ? "#22c55e" : "#f59e0b" }}>
          {status.toUpperCase()}
        </div>
      </div>
    </div>
  );
}

export function ShareImageTemplate({ groups, priorities, background, logo, variant = "planning" }: Props) {
  const allPlayers = Object.values(groups).flat();
  const entrenador = allPlayers.find((p) => p.posicion === "Entrenador") as ImagePlayer | undefined;
  let entrenadorStatus = "Duda";

  if (entrenador) {
    if (groups.salidas?.some((p) => p.id === entrenador.id) || groups.escucharOfertas?.some((p) => p.id === entrenador.id)) {
      entrenadorStatus = "Se marcha";
    } else if (groups.siguen?.some((p) => p.id === entrenador.id) || groups.renovaciones?.some((p) => p.id === entrenador.id)) {
      entrenadorStatus = "Se queda";
    }
  }

  const filteredGroups = {} as ImageGroups;
  (Object.keys(groups) as (keyof ImageGroups)[]).forEach((key) => {
    filteredGroups[key] = groups[key].filter((p) => p.posicion !== "Entrenador");
  });

  return (
    <div style={{ display: "flex", width: W, height: H }}>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: W,
          height: H,
          display: "flex",
          backgroundColor: "#07182f"
        }}
      >
        {background && (
          <img
            src={background}
            width={W}
            height={H}
            style={{ position: "absolute", top: 0, left: 0, objectFit: "cover", opacity: 0.25 }}
          />
        )}
      </div>

      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: W,
          height: H,
          display: "flex",
          flexDirection: "column",
          padding: 86,
          color: "white",
          fontFamily: "Manrope"
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", marginBottom: 30 }}>
          <div style={{ display: "flex", fontFamily: "Manrope", fontSize: 30, letterSpacing: 10, fontWeight: 400, color: "white", marginBottom: 35 }}>
            UD LAS PALMAS 2026/27
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 35 }}>
            {logo && <img src={logo} width={180} height={180} style={{ objectFit: "contain" }} />}
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", height: 180 }}>
              <div style={{ display: "flex", fontFamily: "Archivo", fontSize: 90, lineHeight: 1, fontWeight: 900, color: "white", textTransform: "uppercase", letterSpacing: 2 }}>
                PLANIFICACIÓN
              </div>
              <div style={{ display: "flex", fontFamily: "Archivo", fontSize: 90, lineHeight: 1, fontWeight: 900, color: "#ffe000", textTransform: "uppercase", letterSpacing: 2 }}>
                DEPORTIVA
              </div>
            </div>
          </div>
        </div>

        {entrenador && <CoachPill entrenador={entrenador} status={entrenadorStatus} />}

        {variant === "positions" ? (
          <PositionBlocks groups={filteredGroups} />
        ) : (
          <div style={{ display: "flex", flex: 1, gap: 40, marginTop: 40 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 24, width: 970 }}>
              {filteredGroups.renovaciones.length > 0 && <Block title="Renovaciones" players={filteredGroups.renovaciones} />}
              {filteredGroups.siguen.length > 0 && <Block title="Continúan" players={filteredGroups.siguen} compact />}
              {filteredGroups.cantera.length > 0 && <Block title="Suben de la cantera" players={filteredGroups.cantera} />}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 24, width: 970 }}>
              {filteredGroups.salidas.length > 0 && <Block title="Salidas" players={filteredGroups.salidas} color="#ef4444" />}
              {filteredGroups.dudas.length > 0 && <Block title="Dudas" players={filteredGroups.dudas} />}
            </div>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", marginTop: "auto" }}>
          <MarketBlock priorities={priorities} />
        </div>
      </div>
    </div>
  );
}
