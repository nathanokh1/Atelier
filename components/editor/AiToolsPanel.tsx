"use client";

import { useState } from "react";
import { ChevronDown, Scissors, Sparkles, UserSquare } from "lucide-react";
import { useEditor } from "@/state/editor-store";
import { cn } from "@/components/ui/cn";

/**
 * Smart tools powered by an on-device ML model (@imgly/background-removal). Runs
 * fully in the browser — free, private. The model (~a few MB) downloads and
 * caches on first use, so the first run is slower.
 */
export function AiToolsPanel() {
  const activeLayerId = useEditor((s) => s.activeLayerId);
  const removeBackground = useEditor((s) => s.removeBackground);
  const selectSubject = useEditor((s) => s.selectSubject);
  const busy = useEditor((s) => s.busy);
  const [open, setOpen] = useState(false);

  if (!activeLayerId) return null;
  const disabled = !!busy;

  return (
    <div className="border-b border-panel-border">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-1.5 px-4 py-2.5 text-[11px] font-medium uppercase tracking-wide text-ink-faint hover:text-ink"
      >
        <Sparkles size={13} className="text-accent" />
        Smart tools
        <ChevronDown size={14} className={cn("ml-auto transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="space-y-2 px-4 pb-3">
          <button
            onClick={() => void removeBackground()}
            disabled={disabled}
            className="flex w-full items-center gap-2 rounded-md border border-panel-border bg-panel-sunken px-3 py-2 text-xs text-ink-dim hover:border-accent/50 hover:text-ink disabled:opacity-40"
          >
            <Scissors size={14} /> Remove background
          </button>
          <button
            onClick={() => void selectSubject()}
            disabled={disabled}
            className="flex w-full items-center gap-2 rounded-md border border-panel-border bg-panel-sunken px-3 py-2 text-xs text-ink-dim hover:border-accent/50 hover:text-ink disabled:opacity-40"
          >
            <UserSquare size={14} /> Select subject
          </button>
          <p className="text-[10px] leading-snug text-ink-faint">
            Runs on your device — free & private. First use downloads a small model.
          </p>
        </div>
      )}
    </div>
  );
}
