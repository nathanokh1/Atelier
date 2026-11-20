import JSZip from "jszip";
import {
  BlendMode,
  CanvasBackground,
  CanvasSize,
  Cel,
  DocumentKind,
  DocumentMeta,
  Frame,
  Layer,
  LayerGraph,
  LayerType,
  Palette,
  PixelSettings,
  RasterSource,
  Transform,
} from "../layer-graph";
import { loadImageAsSource } from "./import";

/**
 * Turns a layer bitmap into bytes and back. The browser uses canvas (WebP for
 * photos, PNG for sprites). Tests pass a codec that does not need a DOM.
 */
export interface RasterCodec {
  encode(source: RasterSource, mime: "image/png" | "image/webp"): Promise<Uint8Array>;
  decode(bytes: Uint8Array): Promise<RasterSource>;
}

function browserCodec(): RasterCodec {
  return {
    async encode(source, mime) {
      const blob = mime === "image/png" ? await bitmapToBlob(source, "image/png") : await bitmapToWebpBlob(source);
      return new Uint8Array(await blob.arrayBuffer());
    },
    decode(bytes) {
      return loadImageAsSource(new Blob([bytes as unknown as BlobPart]));
    },
  };
}

/**
 * `.cpe` project file — a zip container with `manifest.json` + per-layer WebP
 * raster data. See ARCHITECTURE.md §.cpe spec. This path is on the Safety Floor
 * (data loss risk); keep the schema stable and backward-compatible.
 *
 * v2 (current): persists full layer fidelity — layer type, text metadata,
 * groups (parentId/childIds), layer masks, mask-enabled, and clipping — so a
 * reopened project restores the real editable document, not a flattened raster.
 * v1 files (raster-only) still load.
 *
 * Note: undo/redo history is intentionally NOT persisted. History can be huge
 * (every stroke keeps a bitmap) and is session-scoped; saving it would bloat
 * files without real benefit. Reopening starts with a fresh, empty history.
 */

const CPE_VERSION = 2;

interface ManifestLayer {
  id: string;
  name: string;
  type: LayerType;
  dataFile: string;
  maskFile?: string;
  maskEnabled?: boolean;
  clip?: boolean;
  transform: Transform;
  opacity: number;
  blendMode: BlendMode;
  visible: boolean;
  locked: boolean;
  width: number;
  height: number;
  parentId?: string | null;
  childIds?: string[];
  // Text layer metadata (kept so text stays editable after reopen).
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fillColor?: string;
  bold?: boolean;
  italic?: boolean;
  align?: "left" | "center" | "right";
  strokeColor?: string;
  strokeWidth?: number;
  shadowColor?: string;
  shadowBlur?: number;
}

interface Manifest {
  version: number;
  name: string;
  createdAt: number;
  modifiedAt: number;
  canvas: CanvasSize;
  background?: CanvasBackground;
  activeLayerId?: string | null;
  layers: ManifestLayer[];
}

function bitmapToWebpBlob(source: { bitmap: unknown; width: number; height: number }): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, source.width);
    canvas.height = Math.max(1, source.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) return reject(new Error("2D context unavailable"));
    if (source.bitmap) ctx.drawImage(source.bitmap as CanvasImageSource, 0, 0);
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("WebP encode failed"))),
      "image/webp",
      0.95,
    );
  });
}

const ATELIER_VERSION = 3;

interface AtelierCelManifest {
  layerId: string;
  frameId: string;
  file: string | null;
  offsetX: number;
  offsetY: number;
  opacity: number;
  linkedTo?: { layerId: string; frameId: string };
}

interface AtelierManifest {
  format: "atelier";
  version: number;
  kind: DocumentKind;
  name: string;
  createdAt: number;
  modifiedAt: number;
  size: CanvasSize;
  background?: CanvasBackground;
  activeLayerId?: string | null;
  activeFrameId: string;
  layers: Omit<ManifestLayer, "dataFile" | "width" | "height">[];
  frames: Frame[];
  cels: AtelierCelManifest[];
  palette?: Palette | null;
  pixel?: PixelSettings | null;
}

async function bitmapToBlob(
  source: { bitmap: unknown; width: number; height: number },
  mime: "image/png" | "image/webp",
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, source.width);
    canvas.height = Math.max(1, source.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) return reject(new Error("2D context unavailable"));
    if (source.bitmap) ctx.drawImage(source.bitmap as CanvasImageSource, 0, 0);
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Image encode failed"))),
      mime,
      mime === "image/webp" ? 0.95 : undefined,
    );
  });
}

