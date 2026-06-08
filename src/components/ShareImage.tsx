"use client";

import { calculatePlanningLabel, copyableSummary, generateSummary } from "@/lib/summary";
import { Decision, MarketPriority, Player, SectionId } from "@/types";
import { useMemo, useState } from "react";

type Props = {
  players: Player[];
  decisions: Record<string, Decision>;
  priorities: MarketPriority[];
  pendingCount: number;
  onEdit: (section: SectionId) => void;
  onReset: () => void;
};

export function ShareImage({ players, decisions, priorities, pendingCount, onEdit, onReset }: Props) {
  const [downloading, setDownloading] = useState(false);
  const groups = useMemo(() => generateSummary(players, decisions), [players, decisions]);
  const label = useMemo(() => calculatePlanningLabel(players, decisions, priorities), [players, decisions, priorities]);

  async function downloadImage() {
    setDownloading(true);
    try {
      const response = await fetch("/api/share-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decisions, priorities })
      });

      if (!response.ok) {
        throw new Error("No se pudo generar la imagen.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = "mi-planificacion-ud-las-palmas-2026-27.png";
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }

  async function copySummary() {
    await navigator.clipboard.writeText(copyableSummary(groups, priorities, label));
  }

  return (
    <div className="space-y-5">
      {pendingCount > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-900">
          Quedan {pendingCount} jugadores sin decidir. Puedes generar la imagen igualmente.
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={downloadImage}
          disabled={downloading}
          className="rounded-md bg-[#0057b8] px-4 py-3 font-black text-white disabled:opacity-50"
        >
          {downloading ? "Generando..." : "Descargar imagen"}
        </button>
        <button type="button" onClick={copySummary} className="rounded-md bg-slate-900 px-4 py-3 font-bold text-white">
          Copiar resumen
        </button>
        <button type="button" onClick={() => onEdit("calientes")} className="rounded-md bg-white px-4 py-3 font-bold text-slate-900 ring-1 ring-slate-200">
          Editar planificación
        </button>
        <button type="button" onClick={onReset} className="rounded-md bg-white px-4 py-3 font-bold text-red-700 ring-1 ring-red-200">
          Reiniciar planificación
        </button>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-bold text-slate-700">
          La imagen se genera en servidor a 2160x2700 px con Satori y Resvg. Incluye fotos y todas las decisiones, sin recortes.
        </p>
      </div>
    </div>
  );
}
