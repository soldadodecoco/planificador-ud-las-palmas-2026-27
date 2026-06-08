import { priorityLabels } from "@/lib/market";
import { MarketPriority, Player, SummaryGroups } from "@/types";

type ImagePlayer = Player & { imageSrc?: string };
type ImageGroups = Record<keyof SummaryGroups, ImagePlayer[]>;

type Props = {
  groups: ImageGroups;
  priorities: MarketPriority[];
  label: string;
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
        <div style={{ fontSize: 23, lineHeight: 1.05, fontWeight: 900 }}>{player.jugador}</div>
        <div style={{ marginTop: 4, fontSize: 15, lineHeight: 1, fontWeight: 700, color: "#0057b8" }}>
          {player.posicion}
        </div>
      </div>
    </div>
  );
}

function Block({ title, players, compact = false }: { title: string; players: ImagePlayer[]; compact?: boolean }) {
  return (
    <div style={{ ...panel, width: 970, minHeight: compact ? 220 : 300 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        <div style={{ fontSize: 42, lineHeight: 1, fontWeight: 900, color: "#ffe000" }}>{title}</div>
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
        background: "#ffe000",
        color: "#07182f",
        borderRadius: 30,
        padding: 30,
        minHeight: 245
      }}
    >
      <div style={{ fontSize: 46, lineHeight: 1, fontWeight: 900 }}>Prioridades de mercado</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 24 }}>
        {active.length ? (
          active.map((priority) => (
            <div
              key={priority.positionId}
              style={{
                display: "flex",
                borderRadius: 18,
                background: "#07182f",
                color: "white",
                padding: "14px 18px",
                fontSize: 27,
                fontWeight: 900
              }}
            >
              {priority.positionLabel} · {priorityLabels[priority.priority]}
            </div>
          ))
        ) : (
          <div style={{ fontSize: 28, fontWeight: 900 }}>Sin prioridades</div>
        )}
      </div>
    </div>
  );
}

export function ShareImageTemplate({ groups, priorities, label }: Props) {
  const cedidos = [...groups.cesiones, ...groups.compras];

  return (
    <div
      style={{
        width: W,
        height: H,
        display: "flex",
        flexDirection: "column",
        padding: 86,
        color: "white",
        background:
          "linear-gradient(135deg, #ffe000 0 13%, transparent 13%), linear-gradient(160deg, #06152b 0%, #082b57 56%, #0057b8 100%)",
        fontFamily: "Arial"
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 40 }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 40, letterSpacing: 8, fontWeight: 900, color: "#07182f" }}>UD LAS PALMAS</div>
          <div style={{ marginTop: 116, fontSize: 92, lineHeight: 0.96, fontWeight: 900, maxWidth: 1180 }}>
            Mi planificación 2026/27
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 28,
            background: "#ffe000",
            color: "#07182f",
            padding: "24px 36px",
            fontSize: 48,
            lineHeight: 1,
            fontWeight: 900,
            maxWidth: 540,
            textAlign: "center"
          }}
        >
          {label}
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 24, marginTop: 84 }}>
        <Block title="Renovaciones" players={groups.renovaciones} />
        <Block title="Salidas" players={groups.salidas} />
        <Block title="Cedidos / compras" players={cedidos} compact />
        <Block title="Siguen" players={groups.siguen} compact />
        <Block title="Las Palmas Atlético" players={groups.cantera} />
        <Block title="Dudas" players={groups.dudas} />
      </div>

      <div style={{ marginTop: 24 }}>
        <MarketBlock priorities={priorities} />
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "auto",
          paddingTop: 40,
          fontSize: 28,
          fontWeight: 900,
          color: "rgba(255,255,255,0.70)"
        }}
      >
        <div>Planificador UD Las Palmas 2026/27</div>
        <div>Imagen generada por aficionados</div>
      </div>
    </div>
  );
}
