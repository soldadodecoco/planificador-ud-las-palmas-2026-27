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
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Toast Panel */}
      <div
        className={`mb-4 w-80 origin-bottom-right rounded-xl border border-slate-200 bg-white p-4 shadow-2xl transition-all duration-500 ease-in-out ${
          isOpen ? "scale-100 opacity-100 pointer-events-auto translate-y-0" : "scale-50 opacity-0 pointer-events-none translate-y-8"
        }`}
      >
        <div className="mb-2 flex items-center justify-between">
          <h4 className="text-sm font-black text-slate-950">Probabilidad de salida</h4>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
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

      {/* Floating Button Icon */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setHasOpened(false); // Stop auto-close if triggered manually
        }}
        className={`flex h-12 w-12 items-center justify-center rounded-full bg-[#07182f] text-[#ffe000] shadow-lg transition-transform duration-300 hover:scale-110 active:scale-95 ${
          isOpen ? "rotate-180 scale-0 opacity-0 pointer-events-none absolute" : "rotate-0 scale-100 opacity-100"
        }`}
        aria-label="Leyenda de iconos"
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" strokeWidth="2" />
          <path d="M12 16v-4" strokeWidth="2" strokeLinecap="round" />
          <path d="M12 8h.01" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
