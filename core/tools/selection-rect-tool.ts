import { rectMask } from "../file-io/pixel-ops";
import { PointerSample, Tool, ToolContext } from "./tool";

/**
 * Rectangle selection tool. Drag to define a document-space Selection that
 * constrains Cut/Copy. Does not mutate the LayerGraph.
 */
export class SelectionRectTool implements Tool {
  readonly id = "select" as const;
  readonly label = "Select";
  readonly hint = "Drag a rectangle to select a region for Cut/Copy. (M)";
  readonly cursor = "crosshair";

  private dragging = false;
  private start = { x: 0, y: 0 };

  onPointerDown(pt: PointerSample, ctx: ToolContext): void {
    const doc = ctx.renderer.screenToDocument(pt.canvasX, pt.canvasY);
    this.start = doc;
    this.dragging = true;
    ctx.renderer.setSelection({ x: doc.x, y: doc.y, width: 0, height: 0 });
  }

  onPointerMove(pt: PointerSample, ctx: ToolContext): void {
    if (!this.dragging) return;
    const doc = ctx.renderer.screenToDocument(pt.canvasX, pt.canvasY);
    const x = Math.min(this.start.x, doc.x);
    const y = Math.min(this.start.y, doc.y);
    const width = Math.abs(doc.x - this.start.x);
    const height = Math.abs(doc.y - this.start.y);
    ctx.renderer.setSelection({ x, y, width, height });
  }

  onPointerUp(pt: PointerSample, ctx: ToolContext): void {
    if (!this.dragging) return;
    this.dragging = false;
    const doc = ctx.renderer.screenToDocument(pt.canvasX, pt.canvasY);
    const x = Math.min(this.start.x, doc.x);
    const y = Math.min(this.start.y, doc.y);
    const width = Math.abs(doc.x - this.start.x);
    const height = Math.abs(doc.y - this.start.y);
    if (ctx.graph.getKind() === "sprite") {
      const layer = ctx.graph.getActiveLayer();
      ctx.renderer.setSelection(null);
      if (!layer) return;
      const sx = layer.transform.scaleX || 1;
      const sy = layer.transform.scaleY || 1;
      const x0 = Math.floor((x - layer.transform.x) / sx);
      const y0 = Math.floor((y - layer.transform.y) / sy);
      const x1 = Math.floor((x + width - layer.transform.x) / sx);
      const y1 = Math.floor((y + height - layer.transform.y) / sy);
      const data = rectMask(layer.source.width, layer.source.height, x0, y0, x1 - x0, y1 - y0);
      ctx.renderer.setSelectionMask({ width: layer.source.width, height: layer.source.height, data });
      return;
    }
    if (width < 2 || height < 2) {
      ctx.renderer.setSelection(null);
    } else {
      ctx.renderer.setSelection({ x, y, width, height });
    }
  }
}
