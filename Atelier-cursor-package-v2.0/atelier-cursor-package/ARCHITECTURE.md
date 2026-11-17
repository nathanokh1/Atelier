# ARCHITECTURE: Atelier

This extends the original CreativePhotoEditor architecture. Everything there still holds: framework-agnostic `core/`, PixiJS only in `core/render`, Commands for every mutation, Zustand mirrors the LayerGraph (never the other way round). New here: document model v3, the Pixel workspace, `.atelier` format v3, keymaps, and the export module.

## System overview

```
Next.js shell (Home, tabs, Library later)
   │
   ├─ Workspace: Photo  ──┐   tools, panels, keymap differ
   ├─ Workspace: Pixel  ──┤   the Document does not
   │                      ▼
Editor Core (framework-agnostic, core/)
   ToolManager ─► CommandBus ─► History
                      │
                      ▼
   LayerGraph (Document v3: layers × frames = cels, palette, sequences)
      │                     │
      ▼                     ▼
   Renderer (PixiJS)    File I/O (.atelier v3, legacy .cpe)
                            │
                            ▼
                        Export (core/export: export set → formats)   [Slice 2]
```

## Module boundaries

| Module | Owns | Notes |
|---|---|---|
| `core/layer-graph` | Document v3 data: layers, groups, frames, cels, palette, pixel settings, sequences | Pure data + methods. No rendering. |
| `core/commands` | Every mutation | New commands for frames, cels, palette, sequences. One Command per stroke. |
| `core/render` | PixiJS scene for the active frame | Nearest-neighbor + whole-step zoom for sprites; Pixel Grid and Grid overlays. Only module importing `pixi.js`. |
| `core/tools` | Tools and `ToolManager` | Pixel tools live in `core/tools/pixel/`. Tools emit Commands, never mutate. |
| `core/tools/keymaps.ts` | Per-workspace keymaps as plain data | Photo keymap = today's keys; Pixel keymap = Aseprite's. |
| `core/file-io` | Import, flat export, `.atelier` save/load, legacy `.cpe` load | Load of existing files is a safety-floor area. |
| `core/export` (Slice 2) | Builds the export set; formats write it | Formats: `swift`, `png-json`; later `unity`, `atlas`. Each format is a module with one entry point. |
| `state/` | Zustand mirrors: open tabs, active workspace, active tool, UI panels | Not a source of truth for document data. |
| `components/editor/pixel/` | Pixel workspace UI: tool rail, options bar, palette panel, preview, timeline | Match `mockups/`. |

## Document model v3 (sketch; refine in NOK-181)

Field names are a starting point. Keep the shape: pixel data moves from Layer to Cel.

```ts
type DocumentKind = "photo" | "sprite";

interface Frame { id: string; durationMs: number }            // photo docs: exactly one

interface Cel {
  layerId: string;
  frameId: string;
  source: RasterSource | null;       // null = empty cel
  offsetX: number; offsetY: number;  // cel position (sprites); photo keeps Layer transform
  opacity: number;                   // 0..1
  linkedTo?: { layerId: string; frameId: string };  // linked cel shares pixels
}

type LayerKind = "normal" | "background" | "group" | "text";  // tilemap, reference: later

interface Layer {
  id: string; name: string; kind: LayerKind;
  transform: Transform;              // photo behavior unchanged
  opacity: number; blendMode: BlendMode; visible: boolean; locked: boolean;
  mask?: RasterSource | null; maskEnabled?: boolean; clip?: boolean;  // photo
  childIds?: string[]; parentId?: string | null;
  text?: TextProps;                  // existing text fields
}

interface Palette {
  id: string; name: string;
  colors: string[];                                  // "#RRGGBBAA"
  ramps: { name: string; indexes: number[] }[];
  swaps?: { name: string; colors: string[] }[];      // Slice 2
}

interface PixelSettings {
  colorMode: "rgb";                  // "indexed" later
  paletteOnly: boolean;
  pixelGrid: boolean;
  grid: { width: number; height: number; offsetX: number; offsetY: number; visible: boolean };
}

// Slice 2 (NOK-193). Store now if cheap; UI later.
type Sequence =
  | { id: string; kind: "animation"; name: string; fromFrame: number; toFrame: number;
      loop: "forward" | "reverse" | "pingpong" }
  | { id: string; kind: "upgrade" | "state"; name: string;
      steps: { id: string; name: string; layerIds: string[]; parentStepId?: string }[] };

interface DocumentV3 {
  kind: DocumentKind;
  meta: DocumentMeta;                // existing
  size: CanvasSize;
  layers: Layer[];                   // order = paint order
  frames: Frame[];
  cels: Cel[];
  palette?: Palette;                 // sprites
  pixel?: PixelSettings;             // sprites
  sequences?: Sequence[];            // sprites, Slice 2
  library?: { projectId?: string; category?: string; labels?: string[] };  // Slice 2
}
```

