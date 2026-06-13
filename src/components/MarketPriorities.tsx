"use client";

import { marketPositions } from "@/lib/market";
import { allPlayers } from "@/lib/players";
import { fieldPositionGroups, lineForPlayer } from "@/lib/fieldPositions";
import { calculateRosterCounts } from "@/lib/rosterCounts";
import { Decision, MarketPlayer, MarketPriority, Player } from "@/types";
import { useEffect, useMemo, useState } from "react";

type Props = {
  priorities: MarketPriority[];
  decisions: Record<string, Decision>;
  onChange: (priorities: MarketPriority[]) => void;
};

type MarketSearchRow = [
  string,
  string,
  string,
  string,
  number | null,
  MarketPlayer["position"],
  string,
  string,
  string,
  string,
  string
];

type IndexedMarketPlayer = MarketPlayer & {
  searchText: string;
  compactSearchText: string;
  searchTokens: string[];
};

const firstTeamDecisionValues = new Set([
  "renovar",
  "intentar_renovar",
  "mantener",
  "recuperar",
  "intentar_compra",
  "subir",
  "renovar_y_subir",
  "pretemporada",
  "renovar_y_pretemporada",
  "duda",
  "escuchar_ofertas"
]);

const preseasonValues = new Set(["pretemporada", "renovar_y_pretemporada"]);
const orangeValues = new Set(["duda", "intentar_renovar"]);
const redValues = new Set(["escuchar_ofertas"]);

function normalizeMarketPhoto(photo?: string) {
  const match = photo?.match(/^\/faces\/(\d+)\.png$/);
  return match ? `/api/fm-face/${match[1]}` : photo || "";
}

function MarketPlayerAvatar({ player }: { player: MarketPlayer }) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="h-9 w-9 shrink-0 overflow-hidden rounded bg-slate-100">
      {player.photo && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={player.photo} alt={player.displayName} className="h-full w-full object-cover" onError={() => setFailed(true)} />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-[#07182f] text-sm font-black text-[#ffe000]">
          {player.displayName.slice(0, 1)}
        </div>
      )}
    </div>
  );
}

function RosterPlayerAvatar({ player }: { player: Player }) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="h-8 w-8 shrink-0 overflow-hidden rounded bg-slate-100">
      {player.foto_url && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={player.foto_url} alt={player.jugador} className="h-full w-full object-cover" onError={() => setFailed(true)} />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-[#07182f] text-xs font-black text-[#ffe000]">
          {player.jugador.slice(0, 1)}
        </div>
      )}
    </div>
  );
}

function blankPriority(positionId: string): MarketPriority {
  const position = marketPositions.find((item) => item.id === positionId) || marketPositions[0];
  return {
    positionId: position.id,
    positionLabel: position.label,
    priority: "low",
    targetCount: 0,
    selectedPlayers: []
  };
}

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function candidateScore(player: IndexedMarketPlayer, normalizedQuery: string, compactQuery: string, queryTokens: string[]) {
  if (normalizedQuery.length < 2) return 0;

  const haystack = player.searchText;
  const compactHaystack = player.compactSearchText;
  const haystackTokens = player.searchTokens;

  if (haystack === normalizedQuery) return 100;
  if (haystack.startsWith(normalizedQuery)) return 90;
  if (compactHaystack.startsWith(compactQuery)) return 86;
  if (haystack.includes(normalizedQuery)) return 80;
  if (compactHaystack.includes(compactQuery)) return 76;

  let score = 0;
  for (const token of queryTokens) {
    const tokenScore = haystackTokens.some((candidate) => candidate === token)
      ? 16
      : haystackTokens.some((candidate) => candidate.startsWith(token) || token.startsWith(candidate))
        ? 13
        : compactHaystack.includes(token)
          ? 10
          : 0;

    if (!tokenScore) return 0;
    score += tokenScore;
  }

  return score;
}

function isLasPalmasClub(club: string) {
  const normalized = normalizeSearch(club);
  return (
    normalized === "las palmas" ||
    normalized === "las palmas atletico" ||
    normalized === "las palmas c" ||
    normalized === "u d las palmas" ||
    normalized === "u d las palmas atletico" ||
    normalized === "u d las palmas c"
  );
}

