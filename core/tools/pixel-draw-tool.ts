import { ReplaceLayerSourceCommand } from "../commands/raster-commands";
import { RasterSource } from "../layer-graph";
import {
  PixelImage,
  RGBA,
  drawEllipse,
  drawLine,
  drawRect,
  floodFill,
  isPixelBitmap,
  parseHex,
  strokePixels,
  toHex,
} from "../file-io/pixel-ops";
import { PointerSample, Tool, ToolContext, ToolId } from "./tool";

export type PixelToolMode = "pencil" | "eraser" | "bucket" | "line" | "rect" | "ellipse" | "eyedropper";

/** Read pixels from a canvas, an image, or a test bitmap. */
export function readPixelImage(source: RasterSource): PixelImage {
  if (isPixelBitmap(source.bitmap)) {
    return { width: source.width, height: source.height, data: source.bitmap.data };
  }
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, source.width);
  canvas.height = Math.max(1, source.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) return { width: canvas.width, height: canvas.height, data: new Uint8ClampedArray(canvas.width * canvas.height * 4) };
  if (source.bitmap) ctx.drawImage(source.bitmap as CanvasImageSource, 0, 0);
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  return { width: canvas.width, height: canvas.height, data };
}

export function writePixelSource(image: PixelImage): RasterSource {
  if (typeof document === "undefined") {
    return { width: image.width, height: image.height, bitmap: { kind: "pixels", data: image.data } };
  }
  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const copy = new Uint8ClampedArray(image.data.length);
    copy.set(image.data);
    ctx.putImageData(new ImageData(copy, image.width, image.height), 0, 0);
  }
  return { width: image.width, height: image.height, bitmap: canvas };
}

/**
 * Sprite drawing. Every stroke, fill, or shape is one Command. Photo brushes
 * are a different tool and are left alone.
 */
export class PixelDrawTool implements Tool {
  readonly id: ToolId = "pencil";
  readonly cursor = "crosshair";
  private mode: PixelToolMode = "pencil";
  private points: { x: number; y: number }[] = [];
  private before: RasterSource | null = null;
  private layerId: string | null = null;
  private drawing = false;

  constructor(private readonly getColor: () => string, private readonly setColor: (hex: string) => void) {}

  setMode(mode: PixelToolMode): void {
    this.mode = mode;
  }

  get label(): string {
    return this.mode;
  }

  get hint(): string {
    return "Draw on whole pixels. One undo step per stroke.";
  }

  onPointerDown(pt: PointerSample, ctx: ToolContext): void {
    if (ctx.graph.getKind() !== "sprite") return;
    const layer = ctx.graph.getActiveLayer();
    if (!layer || layer.locked || layer.type === "group") return;
    this.layerId = layer.id;
    this.before = layer.source;
    this.drawing = true;
    const local = this.localPixel(pt, layer, ctx);
    this.points = [local];
    if (this.mode === "eyedropper") {
      const image = readPixelImage(layer.source);
      const pixel = image.data;
      const i = (local.y * image.width + local.x) * 4;
      if (i >= 0 && i < pixel.length) {
        const color: RGBA = { r: pixel[i], g: pixel[i + 1], b: pixel[i + 2], a: pixel[i + 3] };
        this.setColor(toHex(color));
      }
      this.drawing = false;
      return;
    }
    if (this.mode === "bucket") {
      const next = floodFill(readPixelImage(layer.source), local.x, local.y, parseHex(this.getColor()), true);
      ctx.bus.dispatch(new ReplaceLayerSourceCommand(layer.id, writePixelSource(next), "Paint bucket"));
      this.drawing = false;
      return;
    }
    this.preview(ctx);
  }

  onPointerMove(pt: PointerSample, ctx: ToolContext): void {
    if (!this.drawing || !this.layerId) return;
    const layer = ctx.graph.getLayer(this.layerId);
    if (!layer) return;
    const local = this.localPixel(pt, layer, ctx);
    const last = this.points[this.points.length - 1];
    if (last && last.x === local.x && last.y === local.y) return;
    this.points.push(local);
    this.preview(ctx);
  }

  onPointerUp(_pt: PointerSample, ctx: ToolContext): void {
    if (!this.drawing || !this.layerId || !this.before) {
      this.drawing = false;
      return;
    }
    const layer = ctx.graph.getLayer(this.layerId);
    const before = this.before;
    this.drawing = false;
    if (!layer) return;
    const next = this.apply(readPixelImage(before));
    layer.source = before;
    ctx.bus.dispatch(new ReplaceLayerSourceCommand(this.layerId, writePixelSource(next), this.labelForMode()));
    this.points = [];
    this.before = null;
  }

  private labelForMode(): string {
    if (this.mode === "eraser") return "Eraser";
    if (this.mode === "line") return "Line";
    if (this.mode === "rect") return "Rectangle";
    if (this.mode === "ellipse") return "Ellipse";
    return "Pencil";
  }

  private localPixel(
    pt: PointerSample,
    layer: { transform: { x: number; y: number; scaleX: number; scaleY: number } },
    ctx: ToolContext,
  ): { x: number; y: number } {
    const doc = ctx.renderer.screenToDocument(pt.canvasX, pt.canvasY);
    const sx = layer.transform.scaleX || 1;
    const sy = layer.transform.scaleY || 1;
    return {
      x: Math.floor((doc.x - layer.transform.x) / sx),
      y: Math.floor((doc.y - layer.transform.y) / sy),
    };
  }

  private apply(base: PixelImage): PixelImage {
    const color = parseHex(this.getColor());
    const a = this.points[0];
    const b = this.points[this.points.length - 1] ?? a;
    if (!a) return base;
    if (this.mode === "eraser") return strokePixels(base, this.points, color, true);
    if (this.mode === "line") return drawLine(base, a.x, a.y, b.x, b.y, color, false);
    if (this.mode === "rect") return drawRect(base, a.x, a.y, b.x - a.x, b.y - a.y, color, false);
    if (this.mode === "ellipse") return drawEllipse(base, a.x, a.y, b.x - a.x, b.y - a.y, color, false);
    return strokePixels(base, this.points, color, false);
  }

  private preview(ctx: ToolContext): void {
    if (!this.before || !this.layerId) return;
    const layer = ctx.graph.getLayer(this.layerId);
    if (!layer) return;
    const next = this.apply(readPixelImage(this.before));
    layer.source = writePixelSource(next);
    ctx.renderer.refreshLayerFromBitmap(layer.id);
  }
}
