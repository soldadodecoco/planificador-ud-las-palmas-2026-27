import { allPlayers } from "@/lib/players";
import { ShareImageTemplate } from "@/lib/shareImageTemplate";
import { calculatePlanningLabel, generateSummary } from "@/lib/summary";
import { Decision, MarketPriority, Player, SummaryGroups } from "@/types";
import { Resvg } from "@resvg/resvg-js";
import { createElement } from "react";
import fs from "node:fs/promises";
import path from "node:path";
import satori from "satori";

export const runtime = "nodejs";

type Body = {
  decisions: Record<string, Decision>;
  priorities: MarketPriority[];
  variant?: "planning" | "positions";
};

type ImagePlayer = Player & { imageSrc?: string; imageStatus?: string };

async function imageToDataUrl(url: string) {
  if (!url) return undefined;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (!response.ok) return undefined;
    const contentType = response.headers.get("content-type") || "image/png";
    const buffer = Buffer.from(await response.arrayBuffer());
    return `data:${contentType};base64,${buffer.toString("base64")}`;
  } catch {
    return undefined;
  }
}

async function hydrateImages(groups: SummaryGroups, decisions: Record<string, Decision>) {
  const unique = new Map<string, Player>();
  Object.values(groups).forEach((players) => players.forEach((player) => unique.set(player.id, player)));

  const imageEntries = await Promise.all(
    [...unique.values()].map(async (player) => [player.id, await imageToDataUrl(player.foto_url)] as const)
  );
  const images = new Map(imageEntries);

  return Object.fromEntries(
    Object.entries(groups).map(([key, players]) => [
      key,
      players.map((player) => ({ ...player, imageSrc: images.get(player.id), imageStatus: decisions[player.id]?.decisionValue }))
    ])
  ) as Record<keyof SummaryGroups, ImagePlayer[]>;
}

export async function POST(request: Request) {
  const body = (await request.json()) as Body;
  const decisions = body.decisions || {};
  const priorities = body.priorities || [];
  const variant = body.variant || "planning";
  const groups = generateSummary(allPlayers, decisions);

  (Object.keys(groups) as (keyof typeof groups)[]).forEach((key) => {
    if (key !== "cantera") {
      groups[key] = groups[key].filter(
        (player) => player.tipo_decision !== "filial" && player.tipo_decision !== "fin_contrato_filial"
      );
    }
  });

  const canteraAllowed = ["subir", "pretemporada", "renovar_y_pretemporada", "renovar_y_subir"];
  groups.cantera = groups.cantera.filter(
    (player) =>
      (player.tipo_decision === "filial" || player.tipo_decision === "fin_contrato_filial") &&
      canteraAllowed.includes(decisions[player.id]?.decisionValue as string)
  );

  const positionOrder: Record<string, number> = {
    Portero: 1,
    Defensa: 2,
    Centrocampista: 3,
    Atacante: 4,
    Entrenador: 0
  };
  const sortPlayers = (players: Player[]) =>
    [...players].sort((a, b) => (positionOrder[a.posicion] || 99) - (positionOrder[b.posicion] || 99));

  (Object.keys(groups) as (keyof typeof groups)[]).forEach((key) => {
    groups[key] = sortPlayers(groups[key]);
  });

  const label = calculatePlanningLabel(allPlayers, decisions, priorities);
  const groupsWithImages = await hydrateImages(groups, decisions);
  const fontPath = path.join(process.cwd(), "src", "assets", "fonts", "Manrope.ttf");
  const boldFontPath = path.join(process.cwd(), "src", "assets", "fonts", "Archivo.ttf");
  const stadiumPath = path.join(process.cwd(), "public", "stadium.jpg");
  const logoPath = path.join(process.cwd(), "public", "logo.png");
  const [fontData, boldFontData, stadiumBuffer, logoBuffer] = await Promise.all([
    fs.readFile(fontPath),
    fs.readFile(boldFontPath),
    fs.readFile(stadiumPath).catch(() => null),
    fs.readFile(logoPath).catch(() => null)
  ]);

  const background = stadiumBuffer ? `data:image/jpeg;base64,${stadiumBuffer.toString("base64")}` : undefined;
  const logo = logoBuffer ? `data:image/png;base64,${logoBuffer.toString("base64")}` : undefined;

  const svg = await satori(
    createElement(ShareImageTemplate, { groups: groupsWithImages, priorities, label, background, logo, variant }),
    {
    width: 2160,
    height: 2700,
    fonts: [
      {
        name: "Manrope",
        data: fontData,
        weight: 400,
        style: "normal"
      },
      {
        name: "Archivo",
        data: boldFontData,
        weight: 900,
        style: "normal"
      }
    ]
    }
  );

  const png = new Resvg(svg, {
    fitTo: {
      mode: "width",
      value: 2160
    }
  }).render().asPng();

  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "no-store",
      "Content-Disposition": 'attachment; filename="mi-planificacion-ud-las-palmas-2026-27.png"'
    }
  });
}
