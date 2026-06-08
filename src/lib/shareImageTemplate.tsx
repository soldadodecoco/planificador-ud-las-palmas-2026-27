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

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        background: "rgba(0, 87, 184, 0.45)",
        border: "3px solid rgba(255, 224, 0, 0.5)",
        boxShadow: "0 0 40px rgba(0,87,184,0.4), inset 0 0 30px rgba(255,224,0,0.1)",
        color: "white",
        borderRadius: 40,
        padding: 45,
        marginTop: "auto"
      }}
    >
      <div style={{ display: "flex", fontSize: 52, lineHeight: 1, fontWeight: 900, color: "#ffe000", letterSpacing: 2 }}>
        OBJETIVOS DE MERCADO
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 20, marginTop: 35 }}>
        {active.length ? (
          active.map((priority) => (
            <div
              key={priority.positionId}
              style={{
                display: "flex",
                alignItems: "center",
                borderRadius: 22,
                background: priority.priority === "high" ? "#ef4444" : priority.priority === "medium" ? "#f97316" : "rgba(255,255,255,0.1)",
                color: "white",
                padding: "18px 28px",
                fontSize: 32,
                fontWeight: 900,
                border: priority.priority === "low" ? "2px solid rgba(255,255,255,0.3)" : "none",
                boxShadow: priority.priority === "high" ? "0 10px 25px rgba(239,68,68,0.4)" : "none"
              }}
            >
              <span style={{ color: "rgba(255,255,255,0.8)", marginRight: 12 }}>{priority.positionLabel}</span> 
              <span>{priorityLabels[priority.priority].toUpperCase()}</span>
            </div>
          ))
        ) : (
          <div style={{ display: "flex", fontSize: 32, fontWeight: 900, opacity: 0.6 }}>Plantilla cerrada</div>
        )}
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
          {logo && (
            <div style={{ display: "flex", borderRadius: 160, boxShadow: "0 0 80px rgba(255,224,0,0.25)", background: "rgba(255,255,255,0.05)", padding: 25 }}>
              <img src={logo} width={250} height={250} style={{ objectFit: "contain" }} />
            </div>
          )}
          <div style={{ display: "flex", fontFamily: "Archivo", marginTop: 45, fontSize: 100, lineHeight: 1, fontWeight: 900, color: "white", textTransform: "uppercase", letterSpacing: 6 }}>
            Planificación Deportiva
          </div>
          <div style={{ display: "flex", fontFamily: "Archivo", marginTop: 25, fontSize: 50, lineHeight: 1, fontWeight: 900, color: "#ffe000", letterSpacing: 16 }}>
            UD LAS PALMAS 2026/27
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
