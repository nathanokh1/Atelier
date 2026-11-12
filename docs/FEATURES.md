# CreativePhotoEditor — Feature List

A living catalog of what we're building, from basics to advanced. This is the
menu we pick from each cycle. It complements (does not replace) the phase gates
in `CreativePhotoEditor-cursor-package/ROADMAP.md`.

**Status legend:** ✅ shipped · 🔜 next up · 📋 planned · 🧪 experimental/later · ⛔ out of scope (for now)

---

## Recently shipped — 2026-07-19

Latest build cycle (editor polish + Phase-3 platform + free AI track). All items
below are ✅ and reflected in the tables that follow:

- **One-click auto-enhance** — heuristic per-channel auto-levels + white balance + gentle saturation (Adjust & Filters panel).
- **History panel** — clock icon in the top bar; lists every command and lets you jump to any point (bulk undo/redo).
- **Rulers + snapping** — pixel rulers (top/left) + snap layer edges/center to canvas edges/center while moving (Alt bypasses). Toggles in Settings.
- **Custom brush tips** — Round / Spray / Chalk built-ins + import any PNG as a brush tip.
- **Live GPU adjustment preview** — adjustment sliders preview instantly on the GPU (Pixi ColorMatrixFilter); baked non-destructively on Apply.
- **Large-image handling** — downsample-on-import to ≤4096px (high-quality).
- **PWA / offline** — web manifest + app icon + service worker; installable, app shell works offline after first load.
- **Background removal** and **Select subject** — on-device, free, in-browser ML (Smart tools panel).

Deferred this cycle (see notes in the tables): non-destructive adjustment
**layers** (architectural lift; live GPU preview covers the near-term need) and
the **ML smart slicer** (stretch).

