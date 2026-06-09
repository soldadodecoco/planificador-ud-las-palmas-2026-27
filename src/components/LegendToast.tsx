"use client";

import { useEffect, useState } from "react";
import { salidaStrength } from "./PlayerCard";

export function LegendToast() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 7000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 rounded-xl border border-slate-200 bg-white p-4 shadow-2xl animate-[section-enter_0.4s_ease-out_both]">
      <div className="mb-2 flex items-center justify-between">
        <h4 className="text-sm font-black text-slate-950">Probabilidad de salida</h4>
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          aria-label="Cerrar"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <p className="mb-4 text-xs font-medium text-slate-500">
        Estos iconos, basados en rumores de prensa y situación contractual, indican la probabilidad de que un jugador abandone el club:
      </p>
      <div className="space-y-2">
        {Object.entries(salidaStrength).map(([key, config]) => (
          <div key={key} className="flex items-center gap-3">
            <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${config.badge}`}>
              <div className="scale-75">{config.icon}</div>
            </div>
            <span className="text-xs font-bold text-slate-700">{config.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
