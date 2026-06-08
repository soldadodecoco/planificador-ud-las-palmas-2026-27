import { Decision, MarketPriority } from "@/types";

const decisionsKey = "udlp-plan-decisions-v1";
const marketKey = "udlp-plan-market-v1";

export function loadDecisions(): Record<string, Decision> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(decisionsKey) || "{}");
  } catch {
    return {};
  }
}

export function saveDecisions(decisions: Record<string, Decision>) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(decisionsKey, JSON.stringify(decisions));
  }
}

export function loadMarketPriorities(fallback: MarketPriority[]): MarketPriority[] {
  if (typeof window === "undefined") return fallback;
  try {
    const stored = window.localStorage.getItem(marketKey);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

export function saveMarketPriorities(priorities: MarketPriority[]) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(marketKey, JSON.stringify(priorities));
  }
}

export function resetPlanningStorage() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(decisionsKey);
    window.localStorage.removeItem(marketKey);
  }
}
