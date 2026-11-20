import assert from "node:assert/strict";
import test from "node:test";
import JSZip from "jszip";
import { CommandBus, History } from "../core/commands";
import {
  AddFrameCommand,
  DeleteFrameCommand,
  ReplaceLayerSourceCommand,
  SetActiveFrameCommand,
  SetPixelSettingsCommand,
} from "../core/commands";
import {
  RasterCodec,
  createImage,
  drawEllipse,
  drawLine,
  drawRect,
  ellipseMask,
  flipHorizontal,
  floodFill,
  getPixel,
  lassoMask,
  movePixels,
  rectMask,
  rotateImage,
  wandMask,
  isPixelBitmap,
  loadProject,
  parseHex,
  putPixel,
  saveProject,
  strokePixels,
} from "../core/file-io";
import {
  cellGridLines,
  fitSpriteZoom,
  pixelGridLines,
  showPixelGrid,
  stepSpriteZoom,
} from "../core/file-io/pixel-view";
import { LayerGraph, RasterSource } from "../core/layer-graph";
import { PixelDrawTool } from "../core/tools/pixel-draw-tool";
import { EllipseMarqueeTool } from "../core/tools/ellipse-marquee-tool";
import { LassoTool } from "../core/tools/lasso-tool";
import { MagicWandTool } from "../core/tools/magic-wand-tool";
import { MoveTool } from "../core/tools/move-tool";
import { SelectionRectTool } from "../core/tools/selection-rect-tool";
import type { Renderer } from "../core/render";

const RED = parseHex("#ff0000");
const BLUE = parseHex("#0000ff");

function pixels(width: number, height: number): RasterSource {
  const image = createImage(width, height);
  return { width, height, bitmap: { kind: "pixels", data: image.data } };
}

function paint(source: RasterSource, x: number, y: number, color = RED): void {
  assert.ok(isPixelBitmap(source.bitmap));
  putPixel({ width: source.width, height: source.height, data: source.bitmap.data }, x, y, color);
}

function read(source: RasterSource, x: number, y: number) {
  assert.ok(isPixelBitmap(source.bitmap));
  return getPixel({ width: source.width, height: source.height, data: source.bitmap.data }, x, y);
}

const codec: RasterCodec = {
  async encode(source) {
    assert.ok(isPixelBitmap(source.bitmap));
    const header = new Uint8Array(12);
    header.set([65, 84, 76, 82], 0);
    new DataView(header.buffer).setUint32(4, source.width, true);
    new DataView(header.buffer).setUint32(8, source.height, true);
    const out = new Uint8Array(12 + source.bitmap.data.length);
    out.set(header, 0);
    out.set(source.bitmap.data, 12);
    return out;
  },
  async decode(bytes) {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const width = view.getUint32(4, true);
    const height = view.getUint32(8, true);
    const data = new Uint8ClampedArray(bytes.subarray(12));
    return { width, height, bitmap: { kind: "pixels", data } };
  },
};

function sprite(size = 16): { graph: LayerGraph; bus: CommandBus } {
  const graph = new LayerGraph({ width: size, height: size }, "Sprite");
  graph.setKind("sprite");
  const layer = graph.createRasterLayer("Cel", pixels(size, size));
  graph.addLayer(layer);
  const bus = new CommandBus(graph, new History());
  return { graph, bus };
}

test("photo documents keep one frame and one cel sharing the layer bitmap", () => {
  const graph = new LayerGraph({ width: 4, height: 4 }, "Photo");
  const source = pixels(4, 4);
  paint(source, 1, 1);
  graph.addLayer(graph.createRasterLayer("Layer", source));
  assert.equal(graph.getKind(), "photo");
  assert.equal(graph.getFrames().length, 1);
  assert.equal(graph.getCels().length, 1);
  assert.equal(graph.getCels()[0].source, graph.getActiveLayer()?.source);
});

