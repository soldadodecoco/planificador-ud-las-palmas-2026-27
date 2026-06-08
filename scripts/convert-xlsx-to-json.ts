import fs from "node:fs";
import path from "node:path";
import { readFile, utils } from "xlsx";
import type { Player } from "../src/types";

const inputPath = process.argv[2] || "C:\\Users\\jdieg\\Downloads\\plan_plantilla.xlsx";
const outputPath = path.join(process.cwd(), "src", "data", "players.json");

function text(value: unknown) {
  if (value === undefined || value === null) return "";
  return String(value).trim();
}

function numberValue(value: unknown) {
  if (value === undefined || value === null || value === "") return 0;
  const normalized = Number(String(value).replace(",", "."));
  return Number.isFinite(normalized) ? normalized : 0;
}

function normalizePhotoUrl(value: unknown) {
  const raw = text(value);
  if (!raw) return "";
  const pngIndex = raw.toLowerCase().indexOf(".png");
  if (pngIndex !== -1) return raw.slice(0, pngIndex + 4);
  return raw;
}

function slugify(value: string, index: number) {
  const slug = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || `jugador-${index + 1}`;
}

if (!fs.existsSync(inputPath)) {
  throw new Error(`No existe el Excel: ${inputPath}`);
}

const workbook = readFile(inputPath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rows = utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });

const players: Player[] = rows
  .filter((row) => text(row.jugador))
  .map((row, index) => ({
    id: slugify(text(row.jugador), index),
    jugador: text(row.jugador),
    posicion: text(row.posicion) as Player["posicion"],
    fin_de_contrato: text(row.fin_de_contrato),
    tipo: text(row.tipo),
    opcion_compra: text(row.opcion_compra),
    obligatoria: text(row.obligatoria),
    precio_opcion_compra: text(row.precio_opcion_compra),
    filial: text(row.filial),
    posible_salida: text(row.posible_salida),
    tipo_decision: text(row.tipo_decision) as Player["tipo_decision"],
    foto_url: normalizePhotoUrl(row.foto_url),
    minutos_jugados: numberValue(row.minutos_jugados),
    goles: numberValue(row.goles),
    orden: numberValue(row.orden)
  }));

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(players, null, 2)}\n`, "utf8");

console.log(`Convertidos ${players.length} jugadores en ${outputPath}`);
