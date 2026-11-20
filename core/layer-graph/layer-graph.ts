import {
  CanvasSize,
  Cel,
  DocumentKind,
  DocumentMeta,
  Frame,
  identityTransform,
  Layer,
  LayerGraphEvent,
  LayerGraphListener,
  Palette,
  PixelSettings,
  RasterSource,
  Transform,
} from "./types";

let idCounter = 0;

/** Transparent bitmap. A canvas in the browser so Pixi can texture it; raw pixels in tests. */
function blankSource(width: number, height: number): RasterSource {
  const w = Math.max(1, Math.round(width));
  const h = Math.max(1, Math.round(height));
  if (typeof document !== "undefined") {
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    return { width: w, height: h, bitmap: canvas };
  }
  return { width: w, height: h, bitmap: { kind: "pixels", data: new Uint8ClampedArray(w * h * 4) } };
}

function nextId(prefix = "layer"): string {
  idCounter += 1;
  return `${prefix}_${Date.now().toString(36)}_${idCounter.toString(36)}`;
}

/**
 * The LayerGraph owns the ordered list of Layers, the active layer, canvas
 * dimensions and document metadata. It is pure data + methods — no rendering.
 *
 * IMPORTANT: UI handlers must never call these mutators directly. All mutations
 * flow through Commands (see /core/commands) so undo/redo stays authoritative.
 * The Command layer is the only intended caller of the mutating methods here.
 */
export class LayerGraph {
  private layers: Layer[] = [];
  private activeLayerId: string | null = null;
  private canvas: CanvasSize;
  private meta: DocumentMeta;
  private listeners = new Set<LayerGraphListener>();
  private kind: DocumentKind = "photo";
  private frames: Frame[] = [];
  private cels: Cel[] = [];
  private activeFrameId: string;
  private palette: Palette | null = null;
  private pixel: PixelSettings | null = null;

  constructor(canvas: CanvasSize = { width: 1280, height: 720 }, name = "Untitled") {
    this.canvas = { ...canvas };
    const now = Date.now();
    this.meta = { name, createdAt: now, modifiedAt: now };
    const frame = this.makeFrame();
    this.frames = [frame];
    this.activeFrameId = frame.id;
  }

  // ---- subscription -------------------------------------------------------

