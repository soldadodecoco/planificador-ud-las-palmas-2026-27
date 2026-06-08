"use client";

import { calculatePlanningLabel, copyableSummary, generateSummary } from "@/lib/summary";
import { Decision, MarketPriority, Player, SectionId } from "@/types";
import { useEffect, useMemo, useState } from "react";

type Props = {
  players: Player[];
  decisions: Record<string, Decision>;
  priorities: MarketPriority[];
  pendingCount: number;
  onEdit: (section: SectionId) => void;
  onReset: () => void;
};

export function ShareImage({ players, decisions, priorities, pendingCount, onEdit, onReset }: Props) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const groups = useMemo(() => generateSummary(players, decisions), [players, decisions]);
  const label = useMemo(() => calculatePlanningLabel(players, decisions, priorities), [players, decisions, priorities]);

  // Generate preview automatically on mount or when decisions/priorities change
  useEffect(() => {
    const fetchPreview = async () => {
      setLoadingPreview(true);
      try {
        const response = await fetch("/api/share-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ decisions, priorities })
        });
        if (response.ok) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          setPreviewUrl(url);
        }
      } catch (error) {
        console.error("Error cargando vista previa:", error);
      } finally {
        setLoadingPreview(false);
      }
    };
    fetchPreview();

    // Cleanup blob URL to prevent memory leaks
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [decisions, priorities]);

  async function downloadImage() {
    if (previewUrl) {
      const link = document.createElement("a");
      link.download = "mi-planificacion-ud-las-palmas-2026-27.png";
      link.href = previewUrl;
      link.click();
      return;
    }

    // Fallback if preview isn't ready
    setDownloading(true);
    try {
      const response = await fetch("/api/share-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decisions, priorities })
      });
      if (!response.ok) throw new Error("No se pudo generar la imagen.");
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
          disabled={downloading || (!previewUrl && loadingPreview)}
          className="rounded-md bg-[#0057b8] px-4 py-3 font-black text-white disabled:opacity-50"
        >
          {downloading || loadingPreview ? "Generando..." : "Descargar imagen"}
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

      <div className="rounded-lg border border-slate-200 bg-slate-100 p-2 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
        {loadingPreview ? (
          <div className="flex flex-col items-center gap-4 text-slate-500">
            <svg className="animate-spin h-10 w-10 text-[#0057b8]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="font-bold">Renderizando vista previa...</span>
          </div>
        ) : previewUrl ? (
          <div className="w-full max-w-[500px] overflow-hidden rounded-md shadow-2xl ring-1 ring-slate-900/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="Vista previa de tu planificación" className="w-full h-auto block" />
          </div>
        ) : (
          <p className="text-sm font-bold text-slate-500">Error al cargar la vista previa</p>
        )}
      </div>
    </div>
  );
}
