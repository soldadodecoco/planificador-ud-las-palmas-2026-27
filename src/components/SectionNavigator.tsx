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
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[#07182f]/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 py-3">
        <div className="mx-auto max-w-sm text-center">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#ffe000]">UD Las Palmas 2026/27</p>
          <div className="mx-auto mt-2 h-1.5 w-48 overflow-hidden rounded bg-white/10 sm:w-64">
            <div className="h-full bg-[#ffe000] transition-[width] duration-500 ease-out" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>
    </header>
  );
}