test("frames isolate pixels and undo returns to the previous frame", () => {
  const graph = new LayerGraph({ width: 4, height: 4 }, "Anim");
  const source = pixels(4, 4);
  paint(source, 0, 0);
  graph.addLayer(graph.createRasterLayer("Cel", source));
  const bus = new CommandBus(graph, new History());
  const first = graph.getActiveFrameId();
  bus.dispatch(new AddFrameCommand());
  const second = graph.getFrames().find((f) => f.id !== first)!.id;
  bus.dispatch(new SetActiveFrameCommand(second));
  const shown = read(graph.getActiveLayer()!.source, 0, 0);
  assert.equal(shown?.a, 0);
  bus.dispatch(new SetActiveFrameCommand(first));
  assert.equal(read(graph.getActiveLayer()!.source, 0, 0)?.r, 255);
  bus.undo();
  assert.equal(graph.getActiveFrameId(), second);
  bus.undo();
  assert.equal(graph.getActiveFrameId(), first);
  bus.undo();
  assert.equal(graph.getFrames().length, 1);
});

test("a linked cel edits the owner's pixels", () => {
  const graph = new LayerGraph({ width: 4, height: 4 }, "Link");
  const source = pixels(4, 4);
  graph.addLayer(graph.createRasterLayer("Cel", source));
  const first = graph.getActiveFrameId();
  const second = graph.addFrame();
  graph.setActiveFrame(second);
  graph.linkCel(graph.getActiveLayer()!.id, { layerId: graph.getActiveLayer()!.id, frameId: first });
  const next = pixels(4, 4);
  paint(next, 2, 2, BLUE);
  graph.replaceLayerSource(graph.getActiveLayer()!.id, next);
  graph.setActiveFrame(first);
  assert.equal(read(graph.getActiveLayer()!.source, 2, 2)?.b, 255);
});

test("delete frame undo restores the frame", () => {
  const graph = new LayerGraph({ width: 2, height: 2 }, "Frames");
  graph.addLayer(graph.createRasterLayer("Cel", pixels(2, 2)));
  const bus = new CommandBus(graph, new History());
  bus.dispatch(new AddFrameCommand());
  const extra = graph.getFrames()[1].id;
  bus.dispatch(new DeleteFrameCommand(extra));
  assert.equal(graph.getFrames().length, 1);
  bus.undo();
  assert.equal(graph.getFrames().length, 2);
  assert.ok(graph.getFrames().some((f) => f.id === extra));
});

test("atelier v3 round-trips a sprite and a .cpe v2 opens without being rewritten", async () => {
  const { graph } = sprite(16);
  paint(graph.getActiveLayer()!.source, 3, 4);
  const blob = await saveProject(graph, codec);
  const zip = await JSZip.loadAsync(await blob.arrayBuffer());
  const manifest = JSON.parse(await zip.file("manifest.json")!.async("string")) as {
    format: string;
    version: number;
    kind: string;
    cels: { file: string | null }[];
  };
  assert.equal(manifest.format, "atelier");
  assert.equal(manifest.version, 3);
  assert.equal(manifest.kind, "sprite");
  assert.ok(manifest.cels.some((c) => c.file?.endsWith(".png")));

  const opened = new LayerGraph();
  await loadProject(blob, opened, codec);
  assert.equal(opened.getKind(), "sprite");
  assert.equal(read(opened.getActiveLayer()!.source, 3, 4)?.r, 255);

  const legacy = new JSZip();
  const photo = new LayerGraph({ width: 2, height: 2 }, "Old");
  const source = pixels(2, 2);
  paint(source, 1, 0, BLUE);
  const layer = photo.createRasterLayer("Photo", source);
  photo.addLayer(layer);
  legacy.file("manifest.json", JSON.stringify({
    version: 2,
    name: "Old",
    createdAt: 1,
    modifiedAt: 1,
    canvas: { width: 2, height: 2 },
    layers: [{
      id: layer.id,
      name: "Photo",
      type: "raster",
      dataFile: `layers/${layer.id}.webp`,
      transform: layer.transform,
      opacity: 1,
      blendMode: "normal",
      visible: true,
      locked: false,
      width: 2,
      height: 2,
    }],
  }));
  legacy.file(`layers/${layer.id}.webp`, await codec.encode(source, "image/webp"));
  const original = await legacy.generateAsync({ type: "uint8array" });
  const untouched = original.slice();
  const restored = new LayerGraph();
  await loadProject(new Blob([original as unknown as BlobPart]), restored, codec);
  assert.equal(restored.getKind(), "photo");
  assert.equal(restored.getFrames().length, 1);
  assert.equal(read(restored.getActiveLayer()!.source, 1, 0)?.b, 255);
  assert.deepEqual(original, untouched);
});

