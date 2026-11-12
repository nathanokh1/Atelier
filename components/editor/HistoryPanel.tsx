"use client";

import { useEffect, useRef } from "react";
import { History as HistoryIcon, Dot } from "lucide-react";
import { useEditor } from "@/state/editor-store";
import { cn } from "@/components/ui/cn";

/**
 * Floating History timeline. Lists every command chronologically; clicking an
 * entry bulk undo/redoes to that point. The "Base state" row is the document
 * before any command (applied = 0).
 */
export function HistoryPanel({ onClose }: { onClose: () => void }) {
  const labels = useEditor((s) => s.historyLabels);
  const applied = useEditor((s) => s.historyApplied);
  const historyJump = useEditor((s) => s.historyJump);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const rows = [
    { label: "Base state", target: 0 },
    ...labels.map((label, i) => ({ label, target: i + 1 })),
  ];

  return (
    <div
      ref={ref}
      className="absolute right-0 top-11 z-50 w-64 animate-fade-in overflow-hidden rounded-lg border border-panel-border bg-panel/98 shadow-panel backdrop-blur"
    >
      <div className="flex items-center gap-2 border-b border-panel-border px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-ink-faint">
        <HistoryIcon size={13} /> History
        <span className="ml-auto text-ink-faint">{labels.length}</span>
      </div>
      <ul className="max-h-[60vh] overflow-y-auto py-1">
        {rows.map((row) => {
          const isCurrent = row.target === applied;
          const isFuture = row.target > applied;
          return (
            <li key={row.target}>
              <button
                onClick={() => historyJump(row.target)}
                className={cn(
                  "flex w-full items-center gap-1.5 px-3 py-1.5 text-left text-xs transition-colors",
                  isCurrent
                    ? "bg-accent/20 text-ink"
                    : isFuture
                      ? "text-ink-faint hover:bg-panel-raised/60 hover:text-ink-dim"
                      : "text-ink-dim hover:bg-panel-raised/60 hover:text-ink",
                )}
              >
                <Dot
                  size={16}
                  className={cn("shrink-0", isCurrent ? "text-accent" : "text-transparent")}
                />
                <span className="truncate">{row.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