/**
 * Serialize the document as `.atelier` v3. Photos store WebP cels, sprites store
 * PNG. Callers still pass the blob to a download or to IndexedDB; this function
 * never writes over a file the user already has.
 */
export async function saveProject(graph: LayerGraph, codec: RasterCodec = browserCodec()): Promise<Blob> {
  const zip = new JSZip();
  const meta = graph.getMeta();
  const kind = graph.getKind();
  const mime = kind === "sprite" ? "image/png" : "image/webp";
  const ext = kind === "sprite" ? "png" : "webp";
  const folder = zip.folder("cels");
  const maskFolder = zip.folder("masks");
  if (!folder || !maskFolder) throw new Error("Could not create archive folders");

  const activeFrameId = graph.getActiveFrameId();
  const celManifests: AtelierCelManifest[] = [];
  for (const cel of graph.getCels()) {
    const owner = cel.linkedTo ? graph.resolveCel(cel.layerId, cel.frameId) : cel;
    const visible = cel.frameId === activeFrameId ? graph.getLayer(cel.layerId)?.source ?? owner?.source ?? null : owner?.source ?? null;
    let file: string | null = null;
    if (visible && !cel.linkedTo) {
      file = `cels/${cel.layerId}_${cel.frameId}.${ext}`;
      folder.file(`${cel.layerId}_${cel.frameId}.${ext}`, await codec.encode(visible, mime));
    }
    celManifests.push({
      layerId: cel.layerId,
      frameId: cel.frameId,
      file,
      offsetX: cel.offsetX,
      offsetY: cel.offsetY,
      opacity: cel.opacity,
      linkedTo: cel.linkedTo,
    });
  }

  const layers = [];
  for (const layer of graph.getLayersBottomUp()) {
    let maskFile: string | undefined;
    if (layer.mask) {
      maskFile = `masks/${layer.id}.webp`;
      maskFolder.file(`${layer.id}.webp`, await codec.encode(layer.mask, "image/webp"));
    }
    const ml: Omit<ManifestLayer, "dataFile" | "width" | "height"> = {
      id: layer.id,
      name: layer.name,
      type: layer.type,
      maskFile,
      maskEnabled: layer.maskEnabled,
      clip: layer.clip,
      transform: layer.transform,
      opacity: layer.opacity,
      blendMode: layer.blendMode,
      visible: layer.visible,
      locked: layer.locked,
      parentId: layer.parentId ?? null,
      childIds: layer.childIds,
    };
    if (layer.type === "text") {
      ml.text = layer.text;
      ml.fontSize = layer.fontSize;
      ml.fontFamily = layer.fontFamily;
      ml.fillColor = layer.fillColor;
      ml.bold = layer.bold;
      ml.italic = layer.italic;
      ml.align = layer.align;
      ml.strokeColor = layer.strokeColor;
      ml.strokeWidth = layer.strokeWidth;
      ml.shadowColor = layer.shadowColor;
      ml.shadowBlur = layer.shadowBlur;
    }
    layers.push(ml);
  }

  const manifest: AtelierManifest = {
    format: "atelier",
    version: ATELIER_VERSION,
    kind,
    name: meta.name,
    createdAt: meta.createdAt,
    modifiedAt: Date.now(),
    size: graph.getCanvasSize(),
    background: meta.background,
    activeLayerId: graph.getActiveLayerId(),
    activeFrameId,
    layers,
    frames: graph.getFrames().map((f) => ({ ...f })),
    cels: celManifests,
    palette: graph.getPalette(),
    pixel: graph.getPixelSettings(),
  };
  zip.file("manifest.json", JSON.stringify(manifest, null, 2));
  const bytes = await zip.generateAsync({ type: "uint8array", compression: "DEFLATE" });
  return new Blob([bytes as unknown as BlobPart]);
}