export function MarketPriorities({ priorities, decisions, onChange }: Props) {
  const [positionId, setPositionId] = useState(marketPositions[0].id);
  const [query, setQuery] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState<MarketPlayer | null>(null);
  const [marketPlayers, setMarketPlayers] = useState<IndexedMarketPlayer[] | null>(null);
  const [marketLoading, setMarketLoading] = useState(false);
  const [marketError, setMarketError] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const rosterCounts = useMemo(() => calculateRosterCounts(decisions, priorities), [decisions, priorities]);
  const plannedSquadByLine = useMemo(() => {
    const firstTeamPlayers = allPlayers.filter((player) => {
      if (player.posicion === "Entrenador") return false;
      const decision = decisions[player.id]?.decisionValue;
      return Boolean(decision && firstTeamDecisionValues.has(decision));
    });
    const lines = [
      { title: "Porteros", value: "Portero" },
      { title: "Defensas", value: "Defensa" },
      { title: "Centrocampistas", value: "Centrocampista" },
      { title: "Atacantes", value: "Atacante" }
    ];

    return lines
      .map((line) => ({
        ...line,
        groups: fieldPositionGroups(firstTeamPlayers.filter((player) => lineForPlayer(player) === line.value), line.value)
      }))
      .filter((line) => line.groups.some((group) => group.players.length > 0));
  }, [decisions]);

  const activeNeeds = priorities.filter((priority) => (priority.targetCount || 0) > 0 || (priority.selectedPlayers || []).length > 0);

  async function ensureMarketPlayers() {
    if (marketPlayers || marketLoading) return;
    setMarketLoading(true);
    setMarketError("");
    try {
      const response = await fetch("/data/marketSearch.json");
      if (!response.ok) throw new Error("No se pudo cargar mercado");
      const rows = (await response.json()) as MarketSearchRow[];
      setMarketPlayers(
        rows
          .map(([id, displayName, fullName, commonName, age, position, club, contractEnd, photo, searchText, compactSearchText]) => ({
            id,
            displayName,
            fullName,
            commonName,
            age,
            position,
            club,
            contractEnd,
            photo: normalizeMarketPhoto(photo),
            searchText: searchText || normalizeSearch([displayName, fullName, commonName, club].filter(Boolean).join(" ")),
            compactSearchText: compactSearchText || "",
            searchTokens: (searchText || normalizeSearch([displayName, fullName, commonName, club].filter(Boolean).join(" ")))
              .split(" ")
              .filter(Boolean)
          }))
          .filter((player) => !isLasPalmasClub(player.club))
      );
    } catch {
      setMarketError("No se pudo cargar la base de mercado.");
    } finally {
      setMarketLoading(false);
    }
  }

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedQuery(query), 150);
    return () => window.clearTimeout(timeout);
  }, [query]);

  function upsert(positionIdToUpdate: string, updater: (current: MarketPriority) => MarketPriority) {
    const existing = priorities.find((priority) => priority.positionId === positionIdToUpdate);
    const next = existing ? updater(existing) : updater(blankPriority(positionIdToUpdate));
    onChange(priorities.map((priority) => (priority.positionId === positionIdToUpdate ? next : priority)));
  }

  function addNeed() {
    upsert(positionId, (current) => {
      const selectedPlayers = (current.selectedPlayers || []).map((player) => ({ ...player, photo: normalizeMarketPhoto(player.photo) }));
      const alreadySelected = selectedCandidate && selectedPlayers.some((player) => player.id === selectedCandidate.id);
      const nextPlayers = selectedCandidate && !alreadySelected ? [...selectedPlayers, selectedCandidate] : selectedPlayers;
      return {
        ...current,
        priority: "low",
        selectedPlayers: nextPlayers,
        targetCount: Math.max((current.targetCount || 0) + 1, nextPlayers.length)
      };
    });
    setQuery("");
    setSelectedCandidate(null);
  }

  function removeSlot(targetPositionId: string) {
    upsert(targetPositionId, (current) => ({
      ...current,
      targetCount: Math.max((current.targetCount || 0) - 1, (current.selectedPlayers || []).length)
    }));
  }

  function removePlayer(targetPositionId: string, playerId: string) {
    upsert(targetPositionId, (current) => {
      const selectedPlayers = (current.selectedPlayers || []).filter((player) => player.id !== playerId);
      return {
        ...current,
        selectedPlayers,
        targetCount: Math.max((current.targetCount || 0) - 1, selectedPlayers.length)
      };
    });
  }

  function movePlayer(sourcePositionId: string, targetPositionId: string, player: MarketPlayer) {
    if (sourcePositionId === targetPositionId) return;
    const target = priorities.find((priority) => priority.positionId === targetPositionId) || blankPriority(targetPositionId);
    const targetAlreadyHasPlayer = (target.selectedPlayers || []).some((selected) => selected.id === player.id);

    onChange(
      priorities.map((priority) => {
        if (priority.positionId === sourcePositionId) {
          const selectedPlayers = (priority.selectedPlayers || []).filter((selected) => selected.id !== player.id);
          return {
            ...priority,
            selectedPlayers,
            targetCount: Math.max((priority.targetCount || 0) - 1, selectedPlayers.length)
          };
        }

        if (priority.positionId === targetPositionId) {
          const currentPlayers = (priority.selectedPlayers || []).map((selected) => ({ ...selected, photo: normalizeMarketPhoto(selected.photo) }));
          const selectedPlayers = targetAlreadyHasPlayer ? currentPlayers : [...currentPlayers, { ...player, photo: normalizeMarketPhoto(player.photo) }];
          return {
            ...priority,
            priority: "low",
            selectedPlayers,
            targetCount: Math.max((priority.targetCount || 0) + (targetAlreadyHasPlayer ? 0 : 1), selectedPlayers.length)
          };
        }

        return priority;
      })
    );
  }

  function moveSlot(sourcePositionId: string, targetPositionId: string) {
    if (sourcePositionId === targetPositionId) return;
    onChange(
      priorities.map((priority) => {
        if (priority.positionId === sourcePositionId) {
          return {
            ...priority,
            targetCount: Math.max((priority.targetCount || 0) - 1, (priority.selectedPlayers || []).length)
          };
        }
        if (priority.positionId === targetPositionId) {
          return {
            ...priority,
            priority: "low",
            targetCount: (priority.targetCount || 0) + 1
          };
        }
        return priority;
      })
    );
  }

  const results = useMemo(() => {
    const trimmed = debouncedQuery.trim();
    if (trimmed.length < 2 || !marketPlayers || selectedCandidate) return [];
    const normalizedQuery = normalizeSearch(trimmed);
    const compactQuery = normalizedQuery.replace(/\s/g, "");
    const queryTokens = normalizedQuery.split(" ").filter(Boolean);
    const buckets: Record<number, IndexedMarketPlayer[]> = {};

    for (const player of marketPlayers) {
      const score = candidateScore(player, normalizedQuery, compactQuery, queryTokens);
      if (!score) continue;
      buckets[score] = buckets[score] || [];
      buckets[score].push(player);
      if ((buckets[100]?.length || 0) >= 8) break;
    }

    return Object.keys(buckets)
      .map(Number)
      .sort((a, b) => b - a)
      .flatMap((score) => buckets[score])
      .slice(0, 8);
  }, [marketPlayers, debouncedQuery, selectedCandidate]);

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm font-black text-slate-800">
        <span>
          Plantilla actual: {rosterCounts.firstTeam} + {rosterCounts.signings} fichajes = {rosterCounts.estimatedSquad} jugadores
        </span>
        <span className="text-slate-500">{rosterCounts.preseason} pretemporada</span>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[220px_1fr_auto]">
          <label className="block">
            <span className="mb-1 block text-xs font-black uppercase tracking-wide text-slate-500">Posición</span>
            <select
              value={positionId}
              onChange={(event) => setPositionId(event.target.value)}
              className="h-11 w-full cursor-pointer rounded-md border border-slate-200 bg-white px-3 text-sm font-black text-slate-900 outline-none focus:border-[#0057b8]"
            >
              {marketPositions.map((position) => (
                <option key={position.id} value={position.id}>
                  {position.label}
                </option>
              ))}
            </select>
          </label>

          <div className="relative">
            <label className="mb-1 block text-xs font-black uppercase tracking-wide text-slate-500" htmlFor="market-candidate">
              Candidato opcional
            </label>
            <input
              id="market-candidate"
              value={selectedCandidate ? selectedCandidate.displayName : query}
              onFocus={ensureMarketPlayers}
              onChange={(event) => {
                ensureMarketPlayers();
                setSelectedCandidate(null);
                setQuery(event.target.value);
              }}
              placeholder="Buscar jugador"
              className="h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-slate-900 outline-none focus:border-[#0057b8]"
            />
            {marketLoading && <p className="mt-1 text-xs font-bold text-slate-500">Cargando mercado...</p>}
            {marketError && <p className="mt-1 text-xs font-bold text-red-500">{marketError}</p>}
            {results.length > 0 && (
              <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 overflow-hidden rounded-md border border-slate-200 bg-white shadow-[0_18px_45px_rgba(7,24,47,0.18)]">
                {results.map((player) => (
                  <button
                    key={player.id}
                    type="button"
                    onClick={() => {
                      setSelectedCandidate(player);
                      setQuery(player.displayName);
                    }}
                    className="flex w-full cursor-pointer items-center gap-2 border-b border-slate-100 px-2 py-2 text-left last:border-b-0 hover:bg-slate-50"
                  >
                    <MarketPlayerAvatar player={player} />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-black text-slate-900">{player.displayName}</span>
                      <span className="block truncate text-xs font-bold text-slate-500">
                        {[player.club, player.age ? `${player.age} años` : "", player.contractEnd ? `Contrato ${player.contractEnd}` : ""]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={addNeed}
              className="h-11 w-full cursor-pointer rounded-md bg-[#07182f] px-5 text-sm font-black text-white hover:bg-[#0057b8] md:w-auto"
            >
              Añadir
            </button>
          </div>
        </div>
      </section>

      <div className="grid gap-3 md:grid-cols-2">
        {activeNeeds.length ? (
          activeNeeds.map((need) => {
            const selectedPlayers = need.selectedPlayers || [];
            const reinforcementSlots = Math.max((need.targetCount || 0) - selectedPlayers.length, 0);
            return (
              <section key={need.positionId} className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-base font-black text-slate-950">{need.positionLabel}</h3>
                  <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-black text-emerald-700">{need.targetCount || selectedPlayers.length}</span>
                </div>
                <div className="mt-3 grid gap-2">
                  {selectedPlayers.map((player) => (
                    <div key={player.id} className="flex items-center gap-2 rounded-md bg-emerald-50 p-2">
                      <MarketPlayerAvatar player={player} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-black text-emerald-700">{player.displayName}</p>
                        <p className="truncate text-xs font-bold text-slate-500">
                          {[player.club, player.age ? `${player.age} años` : "", player.contractEnd ? `Contrato ${player.contractEnd}` : ""]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      </div>
                      <select
                        value={need.positionId}
                        onChange={(event) => movePlayer(need.positionId, event.target.value, player)}
                        className="h-8 max-w-[135px] cursor-pointer rounded-md border border-emerald-200 bg-white px-2 text-xs font-black text-emerald-700 outline-none focus:border-emerald-500"
                        aria-label={`Cambiar posición de ${player.displayName}`}
                      >
                        {marketPositions.map((position) => (
                          <option key={position.id} value={position.id}>
                            {position.label}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => removePlayer(need.positionId, player.id)}
                        className="cursor-pointer rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-black text-red-600 hover:border-red-200"
                      >
                        Quitar
                      </button>
                    </div>
                  ))}
                  {Array.from({ length: reinforcementSlots }).map((_, index) => (
                    <div key={`${need.positionId}-slot-${index}`} className="flex items-center justify-between gap-2 rounded-md bg-emerald-50 p-2">
                      <span className="text-sm font-black text-emerald-700">Refuerzo</span>
                      <select
                        value={need.positionId}
                        onChange={(event) => moveSlot(need.positionId, event.target.value)}
                        className="h-8 max-w-[150px] cursor-pointer rounded-md border border-emerald-200 bg-white px-2 text-xs font-black text-emerald-700 outline-none focus:border-emerald-500"
                        aria-label="Cambiar posición de refuerzo"
                      >
                        {marketPositions.map((position) => (
                          <option key={position.id} value={position.id}>
                            {position.label}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => removeSlot(need.positionId)}
                        className="cursor-pointer rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-black text-red-600 hover:border-red-200"
                      >
                        Quitar
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            );
          })
        ) : (
          <p className="rounded-lg border border-slate-200 bg-white p-4 text-sm font-bold text-slate-500 shadow-sm">
            Sin refuerzos añadidos.
          </p>
        )}
      </div>

      {plannedSquadByLine.length > 0 && (
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-base font-black text-slate-950">Plantilla 2026/27</h3>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {plannedSquadByLine.map((line) => (
              <div key={line.value} className="rounded-md border border-slate-100 bg-slate-50 p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-sm font-black text-slate-950">{line.title}</p>
                  <span className="text-xs font-black text-slate-500">
                    {line.groups.reduce((sum, group) => sum + group.players.length, 0)}
                  </span>
                </div>
                <div className="space-y-2">
                  {line.groups.map((group) => (
                    <div key={group.fieldPosition}>
                      <p className="mb-1 text-[11px] font-black uppercase tracking-wide text-slate-400">{group.label}</p>
                      <div className="flex flex-wrap gap-2">
                        {group.players.map((player) => {
                          const decision = decisions[player.id]?.decisionValue;
                          const isPreseason = decision && preseasonValues.has(decision);
                          const isOrange = decision && orangeValues.has(decision);
                          const isRed = decision && redValues.has(decision);
                          
                          let textColor = "text-slate-800";
                          if (isPreseason) textColor = "text-sky-500";
                          else if (isOrange) textColor = "text-orange-500";
                          else if (isRed) textColor = "text-red-500";

                          return (
                            <div key={player.id} className="flex max-w-full items-center gap-2 rounded bg-white px-2 py-1 shadow-sm">
                              <RosterPlayerAvatar player={player} />
                              <span className={`truncate text-xs font-black ${textColor}`}>
                                {player.jugador}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