test("pixel tools change one command worth of a 16×16 sprite and undo restores it", () => {
  const { graph, bus } = sprite(16);
  const tool = new PixelDrawTool(() => "#ff0000", () => {});
  const renderer = {
    refreshLayerFromBitmap() {},
    screenToDocument(x: number, y: number) { return { x, y }; },
  } as unknown as Renderer;
  const ctx = { graph, bus, renderer };
  const layerId = graph.getActiveLayer()!.id;

  const stroke = (mode: "pencil" | "eraser" | "bucket" | "line" | "rect" | "ellipse", a: [number, number], b?: [number, number]) => {
    tool.setMode(mode);
    tool.onPointerDown({ canvasX: a[0], canvasY: a[1], shiftKey: false, altKey: false }, ctx);
    if (b) tool.onPointerMove({ canvasX: b[0], canvasY: b[1], shiftKey: false, altKey: false }, ctx);
    tool.onPointerUp({ canvasX: (b ?? a)[0], canvasY: (b ?? a)[1], shiftKey: false, altKey: false }, ctx);
  };

  stroke("pencil", [1, 1]);
  assert.equal(read(graph.getLayer(layerId)!.source, 1, 1)?.r, 255);
  bus.undo();
  assert.equal(read(graph.getLayer(layerId)!.source, 1, 1)?.a, 0);

  stroke("pencil", [2, 2]);
  stroke("eraser", [2, 2]);
  assert.equal(read(graph.getLayer(layerId)!.source, 2, 2)?.a, 0);

  stroke("bucket", [0, 0]);
  assert.equal(read(graph.getLayer(layerId)!.source, 15, 15)?.r, 255);
  bus.undo();

  stroke("line", [0, 0], [4, 0]);
  assert.equal(read(graph.getLayer(layerId)!.source, 4, 0)?.r, 255);
  bus.undo();

  stroke("rect", [1, 1], [4, 3]);
  assert.equal(read(graph.getLayer(layerId)!.source, 1, 1)?.r, 255);
  assert.equal(read(graph.getLayer(layerId)!.source, 2, 2)?.a ?? 0, 0);
  bus.undo();

  stroke("ellipse", [0, 0], [6, 6]);
  const image = graph.getLayer(layerId)!.source;
  assert.ok(isPixelBitmap(image.bitmap));
  const drawn = drawEllipse(createImage(16, 16), 0, 0, 6, 6, RED, false);
  assert.equal(image.bitmap.data[0], drawn.data[0]);
  bus.undo();

  const ops = strokePixels(createImage(4, 4), [{ x: 0, y: 0 }], RED, false);
  assert.equal(getPixel(ops, 0, 0)?.a, 255);
  const line = drawLine(createImage(4, 4), 0, 0, 3, 0, RED, false);
  assert.equal(getPixel(line, 3, 0)?.r, 255);
  const rect = drawRect(createImage(4, 4), 0, 0, 2, 2, RED, false);
  assert.equal(getPixel(rect, 0, 2)?.r, 255);
  const filled = floodFill(createImage(4, 4), 0, 0, RED, true);
  assert.equal(getPixel(filled, 3, 3)?.r, 255);
});

