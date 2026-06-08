import players from "@/data/players.json";
import { Player } from "@/types";
import { sortPlayers } from "./sorting";

export const allPlayers = sortPlayers(players as Player[]);
