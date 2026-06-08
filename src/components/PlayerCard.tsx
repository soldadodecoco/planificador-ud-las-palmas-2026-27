"use client";

import { DecisionButtons } from "@/components/DecisionButtons";
import { Decision, DecisionType, DecisionValue, Player } from "@/types";

type Props = {
  player: Player;
  decision?: Decision;
  decisionTypeOverride?: DecisionType;
  onDecision: (player: Player, value: DecisionValue, label: string) => void;
  onClearDecision: (player: Player) => void;
};

const salidaStrength: Record<
  string,
  {
    badge: string;
    title: string;
    icon: React.ReactNode;
  }
> = {
  Alta: {
    badge: "bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:scale-110 shadow-xs",
    title: "Salida muy probable (Alta)",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
    )
  },
  "Media alta": {
    badge: "bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100 hover:scale-110 shadow-xs",
    title: "Salida probable (Media alta)",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
    )
  },
  Media: {
    badge: "bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100 hover:scale-110 shadow-xs",
    title: "Situación incierta (Media)",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    )
  },
  "Media baja": {
    badge: "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100 hover:scale-110 shadow-xs",
    title: "Poco probable que salga (Media baja)",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    )
  },
  Baja: {
    badge: "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100 hover:scale-110 shadow-xs",
    title: "Se queda en el club (Salida baja)",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    )
  }
};

export function PlayerCard({ player, decision, decisionTypeOverride, onDecision, onClearDecision }: Props) {
  return (
    <article
      className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition"
    >
      <div className="grid grid-cols-[92px_1fr] gap-3 p-3 sm:grid-cols-[112px_1fr]">
        <div className="h-28 overflow-hidden rounded-md bg-slate-100 sm:h-32">
          {player.foto_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={player.foto_url} alt={player.jugador} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center bg-[#07182f] text-xl font-black text-[#ffe000]">
              {player.jugador.slice(0, 1)}
            </div>
          )}
        </div>

        <div className="min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-lg font-black leading-tight text-slate-950">{player.jugador}</h3>
              <p className="mt-1 text-sm font-bold text-[#0057b8]">{player.posicion || "Sin posición"}</p>
              {(player.jugador === "Sergio Ruiz" || player.jugador === "Saliou Mandiang") && (
                <span className="mt-1 inline-block rounded border border-indigo-200 bg-indigo-50 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-indigo-700">
                  Vuelve tras cesión
                </span>
              )}
            </div>
            <div className="flex shrink-0 items-start gap-1.5">
              {player.posible_salida && (() => {
                const config = salidaStrength[player.posible_salida] ?? {
                  badge: "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 hover:scale-110 shadow-xs",
                  title: `Probabilidad de salida: ${player.posible_salida}`,
                  icon: (
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="16" />
                      <line x1="8" y1="12" x2="16" y2="12" />
                    </svg>
                  )
                };
                return (
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-200 cursor-help ${config.badge}`}
                    title={config.title}
                    aria-label={config.title}
                  >
                    {config.icon}
                  </div>
                );
              })()}
            </div>
          </div>

          <div className="mt-3 space-y-2 text-sm text-slate-700">
            {player.fin_de_contrato && player.fin_de_contrato !== "?" && <p>Fin de contrato: {player.fin_de_contrato}</p>}
            {player.filial === "Sí" && player.minutos_jugados > 0 && <p>Minutos: {player.minutos_jugados}</p>}
            {player.filial === "Sí" && player.goles > 0 && <p>Goles: {player.goles}</p>}
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 p-3">
        <DecisionButtons
          type={decisionTypeOverride || player.tipo_decision}
          selected={decision}
          onSelect={(value, label) => onDecision(player, value, label)}
          onClear={() => onClearDecision(player)}
        />
      </div>
    </article>
  );
}