test("sprite selection, move, flip, and rotate stay on whole pixels and undo", () => {
  const { graph, bus } = sprite(4);
  const layer = graph.getActiveLayer()!;
  paint(layer.source, 0, 0);
  paint(layer.source, 1, 0, BLUE);

  type PixelMask = { width: number; height: number; data: Uint8Array };
  let mask: PixelMask | null = null;
  const renderer = {
    screenToDocument(x: number, y: number) { return { x, y }; },
    setSelection() {},
    setSelectionMask(next: PixelMask | null) { mask = next; },
    getSelectionMask() { return mask; },
    setLassoPath() {},
    setSnapLines() {},
    clearPreview() {},
    setPreviewOffset() {},
    hitTest() { return layer.id; },
    hitTestLayer() { return true; },
  } as unknown as Renderer;
  const ctx = { graph, bus, renderer };
  const pt = (x: number, y: number) => ({ canvasX: x, canvasY: y, shiftKey: false, altKey: false });

  const marquee = new SelectionRectTool();
  marquee.onPointerDown(pt(0, 0), ctx);
  marquee.onPointerUp(pt(1, 1), ctx);
  assert.equal(mask!.data[0], 255);
  assert.equal(mask!.data[3], 0);

  const ellipse = new EllipseMarqueeTool();
  ellipse.onPointerDown(pt(0, 0), ctx);
  ellipse.onPointerUp(pt(3, 3), ctx);
  const expectedEllipse = ellipseMask(4, 4, 0, 0, 3, 3);
  assert.deepEqual(mask!.data, expectedEllipse);

  const lasso = new LassoTool();
  lasso.onPointerDown(pt(0, 0), ctx);
  lasso.onPointerMove(pt(2, 0), ctx);
  lasso.onPointerMove(pt(2, 2), ctx);
  lasso.onPointerMove(pt(0, 2), ctx);
  lasso.onPointerUp(pt(0, 2), ctx);
  const expectedLasso = lassoMask(4, 4, [{ x: 0, y: 0 }, { x: 2, y: 0 }, { x: 2, y: 2 }, { x: 0, y: 2 }]);
  assert.ok(mask!.data[0] > 0);
  assert.deepEqual(mask!.data, expectedLasso);

  mask = { width: 4, height: 4, data: rectMask(4, 4, 0, 0, 0, 0) };
  const wand = new MagicWandTool(() => ({ tolerance: 32, feather: 4, contiguous: true }));
  wand.onPointerDown(pt(0, 0), ctx);
  const expectedWand = wandMask({ width: 4, height: 4, data: (layer.source.bitmap as { data: Uint8ClampedArray }).data }, 0, 0, true);
  assert.deepEqual(mask!.data, expectedWand);
  assert.equal(mask!.data[0], 255);
  assert.equal(mask!.data[1], 0);

  const mover = new MoveTool();
  mover.onPointerDown(pt(0, 0), ctx);
  mover.onPointerMove(pt(1, 0), ctx);
  mover.onPointerUp(pt(1, 0), ctx);
  assert.equal(read(graph.getActiveLayer()!.source, 1, 0)?.r, 255);
  bus.undo();
  assert.equal(read(graph.getActiveLayer()!.source, 0, 0)?.r, 255);

  const flipped = flipHorizontal({ width: 4, height: 4, data: (graph.getActiveLayer()!.source.bitmap as { data: Uint8ClampedArray }).data });
  assert.equal(getPixel(flipped, 3, 0)?.r, 255);
  const turned = rotateImage(flipped, 2);
  assert.equal(getPixel(turned, 0, 3)?.r, 255);
  const moved = movePixels(turned, 0, -1);
  assert.equal(getPixel(moved, 0, 2)?.r, 255);
});

test("sprite zoom stays on whole steps, including 1800%, and grids can be toggled", () => {
  assert.equal(stepSpriteZoom(1, 1), 2);
  assert.equal(stepSpriteZoom(17.2, 1), 18);
  assert.equal(stepSpriteZoom(18, -1), 17);
  assert.equal(stepSpriteZoom(1, -1), 1);
  assert.equal(stepSpriteZoom(32, 1), 32);
  assert.equal(fitSpriteZoom(18.9), 18);
  assert.equal(fitSpriteZoom(0.2), 1);
  assert.equal(showPixelGrid(18, true), true);
  assert.equal(showPixelGrid(3, true), false);
  assert.equal(showPixelGrid(18, false), false);

  const pixels = pixelGridLines(16, 16);
  assert.equal(pixels.vertical.length, 17);
  assert.equal(pixels.vertical[0], 0);
  assert.equal(pixels.vertical[16], 16);
  const cells = cellGridLines(16, 16, 8, 8, 0, 0);
  assert.deepEqual(cells.vertical, [0, 8, 16]);

  const { graph, bus } = sprite(16);
  const before = graph.getPixelSettings()!;
  assert.equal(before.pixelGrid, true);
  bus.dispatch(new SetPixelSettingsCommand({ ...before, pixelGrid: false, grid: { ...before.grid, visible: true } }));
  assert.equal(graph.getPixelSettings()?.pixelGrid, false);
  assert.equal(graph.getPixelSettings()?.grid.visible, true);
  bus.undo();
  assert.equal(graph.getPixelSettings()?.pixelGrid, true);
  assert.equal(graph.getPixelSettings()?.grid.visible, false);
});
