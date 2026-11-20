import { HandTool } from "./hand-tool";
import { MoveTool } from "./move-tool";
import { PaintTool } from "./paint-tool";
import { PenTool } from "./pen-tool";
import { CloneTool } from "./clone-tool";
import { HealTool } from "./heal-tool";
import { SelectionRectTool } from "./selection-rect-tool";
import { EllipseMarqueeTool } from "./ellipse-marquee-tool";
import { LassoTool } from "./lasso-tool";
import { CropTool } from "./crop-tool";
import { MagicWandTool, DEFAULT_WAND_STYLE, WandStyle } from "./magic-wand-tool";
import { PointerSample, Tool, ToolContext, ToolId } from "./tool";
import { TransformTool } from "./transform-tool";
import { DEFAULT_STROKE_STYLE, StrokeStyle } from "../file-io/raster-edit";
import { PixelDrawTool, PixelToolMode } from "./pixel-draw-tool";

const PIXEL_MODES: Partial<Record<ToolId, PixelToolMode>> = {
  pencil: "pencil",
  eraser: "eraser",
  bucket: "bucket",
  line: "line",
  rect: "rect",
  ellipse: "ellipse",
  eyedropper: "eyedropper",
};

/** Holds the registered Tools and routes pointer events to the active one. */
export class ToolManager {
  private tools = new Map<ToolId, Tool>();
  private activeId: ToolId;
  private transformTool: TransformTool;
  private paintStyle: StrokeStyle = { ...DEFAULT_STROKE_STYLE };
  private wandStyle: WandStyle = { ...DEFAULT_WAND_STYLE };
  private maskEditLayerId: string | null = null;
  private snapEnabled = true;
  private penTool: PenTool;
  private pixelTool: PixelDrawTool;

  constructor(private ctx: ToolContext) {
    this.transformTool = new TransformTool();
    this.penTool = new PenTool();
    const style = () => this.paintStyle;
    const maskTarget = () => this.maskEditLayerId;
    this.register(new MoveTool());
    this.register(this.transformTool);
    this.register(new SelectionRectTool());
    this.register(new EllipseMarqueeTool());
    this.register(new LassoTool());
    this.register(new MagicWandTool(() => this.wandStyle));
    this.register(new CropTool());
    this.register(new PaintTool("brush", style, maskTarget));
    this.register(new PaintTool("pencil", style, maskTarget));
    this.register(new PaintTool("eraser", style, maskTarget));
    this.register(this.penTool);
    this.register(new CloneTool(style));
    this.register(new HealTool(style));
    this.register(new HandTool());
    this.pixelTool = new PixelDrawTool(
      () => this.paintStyle.color,
      (hex) => {
        this.paintStyle = { ...this.paintStyle, color: hex };
      },
    );
    this.activeId = "move";
  }

  private register(tool: Tool): void {
    this.tools.set(tool.id, tool);
  }

  list(): Tool[] {
    return Array.from(this.tools.values());
  }

  getActive(): Tool {
    if (this.ctx.graph.getKind() === "sprite" && PIXEL_MODES[this.activeId]) return this.pixelTool;
    return this.tools.get(this.activeId) ?? this.tools.get("move")!;
  }

  getActiveId(): ToolId {
    return this.activeId;
  }

  setActive(id: ToolId): void {
    const pixelMode = PIXEL_MODES[id];
    if (pixelMode && !this.tools.has(id)) {
      this.pixelTool.setMode(pixelMode);
      this.activeId = id;
      this.ctx.renderer.setShowTransformHandles(false);
      this.ctx.renderer.setCursorOverride(null);
      this.ctx.renderer.setToolCursor(null);
      return;
    }
    if (pixelMode) this.pixelTool.setMode(pixelMode);
    if (!this.tools.has(id)) return;
    if (this.activeId === "pen" && id !== "pen") this.penTool.reset(this.ctx);
    this.activeId = id;
    const showHandles = id === "transform";
    this.ctx.renderer.setShowTransformHandles(showHandles);
    if (!showHandles) this.ctx.renderer.setCursorOverride(null);
    this.ctx.renderer.setToolCursor(null);
  }

  getPenTool(): PenTool {
    return this.penTool;
  }

  setLockAspect(lock: boolean): void {
    this.transformTool.lockAspect = lock;
  }

  getLockAspect(): boolean {
    return this.transformTool.lockAspect;
  }

  setSnapEnabled(on: boolean): void {
    this.snapEnabled = on;
  }

  setPaintStyle(patch: Partial<StrokeStyle>): void {
    this.paintStyle = { ...this.paintStyle, ...patch };
  }

  getPaintStyle(): StrokeStyle {
    return { ...this.paintStyle };
  }

  setWandStyle(patch: Partial<WandStyle>): void {
    this.wandStyle = { ...this.wandStyle, ...patch };
  }

  getWandStyle(): WandStyle {
    return { ...this.wandStyle };
  }

  setMaskEditTarget(layerId: string | null): void {
    this.maskEditLayerId = layerId;
  }

  getMaskEditTarget(): string | null {
    return this.maskEditLayerId;
  }

  pointerDown(pt: PointerSample): void {
    this.getActive().onPointerDown(pt, this.ctx);
  }

  pointerMove(pt: PointerSample): void {
    this.getActive().onPointerMove(pt, this.ctx);
  }

  pointerUp(pt: PointerSample): void {
    this.getActive().onPointerUp(pt, this.ctx);
  }
}
