"use client";

import { useEffect, useRef } from "react";
import { useEditor } from "@/state/editor-store";
import { useSettings } from "@/state/settings-store";

const RULER = 18;
const STEPS = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000, 5000];

/**
 * Pixel rulers along the top/left canvas edges. Reads pan/zoom straight from the
 * renderer (subscribing to its viewport changes) and draws to 2D canvases so it
 * never triggers React re-renders while panning.
 */
export function Rulers() {
  const showRulers = useSettings((s) => s.showRulers);
  const engine = useEditor((s) => s.engine);
  const ready = useEditor((s) => s.ready);
  const topRef = useRef<HTMLCanvasElement>(null);
  const leftRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showRulers || !engine || !ready) return;
    const renderer = engine.getRenderer();
    if (!renderer) return;

    const draw = () => {
      const wrap = wrapRef.current;
      const top = topRef.current;
      const left = leftRef.current;
      if (!wrap || !top || !left) return;
      const W = wrap.clientWidth;
      const H = wrap.clientHeight;
      const dpr = window.devicePixelRatio || 1;
      const view = renderer.getViewport();
      const zoom = view.zoom || 1;

      // Nice tick step: aim for major ticks ~70px apart on screen.
      let step = STEPS[STEPS.length - 1];
      for (const s of STEPS) {
        if (s * zoom >= 70) {
          step = s;
          break;
        }
      }
      const minor = step / 5;

      for (const [canvas, horizontal] of [
        [top, true],
        [left, false],
      ] as const) {
        const cw = horizontal ? W : RULER;
        const ch = horizontal ? RULER : H;
        canvas.width = Math.max(1, Math.floor(cw * dpr));
        canvas.height = Math.max(1, Math.floor(ch * dpr));
        canvas.style.width = `${cw}px`;
        canvas.style.height = `${ch}px`;
        const ctx = canvas.getContext("2d");
        if (!ctx) continue;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, cw, ch);
        ctx.fillStyle = "#1a1d23";
        ctx.fillRect(0, 0, cw, ch);
        ctx.strokeStyle = "#3a3f4b";
        ctx.fillStyle = "#8b90a0";
        ctx.font = "9px ui-monospace, monospace";
        ctx.textBaseline = horizontal ? "top" : "bottom";

        const originScreen = horizontal ? view.x : view.y;
        const extent = horizontal ? W : H;
        // First doc coordinate visible.
        const firstDoc = Math.floor((0 - originScreen) / zoom / minor) * minor;
        for (let d = firstDoc; ; d += minor) {
          const screen = originScreen + d * zoom;
          if (screen > extent) break;
          if (screen < 0) continue;
          const isMajor = Math.abs(d % step) < 0.001;
          const len = isMajor ? RULER : RULER * 0.5;
          ctx.beginPath();
          if (horizontal) {
            ctx.moveTo(screen + 0.5, RULER);
            ctx.lineTo(screen + 0.5, RULER - len);
          } else {
            ctx.moveTo(RULER, screen + 0.5);
            ctx.lineTo(RULER - len, screen + 0.5);
          }
          ctx.stroke();
          if (isMajor) {
            const label = String(Math.round(d));
            if (horizontal) {
              ctx.fillText(label, screen + 2, 1);
            } else {
              ctx.save();
              ctx.translate(1, screen - 2);
              ctx.rotate(-Math.PI / 2);
              ctx.fillText(label, 0, 0);
              ctx.restore();
            }
          }
        }
      }
    };

    draw();
    const unsub = renderer.onViewportChange(() => draw());
    const ro = new ResizeObserver(() => draw());
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => {
      unsub();
      ro.disconnect();
    };
  }, [showRulers, engine, ready]);

  if (!showRulers) return null;

  return (
    <div ref={wrapRef} className="pointer-events-none absolute inset-0">
      <canvas ref={topRef} className="absolute left-0 top-0" />
      <canvas ref={leftRef} className="absolute left-0 top-0" />
      <div
        className="absolute left-0 top-0 border-b border-r border-panel-border bg-[#1a1d23]"
        style={{ width: RULER, height: RULER }}
      />
    </div>
  );
}
