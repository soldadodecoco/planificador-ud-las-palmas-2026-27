import { priorityLabels } from "@/lib/market";
import { MarketPriority, Player, SummaryGroups } from "@/types";

type ImagePlayer = Player & { imageSrc?: string };
type ImageGroups = Record<keyof SummaryGroups, ImagePlayer[]>;

type Props = {
  groups: ImageGroups;
  priorities: MarketPriority[];
  label: string;
  background?: string;
  logo?: string;
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

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function PlayerPill({ player }: { player: ImagePlayer }) {
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
        background: "rgba(255,255,255,0.94)",
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
          flexShrink: 0,
          color: "#ffe000",
          fontSize: 18,
          fontWeight: 900
        }}
      >
        {player.imageSrc ? (
          <img src={player.imageSrc} width={50} height={50} style={{ objectFit: "cover" }} />
        ) : (
          initials(player.jugador)
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div style={{ display: "flex", fontSize: 23, lineHeight: 1.05, fontWeight: 900 }}>{player.jugador}</div>
        <div style={{ display: "flex", marginTop: 4, fontSize: 15, lineHeight: 1, fontWeight: 700, color: "#0057b8" }}>
          {player.posicion}
        </div>
      </div>
    </div>
  );
}

function Block({ title, players, compact = false, color = "#ffe000" }: { title: string; players: ImagePlayer[]; compact?: boolean; color?: string }) {
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

export function ShareImageTemplate({ groups, priorities, label, background, logo }: Props) {
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
        {/* Header Redesign */}
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

        <div style={{ display: "flex", flex: 1, gap: 40, marginTop: 84 }}>
          {/* Columna Izquierda */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24, width: 970 }}>
            {groups.renovaciones.length > 0 && <Block title="Renovaciones" players={groups.renovaciones} />}
            {groups.siguen.length > 0 && <Block title="Continúan" players={groups.siguen} compact />}
            {groups.cantera.length > 0 && <Block title="Suben de la cantera" players={groups.cantera} />}
            {groups.dudas.length > 0 && <Block title="Dudas" players={groups.dudas} />}
          </div>

          {/* Columna Derecha */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24, width: 970 }}>
            {groups.salidas.length > 0 && <Block title="Salidas" players={groups.salidas} color="#ef4444" />}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", marginTop: "auto" }}>
          <MarketBlock priorities={priorities} />
        </div>
      </div>
    </div>
  );
}