> ⚠️ ML note: background-removal / select-subject load the model library from a
> CDN at runtime (onnxruntime-web can't be bundled by `next build`), so those two
> features need a network connection on first use. Everything else works offline.

---

## 1. Basic features (core editor)

### Documents & canvas
| Feature | Status | Notes |
|---|---|---|
| Create a Document (canvas) | ✅ | Default 1280×720; source of truth is the LayerGraph |
| Fit canvas to first import | ✅ | On by default; toggle in Settings |
| Fit canvas to active layer | ✅ | Transform options bar + Settings |
| Custom canvas size / presets (1:1, 16:9, A4…) | ✅ | New document dialog (File+) |
| Canvas background (transparent / color) | ✅ | Transparent checkerboard or solid color |
| Pan / zoom / fit-to-view | ✅ | Wheel zoom, Hand tool, Fit button |

### Import & layers
| Feature | Status | Notes |
|---|---|---|
| Import image (file picker) | ✅ | PNG/JPG/WebP/GIF/BMP |
| Drag & drop import onto canvas | ✅ | |
| Add / remove layers | ✅ | Import adds; delete removes; empty layer button |
| Layers panel (list, select, active highlight) | ✅ | Ctrl/Cmd+click multi-select |
| Show/hide layer | ✅ | |
| Rename layer | ✅ | Double-click |
| Delete layer | ✅ | |
| Opacity per layer | ✅ | Live slider |
| Blend modes | ✅ | Full set (normal → exclusion) |
| Reorder layers | ✅ | Drag-and-drop |
| Drag-to-reorder layers | ✅ | Drag rows in the Layers panel |
| Layer thumbnails | ✅ | Small preview per row |
| Lock layer | ✅ | Lock icon on each row |
| Duplicate layer | ✅ | Layers panel toolbar |
| Group layers | ✅ | Folder groups; Ctrl+click then Group |

### Tools
| Feature | Status | Notes |
|---|---|---|
| Move tool (drag layers, Shift = axis lock) | ✅ | |
| Transform — corner + edge handles | ✅ | 8 handles; aspect lock / free transform |
| Transform — rotation handle | ✅ | Circle above the box |
| Hand (pan) tool | ✅ | |
| Brush (paint) tool | ✅ | Brush engine: size/color/opacity/hardness/flow/spacing + presets |
| Pencil tool | ✅ | Hard stroke |
| Eraser tool | ✅ | Soft/hard via hardness |
| Clone stamp | ✅ | Alt/Option-click source, drag to clone (K); on-canvas anchor + source ring + brush ring |
| Cleanup / Heal (magic eraser) | ✅ | Brush over blemish/object → exemplar/patch-based content-aware fill (J), brush-size ring |
| Auto-Layers / Slice | ✅ | Region detection (erosion + gutter-split to separate touching cells) or even grid → per-region layers; the piano-cards use case |
| Selection — rectangle | ✅ | Marquee; feeds Cut/Copy |
| Selection — lasso (freeform) | ✅ | Real pixel selection (scanline polygon fill); Shift add / Alt subtract |
| Magic wand / select-by-color | ✅ | Click to select by color (W); Shift add / Alt subtract; contiguous or whole-image |
| Feather / invert / all / deselect / fill selection | ✅ | Mask honored by Copy/Cut/Delete/Fill; Ctrl+A/D, Ctrl+Shift+I |
| Pen tool (vector bezier path) | ✅ | Click anchors, drag for curves, close/Enter (N); Rasterize (stroke/fill → layer) or To selection |
| Crop (document-level) | ✅ | Drag rect → crop canvas + shift layers |

### Editing operations
| Feature | Status | Notes |
|---|---|---|
| Undo / redo (full history) | ✅ | Every mutation is a Command |
| Cut / Copy / Paste (internal Clipboard) | ✅ | Layer-level or selection crop; cut clears pixels |
| Paste image from OS clipboard | ✅ | Ctrl+V prefers system image, else internal |
| Nudge with arrow keys | ✅ | Arrows 1px; Shift+arrows 10px |
| Adjustments: exposure/brightness/contrast/saturation/hue/temperature/tint/levels/gamma | ✅ | Adjust & Filters panel (per-layer, destructive) |
| Filters: B&W / sepia / invert / blur / sharpen / vignette | ✅ | One-click, per-layer |

### Output
| Feature | Status | Notes |
|---|---|---|
| Export flattened PNG / JPG / WebP | ✅ | |
| Save `.cpe` project (zip: manifest + WebP layers) | ✅ | Reopenable |
| Open `.cpe` project | ✅ | |
| Export scale / quality options | ✅ | 0.5×–3×; JPG/WebP quality slider |
| Batch export — each layer as its own file (.zip) | ✅ | PNG/WebP, layer positioned on doc-sized canvas |

### UX & polish
| Feature | Status | Notes |
|---|---|---|
| Modern dark UI, hover effects | ✅ | |
| Toggleable info tooltips (+ delay) | ✅ | Settings |
| Keyboard shortcuts (V/T/H/M/L/W/C/B/P/E/N/K/J, Ctrl+Z/Y/S/V/A/D, arrows, +/-/0) | ✅ | N = pen |
| Landing page | ✅ | |
| Onboarding / first-run hints | ✅ | Dismissible quick-start card |
| Empty-state guidance | ✅ | "Drop an image to start" |

---

## 2. Advanced features

| Feature | Status | Notes |
|---|---|---|
| Text layers | ✅ | Rasterized; edit via Text options bar |
| Text types (fonts, bold/italic, align, outline, shadow) | ✅ | Font family, weight/style, L/C/R align, outline color+width, drop shadow color+blur |
| Vector/shape layers | ✅ | Rect / ellipse as raster shapes |
| Non-destructive adjustment layers | 🧪 | Deferred — architectural lift (composite-below in the sprite renderer). Live GPU adjustment preview covers the common need for now |
| Filters (blur, sharpen, etc.) | ✅ | CPU filters shipped + live GPU adjustment preview via Pixi ColorMatrixFilter (non-destructive until Apply) |
| Masks (layer + clipping) | ✅ | Non-destructive layer mask (paint to reveal/hide, from selection, enable/apply/delete) + clip-to-below |
| More blend modes | ✅ | Expanded set shipped |
| Large-image handling (tiling/downsample) | ✅ | Downsample-on-import to ≤4096px (high-quality) so huge photos don't blow WebGL/CPU limits |
| History persistence within a session | ✅ | History panel (clock icon) lists every command; click any point to jump (bulk undo/redo) |
| PWA / offline support | ✅ | Web manifest + service worker (runtime cache) + installable; app shell works offline after first load |
| Custom brushes / painting | ✅ | Presets + brush tips (Round/Spray/Chalk) + import any PNG as a brush tip |
| Guides, rulers, snapping | ✅ | Grid guides + pixel rulers (top/left) + snap-to-edge/center while moving (Alt bypasses) |
| Multiple documents / tabs | ✅ | Tab bar; each doc its own engine, one shared renderer |
| Autosave + session restore | ✅ | Debounced autosave to IndexedDB; reopens tabs on reload |
| Group eye/lock cascade to children | ✅ | Hiding/locking a group cascades to its layers |

---

## 3. Platform roadmap

| Target | Status | Notes |
|---|---|---|
| Web app (browser) | ✅ MVP live | The product for v1 |
| Windows desktop (Tauri wrap) | 📋 | Phase 4 — after web is solid |
| macOS desktop | 🧪 | Phase 5 |
| iOS / Android | 🧪 | Phase 5 — wrap the browser core |

---

## 4. AI features (separate track)

The free, on-device tier is now live. Cloud (paid) AI remains on the roadmap.

Two tiers by cost:
- **In-browser ML (FREE, on-device)** — open models via WASM/WebGPU. No API/per-use cost; only a one-time model download (cached) + the user's own CPU/GPU. Images never leave the device. **Shipped:** background removal + select subject (@imgly/background-removal, ONNX+WASM, loaded from CDN at runtime).
- **Cloud AI (PAID, roadmap)** — needs a backend + GPU + per-call billing + a credits/unlock system. Deferred.

| Feature | Status | Tier | Notes |
|---|---|---|---|
| Background removal | ✅ | In-browser ML | @imgly/background-removal (ONNX+WASM), on-device, free; Smart tools panel |
| Smart selection ("select subject") | ✅ | In-browser ML | Same model → subject alpha becomes a pixel selection mask |
| Auto-adjust (one-click enhance) | ✅ | Non-AI | Heuristic per-channel auto-levels + white balance + gentle saturation (Adjust panel) |
| Smart slicer (ML region detect) | 🧪 | In-browser ML | Improve auto-layers beyond the deterministic ~60% on arbitrary images |
| AI analytical tools (analyze + suggest improvements) | 📋 | Cloud AI (paid) | Roadmap — Approver decision: paid → later |
| Generative fill / inpainting | 📋 | Cloud AI (paid) | Backend + infra |
| Upscaling / enhance | 📋 | Cloud AI (paid) | Backend + infra |

> In-browser ML keeps the app 100% client-side and free. A backend + Vercel AI
> SDK only come into play for the paid cloud-AI track.

---

## 5. Accounts / cloud (future)

| Feature | Status | Notes |
|---|---|---|
| User accounts / auth | ⛔ (not yet) | Needs backend |
| Cloud project storage & sync | ⛔ (not yet) | |
| Sharing / collaboration | ⛔ (not yet) | |

---

_How to use this doc: pick items, move them to 🔜, then into a build cycle. When
shipped, mark ✅ and log it in `memory/forge-changelog.md`. Keep it current._
