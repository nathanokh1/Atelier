"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useEditor } from "@/state/editor-store";
import { makeBrushTip, imageToBrushTip } from "@/core";
import { Slider } from "@/components/ui/Slider";
import { cn } from "@/components/ui/cn";

interface BrushPreset {
  label: string;
  hardness: number;
  flow: number;
  spacing: number;
  opacity: number;
}

const PRESETS: BrushPreset[] = [
  { label: "Soft", hardness: 0.1, flow: 0.5, spacing: 0.08, opacity: 0.9 },
  { label: "Round", hardness: 0.6, flow: 0.85, spacing: 0.12, opacity: 1 },
  { label: "Hard", hardness: 0.95, flow: 1, spacing: 0.1, opacity: 1 },
  { label: "Marker", hardness: 0.8, flow: 0.4, spacing: 0.05, opacity: 0.7 },
];

export function PaintOptionsBar() {
  const activeTool = useEditor((s) => s.activeTool);
  const setPaintStyle = useEditor((s) => s.setPaintStyle);
  const engine = useEditor((s) => s.engine);
  const [color, setColor] = useState("#ffffff");
  const [size, setSize] = useState(24);
  const [opacity, setOpacity] = useState(1);
  const [hardness, setHardness] = useState(0.6);
  const [flow, setFlow] = useState(0.85);
  const [spacing, setSpacing] = useState(0.12);
  const [tipName, setTipName] = useState("round");
  const tipFileRef = useRef<HTMLInputElement>(null);
  const [importedTip, setImportedTip] = useState<HTMLCanvasElement | null>(null);

  const builtinTips = useMemo(
    () => ({ spray: makeBrushTip("spray"), chalk: makeBrushTip("chalk") }),
    [],
  );

  const isPaint = activeTool === "brush" || activeTool === "pencil" || activeTool === "eraser";
  const isRetouch = activeTool === "clone" || activeTool === "heal";
  const painting = isPaint || isRetouch;
  const isPencil = activeTool === "pencil";

  useEffect(() => {
    if (!painting || !engine) return;
    const style = engine.getPaintStyle();
    if (style) {
      setColor(style.color);
      setSize(style.size);
      setOpacity(style.opacity);
      setHardness(style.hardness);
      setFlow(style.flow);
      setSpacing(style.spacing);
    }
  }, [painting, activeTool, engine]);

  if (!painting) return null;

  const applyPreset = (p: BrushPreset) => {
    setHardness(p.hardness);
    setFlow(p.flow);
    setSpacing(p.spacing);
    setOpacity(p.opacity);
    setPaintStyle({ hardness: p.hardness, flow: p.flow, spacing: p.spacing, opacity: p.opacity });
  };

  const selectTip = (name: string, tip: HTMLCanvasElement | null) => {
    setTipName(name);
    setPaintStyle({ tip, tipName: name });
  };

  const onImportTip = (file: File) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const tip = imageToBrushTip(img);
      setImportedTip(tip);
      selectTip("imported", tip);
    };
    img.src = url;
  };

  return (
    <div className="pointer-events-none absolute left-1/2 top-3 z-20 -translate-x-1/2">
      <div className="pointer-events-auto flex max-w-[min(94vw,780px)] flex-wrap items-center gap-3 rounded-xl border border-panel-border bg-panel/95 px-3 py-2 shadow-panel backdrop-blur">
        <span className="text-[11px] font-medium uppercase tracking-wide text-ink-faint">
          {activeTool}
        </span>

        {isPaint && activeTool !== "eraser" && (
          <label className="flex items-center gap-1.5 text-xs text-ink-dim">
            Color
            <input
              type="color"
              value={color}
              onChange={(e) => {
                setColor(e.target.value);
                setPaintStyle({ color: e.target.value });
              }}
              className="h-6 w-8 cursor-pointer rounded border border-panel-border bg-transparent"
            />
          </label>
        )}

        {activeTool === "clone" && (
          <span className="text-[11px] text-ink-faint">Alt/Option-click to set source</span>
        )}

        <SliderField label="Size" suffix="px" value={size} min={1} max={300} step={1} onChange={(v) => { setSize(v); setPaintStyle({ size: v }); }} width="w-28" />
        <SliderField label={isRetouch ? "Strength" : "Opacity"} suffix="%" pct value={opacity} min={0.05} max={1} step={0.05} onChange={(v) => { setOpacity(v); setPaintStyle({ opacity: v }); }} width="w-20" />

        {isPaint && !isPencil && (
          <>
            <SliderField label="Hardness" suffix="%" pct value={hardness} min={0} max={1} step={0.05} onChange={(v) => { setHardness(v); setPaintStyle({ hardness: v }); }} width="w-20" />
            <SliderField label="Flow" suffix="%" pct value={flow} min={0.05} max={1} step={0.05} onChange={(v) => { setFlow(v); setPaintStyle({ flow: v }); }} width="w-20" />
          </>
        )}
        {isPaint && (
          <SliderField label="Spacing" suffix="%" pct value={spacing} min={0.02} max={1} step={0.02} onChange={(v) => { setSpacing(v); setPaintStyle({ spacing: v }); }} width="w-20" />
        )}

        {isPaint && !isPencil && (
          <div className="flex items-center gap-1">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => applyPreset(p)}
                className={cn(
                  "rounded-md border border-panel-border bg-panel-sunken px-2 py-1 text-[11px] text-ink-dim hover:border-accent/50 hover:text-ink",
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        )}

        {activeTool === "brush" && (
          <div className="flex items-center gap-1 border-l border-panel-border pl-2">
            <span className="text-[10px] uppercase tracking-wide text-ink-faint">Tip</span>
            <TipButton label="Round" active={tipName === "round"} onClick={() => selectTip("round", null)} />
            <TipButton label="Spray" active={tipName === "spray"} onClick={() => selectTip("spray", builtinTips.spray)} />
            <TipButton label="Chalk" active={tipName === "chalk"} onClick={() => selectTip("chalk", builtinTips.chalk)} />
            {importedTip && (
              <TipButton label="Custom" active={tipName === "imported"} onClick={() => selectTip("imported", importedTip)} />
            )}
            <button
              onClick={() => tipFileRef.current?.click()}
              className="rounded-md border border-panel-border bg-panel-sunken px-2 py-1 text-[11px] text-ink-dim hover:border-accent/50 hover:text-ink"
            >
              Import…
            </button>
            <input
              ref={tipFileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                if (e.target.files?.[0]) onImportTip(e.target.files[0]);
                e.target.value = "";
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function TipButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-md border px-2 py-1 text-[11px]",
        active
          ? "border-accent/60 bg-accent/20 text-ink"
          : "border-panel-border bg-panel-sunken text-ink-dim hover:border-accent/50 hover:text-ink",
      )}
    >
      {label}
    </button>
  );
}

function SliderField({
  label,
  suffix,
  pct,
  value,
  min,
  max,
  step,
  onChange,
  width,
}: {
  label: string;
  suffix: string;
  pct?: boolean;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  width: string;
}) {
  return (
    <div className={width}>
      <div className="mb-0.5 flex justify-between text-[10px] text-ink-faint">
        <span>{label}</span>
        <span>
          {pct ? Math.round(value * 100) : value}
          {suffix}
        </span>
      </div>
      <Slider min={min} max={max} step={step} value={value} onChange={onChange} />
    </div>
  );
}
