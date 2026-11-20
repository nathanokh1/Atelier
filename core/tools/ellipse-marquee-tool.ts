import { ellipseMask } from "../file-io/pixel-ops";
import { PointerSample, Tool, ToolContext } from "./tool";

/** Hard-edged elliptical marquee for sprites. */
export class EllipseMarqueeTool implements Tool {
  readonly id = "ellipse-select" as const;
  readonly label = "Elliptical marquee";
  readonly hint = "Drag an ellipse to select whole pixels.";
  readonly cursor = "crosshair";

  private dragging = false;
  private start = { x: 0, y: 0 };

  onPointerDown(pt: PointerSample, ctx: ToolContext): void {
    if (ctx.graph.getKind() !== "sprite") return;
    this.start = ctx.renderer.screenToDocument(pt.canvasX, pt.canvasY);
    this.dragging = true;
  }

  onPointerMove(): void {}

  onPointerUp(pt: PointerSample, ctx: ToolContext): void {
    if (!this.dragging) return;
    this.dragging = false;
    const layer = ctx.graph.getActiveLayer();
    if (!layer || ctx.graph.getKind() !== "sprite") return;
    const end = ctx.renderer.screenToDocument(pt.canvasX, pt.canvasY);
    const sx = layer.transform.scaleX || 1;
    const sy = layer.transform.scaleY || 1;
    const x0 = Math.floor((this.start.x - layer.transform.x) / sx);
    const y0 = Math.floor((this.start.y - layer.transform.y) / sy);
    const x1 = Math.floor((end.x - layer.transform.x) / sx);
    const y1 = Math.floor((end.y - layer.transform.y) / sy);
    const data = ellipseMask(layer.source.width, layer.source.height, x0, y0, x1 - x0, y1 - y0);
    ctx.renderer.setSelection(null);
    ctx.renderer.setSelectionMask({ width: layer.source.width, height: layer.source.height, data });
  }
}
