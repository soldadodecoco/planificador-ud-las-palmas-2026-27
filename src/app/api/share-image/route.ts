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
};

type ImagePlayer = Player & { imageSrc?: string };

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

async function hydrateImages(groups: SummaryGroups) {
  const unique = new Map<string, Player>();
  Object.values(groups).forEach((players) => players.forEach((player) => unique.set(player.id, player)));

  const imageEntries = await Promise.all(
    [...unique.values()].map(async (player) => [player.id, await imageToDataUrl(player.foto_url)] as const)
  );
  const images = new Map(imageEntries);

  return Object.fromEntries(
    Object.entries(groups).map(([key, players]) => [
      key,
      players.map((player) => ({ ...player, imageSrc: images.get(player.id) }))
    ])
  ) as Record<keyof SummaryGroups, ImagePlayer[]>;
}

export async function POST(request: Request) {
  const body = (await request.json()) as Body;
  const decisions = body.decisions || {};
  const priorities = body.priorities || [];
  const groups = generateSummary(allPlayers, decisions);
  const label = calculatePlanningLabel(allPlayers, decisions, priorities);
  const groupsWithImages = await hydrateImages(groups);
  const fontPath = path.join(process.cwd(), "src", "assets", "fonts", "Arial.ttf");
  const boldFontPath = path.join(process.cwd(), "src", "assets", "fonts", "AgencyBold.ttf");
  const [fontData, boldFontData] = await Promise.all([fs.readFile(fontPath), fs.readFile(boldFontPath)]);

  const svg = await satori(createElement(ShareImageTemplate, { groups: groupsWithImages, priorities, label }), {
    width: 2160,
    height: 2700,
    fonts: [
      {
        name: "Arial",
        data: fontData,
        weight: 400,
        style: "normal"
      },
      {
        name: "Arial",
        data: boldFontData,
        weight: 900,
        style: "normal"
      }
    ]
  });

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
