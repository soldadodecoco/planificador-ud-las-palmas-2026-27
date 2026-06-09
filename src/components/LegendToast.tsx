"use client";

import { useEffect, useState } from "react";
import { salidaStrength } from "./PlayerCard";

export function LegendToast() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);

  useEffect(() => {
    // Open automatically on first render after a short delay
    const initialTimer = setTimeout(() => {
      setIsOpen(true);
      setHasOpened(true);
    }, 500);

    return () => clearTimeout(initialTimer);
  }, []);

  useEffect(() => {
    // If it was opened automatically, close it after 8 seconds
    if (isOpen && hasOpened) {
      const closeTimer = setTimeout(() => {
        setIsOpen(false);
      }, 8000);
      return () => clearTimeout(closeTimer);
    }
  }, [isOpen, hasOpened]);

  return (
    <div className="relative flex items-center">
      {/* Tiny Info Icon */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setHasOpened(false); // Stop auto-close if triggered manually
        }}
        className="flex h-4 w-4 items-center justify-center rounded-full bg-slate-100 text-slate-500 shadow-xs ring-1 ring-slate-200 transition-colors hover:bg-slate-200 hover:text-slate-700"
        aria-label="Información sobre iconos"
        title="Ver leyenda de iconos"
      >
        <svg className="h-2.5 w-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>

      {/* Popover */}
      <div
        className={`absolute right-0 top-6 z-50 w-64 origin-top-right sm:origin-top-left sm:left-0 sm:right-auto sm:-translate-x-4 rounded-xl border border-slate-200 bg-white p-3 shadow-xl transition-all duration-300 ease-out ${
          isOpen ? "scale-100 opacity-100 pointer-events-auto translate-y-0" : "scale-95 opacity-0 pointer-events-none -translate-y-2"
        }`}
      >
        <div className="mb-1.5 flex items-center justify-between">
          <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-950">Leyenda</h4>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="Cerrar"
          >
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="mb-3 text-[10px] font-medium leading-relaxed text-slate-500">
          Estos iconos, basados en rumores de prensa y situación contractual, indican la probabilidad de que un jugador abandone el club:
        </p>
        <div className="space-y-1.5">
          {Object.entries(salidaStrength).map(([key, config]) => (
            <div key={key} className="flex items-center gap-2">
              <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${config.badge.replace("hover:scale-110", "")}`}>
                <div className="scale-[0.5]">{config.icon}</div>
              </div>
              <span className="text-[10px] font-bold text-slate-700">{config.title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
