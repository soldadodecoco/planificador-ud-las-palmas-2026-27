"use client";

import { getDecisionButtons } from "@/lib/decisions";
import { Decision, DecisionType, DecisionValue } from "@/types";

type Props = {
  type: DecisionType;
  selected?: Decision;
  onSelect: (value: DecisionValue, label: string) => void;
  onClear: () => void;
};

export function DecisionButtons({ type, selected, onSelect, onClear }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {getDecisionButtons(type).map((button) => {
        const active = selected?.decisionValue === button.value;
        return (
          <button
            key={button.value}
            type="button"
            onClick={() => (active ? onClear() : onSelect(button.value, button.label))}
            className={`group relative overflow-hidden flex items-center gap-2.5 min-h-11 cursor-pointer rounded-md border py-2 px-3 text-sm font-black transition-all duration-150 active:scale-[0.98] ${
              active
                ? "selected-decision border-[#07182f] bg-[#07182f] text-white shadow-[0_10px_24px_rgba(0,87,184,0.25)]"
                : "border-slate-200 bg-white text-slate-800 hover:border-[#0057b8] hover:bg-slate-50"
            }`}
          >
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all duration-150 ${
                active
                  ? "border-[#ffe000] bg-[#ffe000] text-[#07182f]"
                  : "border-slate-300 bg-transparent text-transparent group-hover:border-[#0057b8]"
              }`}
            >
              <svg
                className={`h-3 w-3 transition-transform duration-200 stroke-[3.5] ${
                  active ? "scale-100 text-[#07182f]" : "scale-0"
                }`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
            <span>{button.label}</span>
          </button>
        );
      })}
    </div>
  );
}