/** Serialize the current Document to a legacy `.cpe` v2 Blob. Kept so old files can be reproduced in tests. */
export async function saveLegacyCpe(graph: LayerGraph, codec: RasterCodec = browserCodec()): Promise<Blob> {
  const zip = new JSZip();
  const meta = graph.getMeta();
  const layers = graph.getLayersBottomUp();
  const manifestLayers: ManifestLayer[] = [];
  const layerFolder = zip.folder("layers");
  const maskFolder = zip.folder("masks");
  if (!layerFolder || !maskFolder) throw new Error("Could not create archive folders");

  for (const layer of layers) {
    const dataFile = `layers/${layer.id}.webp`;
    const blob = await bitmapToWebpBlob(layer.source);
    layerFolder.file(`${layer.id}.webp`, blob);

    let maskFile: string | undefined;
    if (layer.mask) {
      maskFile = `masks/${layer.id}.webp`;
      maskFolder.file(`${layer.id}.webp`, await bitmapToWebpBlob(layer.mask));
    }

    const ml: ManifestLayer = {
      id: layer.id,
      name: layer.name,
      type: layer.type,
      dataFile,
      maskFile,
      maskEnabled: layer.maskEnabled,
      clip: layer.clip,
      transform: layer.transform,
      opacity: layer.opacity,
      blendMode: layer.blendMode,
      visible: layer.visible,
      locked: layer.locked,
      width: layer.source.width,
      height: layer.source.height,
      parentId: layer.parentId ?? null,
      childIds: layer.childIds,
    };
    if (layer.type === "text") {
      ml.text = layer.text;
      ml.fontSize = layer.fontSize;
      ml.fontFamily = layer.fontFamily;
      ml.fillColor = layer.fillColor;
      ml.bold = layer.bold;
      ml.italic = layer.italic;
      ml.align = layer.align;
      ml.strokeColor = layer.strokeColor;
      ml.strokeWidth = layer.strokeWidth;
      ml.shadowColor = layer.shadowColor;
      ml.shadowBlur = layer.shadowBlur;
    }
    manifestLayers.push(ml);
  }

  const manifest: Manifest = {
    version: CPE_VERSION,
    name: meta.name,
    createdAt: meta.createdAt,
    modifiedAt: Date.now(),
    canvas: graph.getCanvasSize(),
    background: meta.background,
    activeLayerId: graph.getActiveLayerId(),
    layers: manifestLayers,
  };
  zip.file("manifest.json", JSON.stringify(manifest, null, 2));
  const bytes = await zip.generateAsync({ type: "uint8array", compression: "DEFLATE" });
  return new Blob([bytes as unknown as BlobPart]);
}

/**
 * Load a project into the graph. `.atelier` v3 loads directly. `.cpe` v1/v2 is
 * converted in memory to one frame and one cel per layer. The file on disk is
 * not rewritten.
 */
export async function loadProject(file: Blob | ArrayBuffer | Uint8Array, graph: LayerGraph, codec: RasterCodec = browserCodec()): Promise<void> {
  const bytes = file instanceof Uint8Array
    ? file
    : new Uint8Array(file instanceof ArrayBuffer ? file : await file.arrayBuffer());
  const zip = await JSZip.loadAsync(bytes);
  const manifestFile = zip.file("manifest.json");
  if (!manifestFile) throw new Error("Invalid project: missing manifest.json");
  const raw = JSON.parse(await manifestFile.async("string")) as Manifest & { format?: string };
  if (raw.format === "atelier") {
    await loadAtelier(zip, raw as unknown as AtelierManifest, graph, codec);
    return;
  }
  if (raw.version > CPE_VERSION) {
    throw new Error(`This .cpe was made with a newer version (v${raw.version}).`);
  }
  const manifest = raw;

  const layers: Layer[] = [];
  for (const ml of manifest.layers) {
    const entry = zip.file(ml.dataFile);
    if (!entry) throw new Error(`Invalid .cpe: missing ${ml.dataFile}`);
    const source = await codec.decode(new Uint8Array(await entry.async("uint8array")));

    let mask: RasterSource | null = null;
    if (ml.maskFile) {
      const maskEntry = zip.file(ml.maskFile);
      if (maskEntry) mask = await codec.decode(new Uint8Array(await maskEntry.async("uint8array")));
    }

    const layer: Layer = {
      id: ml.id,
      name: ml.name,
      type: ml.type ?? "raster", // v1 files had no type
      transform: ml.transform,
      opacity: ml.opacity,
      blendMode: ml.blendMode,
      visible: ml.visible,
      locked: ml.locked ?? false,
      source,
      mask,
      maskEnabled: ml.maskEnabled,
      clip: ml.clip,
      parentId: ml.parentId ?? null,
      childIds: ml.childIds,
    };
    if (layer.type === "text") {
      layer.text = ml.text;
      layer.fontSize = ml.fontSize;
      layer.fontFamily = ml.fontFamily;
      layer.fillColor = ml.fillColor;
      layer.bold = ml.bold;
      layer.italic = ml.italic;
      layer.align = ml.align;
      layer.strokeColor = ml.strokeColor;
      layer.strokeWidth = ml.strokeWidth;
      layer.shadowColor = ml.shadowColor;
      layer.shadowBlur = ml.shadowBlur;
    }
    layers.push(layer);
  }

  const meta: DocumentMeta = {
    name: manifest.name,
    createdAt: manifest.createdAt,
    modifiedAt: manifest.modifiedAt,
    background: manifest.background,
  };
  graph.replaceWith(layers, manifest.canvas, meta);
  if (manifest.activeLayerId) graph.setActiveLayer(manifest.activeLayerId);
}