Rules:
- A photo document is `{ kind: "photo", frames: [one], cels: one per raster layer }`. Every existing Photo code path must keep working; adapt through helpers rather than rewriting tools.
- Linked cels resolve to their target's `source` at read time. Editing a linked cel edits the shared pixels.
- Upgrade/State steps reference layers by id. Deleting a layer removes it from every step (one Command).

## `.atelier` file format v3

```
name.atelier (zip)
├── manifest.json
│   {
│     "format": "atelier",
│     "version": 3,
│     "kind": "photo" | "sprite",
│     "name": "...",
│     "size": { "width": 16, "height": 16 },
│     "layers": [ { "id", "name", "kind", "transform", "opacity", "blendMode",
│                   "visible", "locked", "parentId", "childIds", "mask", "clip", "text" } ],
│     "frames": [ { "id", "durationMs" } ],
│     "cels": [ { "layerId", "frameId", "file": "cels/{layerId}_{frameId}.png" | null,
│                 "offsetX", "offsetY", "opacity", "linkedTo" } ],
│     "palette": { ... },      // sprites
│     "pixel": { ... },        // sprites
│     "sequences": [ ... ],    // sprites, Slice 2
│     "library": { ... }       // Slice 2
│   }
└── cels/
    └── {layerId}_{frameId}.png  (sprites: PNG, lossless) / .webp (photo, as today)
```

- Loading: detect `.cpe` v1/v2 by manifest version and convert to v3 in memory (one frame, one cel per layer). Never rewrite a user's `.cpe` file on disk.
- Sprites use lossless PNG for cels. Photo keeps WebP.
- Autosave (IndexedDB) stores v3.

## Workspaces and keymaps

- Active workspace lives in `state/`. A sprite opens in Pixel; a photo opens in Photo. Switching is allowed both ways; tools that don't fit the document kind are disabled, not hidden.
- `core/tools/keymaps.ts` exports `photoKeymap` and `pixelKeymap` (data only). The shell binds the active one. Tooltips read the active keymap.

## Export (Slice 2, design now, build later)

```
export set = buildExportSet(project, sprites)   // sprite data, palette, manifest with fingerprints
format.write(exportSet, target)                 // target = linked folder or zip
```

- `atelier-manifest.json` per export: for each sprite, its name (`project/category/name`), size, fingerprint, layers, upgrades, states, animations, palette ref.
- Fingerprints drive the Library's "Changed since export" status.
- Swift format writes `Generated/Sprites.swift`, `Cels.swift`, `Palette.swift`, read by **AtelierKit** (separate repo).
- PNG + JSON writes frames as `sprite_tag_frame.png` plus JSON with durations and tags.
- Linked folders: File System Access API where available; otherwise a `.zip` with the same layout.

## Codebase sharing

Check `@nathanokh/codebase` first for: panel shells, color picker, modal/dialog, segmented control, toggles. Likely promotion candidates once proven here: Command/History pattern, palette panel, keymap binder.
