"use client";

import { sections } from "@/lib/sections";
import { SectionId } from "@/types";

type Props = {
  activeSection: SectionId;
};

export function SectionNavigator({ activeSection }: Props) {
  const activeIndex = sections.findIndex((section) => section.id === activeSection);
  const progress = Math.round(((activeIndex + 1) / sections.length) * 100);

  return (
    <header className="planning-enter-nav sticky top-0 z-20 border-b backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 py-3">
        <div className="mx-auto max-w-sm text-center">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0057b8]">UD Las Palmas 2026/27</p>
          <div className="mx-auto mt-2 h-1.5 w-48 overflow-hidden rounded bg-slate-100 sm:w-64">
            <div className="h-full bg-[#ffe000] transition-[width] duration-500 ease-out" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>
    </header>
  );
}