async function loadAtelier(
  zip: JSZip,
  manifest: AtelierManifest,
  graph: LayerGraph,
  codec: RasterCodec,
): Promise<void> {
  if (manifest.version > ATELIER_VERSION) {
    throw new Error(`This .atelier was made with a newer version (v${manifest.version}).`);
  }
  const cels: Cel[] = [];
  for (const cl of manifest.cels) {
    let source: RasterSource | null = null;
    if (cl.file && !cl.linkedTo) {
      const entry = zip.file(cl.file);
      if (!entry) throw new Error(`Invalid .atelier: missing ${cl.file}`);
      source = await codec.decode(new Uint8Array(await entry.async("uint8array")));
    }
    cels.push({
      layerId: cl.layerId,
      frameId: cl.frameId,
      source,
      offsetX: cl.offsetX,
      offsetY: cl.offsetY,
      opacity: cl.opacity,
      linkedTo: cl.linkedTo,
    });
  }

  const activeFrameId = manifest.activeFrameId || manifest.frames[0]?.id;
  const layers: Layer[] = [];
  for (const ml of manifest.layers) {
    const owned = cels.find((c) => c.layerId === ml.id && c.frameId === activeFrameId && !c.linkedTo);
    const linked = cels.find((c) => c.layerId === ml.id && c.frameId === activeFrameId);
    const resolved = linked?.linkedTo
      ? cels.find((c) => c.layerId === linked.linkedTo!.layerId && c.frameId === linked.linkedTo!.frameId)
      : owned;
    const source = resolved?.source ?? {
      width: 1,
      height: 1,
      bitmap: { kind: "pixels", data: new Uint8ClampedArray(4) },
    };
    let mask: RasterSource | null = null;
    if (ml.maskFile) {
      const maskEntry = zip.file(ml.maskFile);
      if (maskEntry) mask = await codec.decode(new Uint8Array(await maskEntry.async("uint8array")));
    }
    const layer: Layer = {
      id: ml.id,
      name: ml.name,
      type: ml.type ?? "raster",
      transform: ml.transform,
      opacity: ml.opacity,
      blendMode: ml.blendMode,
      visible: ml.visible,
      locked: ml.locked ?? false,
      source,
      mask,
      maskEnabled: ml.maskEnabled,
      clip: ml.clip,
      parentId: ml.parentId ?? null,
      childIds: ml.childIds,
    };
    if (layer.type === "text") {
      layer.text = ml.text;
      layer.fontSize = ml.fontSize;
      layer.fontFamily = ml.fontFamily;
      layer.fillColor = ml.fillColor;
      layer.bold = ml.bold;
      layer.italic = ml.italic;
      layer.align = ml.align;
      layer.strokeColor = ml.strokeColor;
      layer.strokeWidth = ml.strokeWidth;
      layer.shadowColor = ml.shadowColor;
      layer.shadowBlur = ml.shadowBlur;
    }
    layers.push(layer);
  }

  graph.replaceWith(layers, manifest.size, {
    name: manifest.name,
    createdAt: manifest.createdAt,
    modifiedAt: manifest.modifiedAt,
    background: manifest.background,
  }, {
    kind: manifest.kind,
    frames: manifest.frames,
    cels,
    activeFrameId,
    palette: manifest.palette ?? null,
    pixel: manifest.pixel ?? null,
  });
  if (manifest.activeLayerId) graph.setActiveLayer(manifest.activeLayerId);
}