  subscribe(listener: LayerGraphListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(event: LayerGraphEvent): void {
    this.meta.modifiedAt = Date.now();
    for (const l of this.listeners) l(event);
  }

  // ---- reads --------------------------------------------------------------

  getLayers(): readonly Layer[] {
    return this.layers;
  }

  /** Layers in paint order (bottom first). z-order === array order. */
  getLayersBottomUp(): readonly Layer[] {
    return this.layers;
  }

  getLayer(id: string): Layer | undefined {
    return this.layers.find((l) => l.id === id);
  }

  getActiveLayerId(): string | null {
    return this.activeLayerId;
  }

  getActiveLayer(): Layer | undefined {
    return this.activeLayerId ? this.getLayer(this.activeLayerId) : undefined;
  }

  getCanvasSize(): CanvasSize {
    return { ...this.canvas };
  }

  getMeta(): DocumentMeta {
    return { ...this.meta };
  }

  getKind(): DocumentKind {
    return this.kind;
  }

  getFrames(): readonly Frame[] {
    return this.frames;
  }

  getActiveFrameId(): string {
    return this.activeFrameId;
  }

  getCels(): readonly Cel[] {
    return this.cels;
  }

  getPalette(): Palette | null {
    return this.palette ? { ...this.palette, colors: [...this.palette.colors], ramps: this.palette.ramps.map((r) => ({ ...r, indexes: [...r.indexes] })) } : null;
  }

  getPixelSettings(): PixelSettings | null {
    return this.pixel ? { ...this.pixel, grid: { ...this.pixel.grid } } : null;
  }

  /** The cel for a layer on a frame, following links to the cel that owns the pixels. */
  resolveCel(layerId: string, frameId = this.activeFrameId): Cel | undefined {
    const cel = this.cels.find((c) => c.layerId === layerId && c.frameId === frameId);
    if (!cel) return undefined;
    if (!cel.linkedTo) return cel;
    const seen = new Set<string>([`${layerId}:${frameId}`]);
    let current = cel;
    while (current.linkedTo) {
      const key = `${current.linkedTo.layerId}:${current.linkedTo.frameId}`;
      if (seen.has(key)) return current;
      seen.add(key);
      const next = this.cels.find(
        (c) => c.layerId === current.linkedTo!.layerId && c.frameId === current.linkedTo!.frameId,
      );
      if (!next) return current;
      current = next;
    }
    return current;
  }

  // ---- mutators (Command-only callers) -----------------------------------

  createRasterLayer(name: string, source: RasterSource, transform?: Partial<Transform>): Layer {
    const layer: Layer = {
      id: nextId(),
      name,
      type: "raster",
      transform: { ...identityTransform(), ...transform },
      opacity: 1,
      blendMode: "normal",
      visible: true,
      locked: false,
      source,
    };
    return layer;
  }

  /** Folder-style group — no pixels; children keep painting in the flat stack. */
  createGroupLayer(name: string, childIds: string[], source: RasterSource): Layer {
    return {
      id: nextId("group"),
      name,
      type: "group",
      transform: identityTransform(),
      opacity: 1,
      blendMode: "normal",
      visible: true,
      locked: false,
      source,
      childIds: [...childIds],
    };
  }

  addLayer(layer: Layer, index?: number): void {
    const at = index === undefined ? this.layers.length : index;
    this.layers.splice(at, 0, layer);
    this.ensureCelsForLayer(layer);
    this.activeLayerId = layer.id;
    this.emit({ type: "layer-added", layerId: layer.id });
    this.emit({ type: "active-changed", layerId: layer.id });
  }

  removeLayer(id: string): Layer | undefined {
    const idx = this.layers.findIndex((l) => l.id === id);
    if (idx === -1) return undefined;
    const [removed] = this.layers.splice(idx, 1);
    if (this.activeLayerId === id) {
      const next = this.layers[idx] ?? this.layers[idx - 1] ?? null;
      this.activeLayerId = next ? next.id : null;
      this.emit({ type: "active-changed", layerId: this.activeLayerId });
    }
    this.cels = this.cels.filter((c) => c.layerId !== id);
    this.emit({ type: "layer-removed", layerId: id });
    return removed;
  }

  /** Returns the current index of a layer (or -1). */
  indexOf(id: string): number {
    return this.layers.findIndex((l) => l.id === id);
  }

  moveLayer(id: string, toIndex: number): void {
    const from = this.indexOf(id);
    if (from === -1) return;
    const [layer] = this.layers.splice(from, 1);
    const clamped = Math.max(0, Math.min(toIndex, this.layers.length));
    this.layers.splice(clamped, 0, layer);
    this.emit({ type: "layer-reordered" });
  }

  setActiveLayer(id: string | null): void {
    if (id !== null && !this.getLayer(id)) return;
    this.activeLayerId = id;
    this.emit({ type: "active-changed", layerId: id });
  }

  updateLayer(id: string, patch: Partial<Omit<Layer, "id" | "type" | "source">>): void {
    const layer = this.getLayer(id);
    if (!layer) return;
    Object.assign(layer, patch);
    this.emit({ type: "layer-updated", layerId: id });
  }

  setTransform(id: string, transform: Transform): void {
    const layer = this.getLayer(id);
    if (!layer) return;
    layer.transform = { ...transform };
    this.emit({ type: "layer-updated", layerId: id });
  }

  translate(id: string, dx: number, dy: number): void {
    const layer = this.getLayer(id);
    if (!layer) return;
    layer.transform.x += dx;
    layer.transform.y += dy;
    this.emit({ type: "layer-updated", layerId: id });
  }

  setCanvasSize(size: CanvasSize): void {
    this.canvas = { ...size };
    this.emit({ type: "canvas-resized" });
  }

  setName(name: string): void {
    this.meta.name = name;
    this.emit({ type: "layer-updated", layerId: "" });
  }

  setBackground(background: DocumentMeta["background"]): void {
    this.meta.background = background;
    this.emit({ type: "canvas-resized" });
  }

  replaceLayerSource(id: string, source: RasterSource): void {
    const layer = this.getLayer(id);
    if (!layer) return;
    layer.source = source;
    const direct = this.cels.find((c) => c.layerId === id && c.frameId === this.activeFrameId);
    if (direct?.linkedTo) {
      const owner = this.resolveCel(id);
      if (owner) owner.source = source;
    } else if (direct) {
      direct.source = source;
    }
    this.emit({ type: "layer-updated", layerId: id });
  }

  setKind(kind: DocumentKind): void {
    this.kind = kind;
    if (kind === "sprite" && !this.pixel) {
      this.pixel = {
        colorMode: "rgb",
        paletteOnly: false,
        pixelGrid: true,
        grid: { width: 8, height: 8, offsetX: 0, offsetY: 0, visible: false },
      };
    }
    this.emit({ type: "layer-updated", layerId: "" });
  }

  setPalette(palette: Palette | null): void {
    this.palette = palette;
    this.emit({ type: "layer-updated", layerId: "" });
  }

  setPixelSettings(pixel: PixelSettings | null): void {
    this.pixel = pixel;
    this.emit({ type: "layer-updated", layerId: "" });
  }

  /** Add a frame after the active one. New cels are empty. Returns the new frame id. */
  addFrame(durationMs = 100): string {
    const frame = this.makeFrame(durationMs);
    const index = this.frames.findIndex((f) => f.id === this.activeFrameId);
    this.frames.splice(index + 1, 0, frame);
    for (const layer of this.layers) {
      this.cels.push({
        layerId: layer.id,
        frameId: frame.id,
        source: null,
        offsetX: 0,
        offsetY: 0,
        opacity: 1,
      });
    }
    this.emit({ type: "frame-changed", frameId: this.activeFrameId });
    return frame.id;
  }

  /** Link `layerId` on the active frame to another cel's pixels. */
  linkCel(layerId: string, target: { layerId: string; frameId: string }): void {
    const cel = this.cels.find((c) => c.layerId === layerId && c.frameId === this.activeFrameId);
    if (!cel) return;
    cel.linkedTo = target;
    cel.source = null;
    this.applyActiveFrame();
    this.emit({ type: "layer-updated", layerId });
  }

  deleteFrame(frameId: string): { frame: Frame; index: number; cels: Cel[] } | undefined {
    if (this.frames.length <= 1) return undefined;
    const index = this.frames.findIndex((f) => f.id === frameId);
    if (index === -1) return undefined;
    const [frame] = this.frames.splice(index, 1);
    const removed = this.cels.filter((c) => c.frameId === frameId);
    this.cels = this.cels.filter((c) => c.frameId !== frameId);
    for (const cel of this.cels) {
      if (cel.linkedTo?.frameId === frameId) cel.linkedTo = undefined;
    }
    if (this.activeFrameId === frameId) {
      const next = this.frames[Math.max(0, index - 1)];
      this.activeFrameId = next.id;
      this.applyActiveFrame();
    }
    this.emit({ type: "frame-changed", frameId: this.activeFrameId });
    return { frame, index, cels: removed };
  }

  restoreFrame(frame: Frame, index: number, cels: Cel[]): void {
    if (this.frames.some((f) => f.id === frame.id)) return;
    this.frames.splice(Math.max(0, Math.min(index, this.frames.length)), 0, frame);
    this.cels.push(...cels.map((c) => ({ ...c })));
    this.emit({ type: "frame-changed", frameId: this.activeFrameId });
  }

  /**
   * Show another frame. Each layer's `source` becomes that frame's cel, so the
   * renderer (which draws `layer.source`) shows the active frame.
   */
  setActiveFrame(frameId: string): void {
    if (!this.frames.some((f) => f.id === frameId)) return;
    if (this.activeFrameId === frameId) return;
    this.captureActiveFrame();
    this.activeFrameId = frameId;
    this.applyActiveFrame();
    this.emit({ type: "frame-changed", frameId });
  }

  /**
   * Replace the graph from a loaded file. Pass frames/cels for `.atelier` v3.
   * Omitted frames mean "one frame, one cel per layer" (`.cpe` v1/v2).
   */
  replaceWith(
    layers: Layer[],
    canvas: CanvasSize,
    meta: DocumentMeta,
    model?: {
      kind?: DocumentKind;
      frames?: Frame[];
      cels?: Cel[];
      activeFrameId?: string;
      palette?: Palette | null;
      pixel?: PixelSettings | null;
    },
  ): void {
    this.layers = layers;
    this.canvas = { ...canvas };
    this.meta = { ...meta };
    this.kind = model?.kind ?? "photo";
    this.palette = model?.palette ?? null;
    this.pixel = model?.pixel ?? null;
    if (model?.frames && model.frames.length > 0 && model.cels) {
      this.frames = model.frames.map((f) => ({ ...f }));
      this.cels = model.cels.map((c) => ({ ...c }));
      this.activeFrameId = model.activeFrameId && this.frames.some((f) => f.id === model.activeFrameId)
        ? model.activeFrameId
        : this.frames[0].id;
    } else {
      const frame = this.makeFrame();
      this.frames = [frame];
      this.activeFrameId = frame.id;
      this.cels = layers.map((layer) => ({
        layerId: layer.id,
        frameId: frame.id,
        source: layer.type === "group" ? null : layer.source,
        offsetX: 0,
        offsetY: 0,
        opacity: 1,
      }));
    }
    this.applyActiveFrame();
    this.activeLayerId = layers.length ? layers[layers.length - 1].id : null;
    this.emit({ type: "graph-replaced" });
  }

  private makeFrame(durationMs = 100): Frame {
    return { id: nextId("frame"), durationMs };
  }

  private ensureCelsForLayer(layer: Layer): void {
    for (const frame of this.frames) {
      if (this.cels.some((c) => c.layerId === layer.id && c.frameId === frame.id)) continue;
      const active = frame.id === this.activeFrameId;
      this.cels.push({
        layerId: layer.id,
        frameId: frame.id,
        source: active && layer.type !== "group" ? layer.source : null,
        offsetX: 0,
        offsetY: 0,
        opacity: 1,
      });
    }
  }

  /** Write the on-screen bitmaps back onto the active frame before leaving it. */
  private captureActiveFrame(): void {
    for (const layer of this.layers) {
      if (layer.type === "group") continue;
      const cel = this.cels.find((c) => c.layerId === layer.id && c.frameId === this.activeFrameId);
      if (!cel || cel.linkedTo) continue;
      cel.source = layer.source;
    }
  }

  /** Point every layer at the cel that should be visible on the active frame. */
  private applyActiveFrame(): void {
    for (const layer of this.layers) {
      if (layer.type === "group") continue;
      const owner = this.resolveCel(layer.id);
      layer.source = owner?.source ?? blankSource(this.canvas.width, this.canvas.height);
    }
    for (const layer of this.layers) {
      this.emit({ type: "layer-updated", layerId: layer.id });
    }
  }
}
