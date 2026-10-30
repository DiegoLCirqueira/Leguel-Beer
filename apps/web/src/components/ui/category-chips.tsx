"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Chip = { id: string; label: string; count: number; icon?: ReactNode };

type CategoryChipsProps = {
  items: Chip[];
  value: string;
  onChange: (id: string) => void;
};

export function CategoryChips({ items, value, onChange }: CategoryChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto">
      {items.map((item) => {
        const selected = item.id === value;
        return (
          <button
            key={item.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(item.id)}
            className={cn(
              "flex min-h-11 min-w-11 flex-col items-center justify-center gap-1 rounded-campo border px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria",
              selected
                ? "border-primaria bg-superficie-elevada text-primaria"
                : "border-borda bg-superficie-elevada text-texto",
            )}
          >
            {item.icon}
            <span>{`${item.label} (${item.count})`}</span>
          </button>
        );
      })}
    </div>
  );
}
