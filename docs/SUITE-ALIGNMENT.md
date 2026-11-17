# Creative Suite — Alignment Brief for Claude

> **2026-11-17:** App 1 is **Atelier**. Design docs live in `atelier-cursor-package/`. The rest of this brief is the July 2026 handoff and still uses the old name.

> **Purpose:** Hand this document to Claude (Claude app / Claude.ai) so a new chat starts aligned on what we already built, what the suite should become, and how we want to approach platforms.  
> **Author:** Nathan (Approver) + Cursor agents on CreativePhotoEditor  
> **Date:** 2026-07-20  
> **Repo (app 1):** https://github.com/nathanokh1/CreativePhotoEditor  
> **Live:** https://creativephotoeditor.vercel.app

---

## 1. Who I am / how I work

- I am the **Approver**. Agents (Cursor / Claude) build with autonomy and escalate only on kickoff, material scope change, real direction forks, or safety-floor actions (deploy, spend, delete data, secrets).
- Prefer **KISS**, small reviewable steps, and reuse over rebuild.
- Stack fluency: **Next.js + TypeScript + Tailwind**, GitHub, Vercel. Desktop wraps later via **Tauri** (not a second full rewrite).
- Shared library intent: `@nathanokh/codebase` (GitHub Packages) for reusable pieces across apps.

---

## 2. What we already built (App 1 — “Photoshop-like”)

**Product name:** CreativePhotoEditor  
**Positioning:** Free, browser-first, streamlined photo *editor* (layers / composite / paint / export). Not a full Adobe clone. Goal: the 20% of pro editing that covers ~80% of real tasks — import, layers, move/transform, selections, paint/retouch, export, save project.

### Stack (do not reinvent without a strong reason)

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) + TypeScript strict |
| Render | PixiJS (WebGL) — **only** inside `core/render` |
| Scene model | Custom `LayerGraph` (source of truth) |
| Mutations | Commands + History (undo/redo mandatory; UI never mutates the graph directly) |
| UI state | Zustand mirrors the graph |
| Styling | Tailwind |
| Project file | `.cpe` = ZIP (`manifest.json` + layer/mask WebP) |
| Deploy | Vercel (`main` → Production) |

### Architecture principles that must survive the suite

1. **`core/` is framework-agnostic** — no React/Next imports in core. This is what makes a future Tauri (or mobile) wrap possible without rewriting the editor.
2. **LayerGraph is the source of truth**; React/Zustand is a mirror.
3. **Every mutation goes through a Command** — undo is not optional.
4. **Pixi stays quarantined** in `core/render` so the engine can be swapped later if needed.

### Capability snapshot (as of 2026-07-19)

Shipped and usable:

- Documents / multi-tab, autosave + session restore (IndexedDB)
- Layers: add/remove/reorder/group/lock/visibility (group eye/lock cascades), masks + clipping masks
- Tools: Move, Transform, Hand, Brush/Pencil/Eraser (custom tips), Clone, Heal, Pen (bezier), Crop, selections (rect, lasso, magic wand), feather/invert
- Adjustments + filters + **one-click auto-enhance**; **live GPU adjustment preview**
- Export flatten + batch per-layer zip; transparent/solid background; trim-to-content
- History panel (jump any point in session history)
- Rulers + snap-to-edges/center
- PWA / offline app shell
- Free on-device ML: **background removal** + **select subject** (CDN-loaded model; needs network on first use)

Deliberately deferred (still open):

- True **non-destructive adjustment layers** (architectural lift in the renderer)
- **ML smart slicer** (stretch beyond current region detection)
- Cloud / paid generative AI
- Native Windows/mac wrappers (planned Phase 4+, not started)

Full living catalog: `docs/FEATURES.md` in the CreativePhotoEditor repo.

### What App 1 is *not*

- Not RAW / catalog / Develop-module (that’s App 2 territory)
- Not a video timeline (App 3)
- Not accounts/cloud sync yet
- Not “Adobe parity”

---

## 3. The suite vision (what I want next)

I want a **related family of creative apps**, not one mega-app:

| App | Analogy | Job to be done |
|---|---|---|
| **1. CreativePhotoEditor** (exists) | Photoshop-like | Pixel/composite editing: layers, paint, masks, retouch, export |
| **2. Next** | Lightroom-like | Library + Develop: import/organize photos, non-destructive tonal edits, presets, batch, export/publish |
| **3. Later** | Premiere-like (simpler) | Video: timeline, cuts, basic color, titles, export |

### How they should feel as a suite

- **Same brand / visual language** (shared shell: top bar, panels, dark editor chrome, settings patterns).
- **Same mental model where it fits:** documents/projects, history/commands, export vs save, on-device privacy by default.
- **Shared format bridges** where useful (e.g. Lightroom-like “edit” → send raster/layer stack into the Photoshop-like editor; video stills ↔ photo tools). Don’t force one file format for everything on day one.
- **Free + private by default** for core editing; paid cloud AI only as an unlock later if needed.
- **Not** cloning Adobe’s entire product matrix. Stay ruthless about the 80/20.

### Naming (open — Claude: propose options, don’t rename without Approver OK)

Working nicknames only:

- Suite umbrella: e.g. “Creative Suite” / brand TBD  
- App 1: CreativePhotoEditor (keep until rebrand)  
- App 2 / 3: TBD

---

## 4. Platform recommendation (read carefully)

### Short answer

**Do not rebuild these as pure Windows-native apps (WinUI / WPF / C++).**  
**Do** plan them as **web-core engines wrapped as desktop apps (Tauri)** when filesystem, performance, or installability demand it — especially for App 2 (library of thousands of photos) and App 3 (video decode/export).

App 1 can stay **browser + PWA first** (already live) and get a **Windows Tauri wrap as Phase 4** without rewriting.

### Why not “Windows-only native” for the suite

| If we go pure Windows native… | Cost |
|---|---|
| Rewrite core in another stack | Throw away working LayerGraph / Command / Pixi investment |
| Lose shared code across Photo / Lightroom / Video | Three codebases, three bug surfaces |
| Mac / web later becomes a rewrite again | Suite strategy collapses |
| Agent velocity drops | Cursor + Claude are strongest on TS/web |

### Why Tauri (or similar) over Electron for desktop wraps

- Smaller installs, Rust shell, strong filesystem + native menus.
- Same HTML/TS UI and same `core/` logic as the browser build.
- Matches the decision already logged in `PROJECT_BRAIN.md` for CreativePhotoEditor.

### Recommended platform sequence for the suite

```
App 1 (Photo editor)     Browser MVP ✅ → polish → Tauri Windows wrap
App 2 (Library/Develop)  Design core as desktop-first UX, but implement
                         with shared TS core + Tauri from earlier
                         (filesystem watchers, catalogs, large libraries)
App 3 (Video)            Same pattern; may need native decode/encode
                         plugins sooner — still wrap a shared UI core
```

### When Windows-first *is* right

Push for desktop wrap **earlier** (still Tauri, not a rewrite) when:

- Users need **real filesystem folders** and watchers (Lightroom-like library)
- **Multi-GB catalogs** / caches don’t fit cleanly in browser storage
- **Video decode/export** needs native codecs or FFmpeg sidecar
- Users expect **installable Start Menu app**, drag-to-Explorer, OS file associations

That is an **earlier wrap**, not a **different architecture**.

### Claude: please treat this as a standing decision unless Approver reopens it

> **Standing decision:** Browser-capable TypeScript cores + optional Tauri shells.  
> **Not:** Separate pure-Windows rewrites per app.

---

## 5. What to reuse from App 1 into App 2 / App 3

**Promote / extract (candidates for `@nathanokh/codebase` or a new `creative-suite` shared package):**

- Command bus + History patterns  
- Panel / toolbar / dialog / settings UI primitives  
- Export helpers, color/adjustment math (where non-Pixi)  
- Brand tokens, typography, panel chrome  
- Autosave / IndexedDB session patterns (adapt for desktop FS)

**Do not blindly reuse:**

- Pixi LayerGraph compositing for a Lightroom Develop module (different data model: catalog + non-destructive recipe per photo)  
- Timeline/video needs a different core (frames, tracks, codecs)

**App 2 sketch (Lightroom-like) — conceptual only**

- Catalog DB (SQLite via Tauri) of photos + ratings + keywords  
- Non-destructive Develop recipe (exposure, WB, tone curve, HSL…) stored as data, applied on export  
- Library grid + filmstrip + Develop panel  
- Bridge: “Edit in CreativePhotoEditor” → bake or send raster / open as layers

**App 3 sketch (video) — conceptual only**

- Timeline + clips + simple cuts  
- Preview player + export (FFmpeg sidecar likely)  
- Bridge: grab still → App 1; color stills → App 2 recipes where possible

---

## 6. What I want from Claude in the Claude app

When I paste this brief, please:

1. **Confirm understanding** in 5–10 bullets (what exists, suite shape, platform decision).
2. **Propose a suite architecture** (repos vs monorepo, shared package layout, naming options) with tradeoffs — then stop for Approver direction if it forks.
3. **Draft a Phase 0 plan for App 2 (Lightroom-like)** only: goals, non-goals, data model sketch, Tauri vs browser-first call for that app specifically.
4. **Do not** start rewriting CreativePhotoEditor as native Windows.
5. **Do not** expand into accounts/cloud/paid AI unless I ask.
6. Ask me clarifying questions only if they block a direction decision (e.g. monorepo vs multi-repo, brand name, App 2 scope).

---

## 7. Open questions for Approver (Claude: surface these, don’t assume)

1. Suite brand name?  
2. Monorepo (`creative-suite/`) vs separate repos per app + shared package?  
3. App 2 first feature cut: library-only MVP, or Develop module in v1?  
4. How soon do we need a Windows installer for App 1 vs jump straight into App 2 desktop?  
5. Any hard requirement for offline-only / no CDN for ML in production?

---

## 8. Key files to read if Claude has repo access

| Path | Why |
|---|---|
| `CreativePhotoEditor-cursor-package/PROJECT_BRAIN.md` | Product intent + platform sequence |
| `CreativePhotoEditor-cursor-package/ARCHITECTURE.md` | Core layering |
| `CreativePhotoEditor-cursor-package/ROADMAP.md` | Phase gates (Phase 4 = Windows wrap) |
| `CreativePhotoEditor-cursor-package/TAXONOMY.md` | Shared terms (Document, Layer, Export vs Save…) |
| `docs/FEATURES.md` | Living shipped/planned catalog |
| `core/` | Engine — framework-agnostic |
| `state/editor-store.ts` | Multi-doc tabs + autosave wiring |

If Claude **does not** have repo access, this brief alone should be enough to plan App 2 / suite architecture at a product + systems level.

---

## 9. One-paragraph summary (pasteable)

We’ve built CreativePhotoEditor: a free, browser-first, Photoshop-like layered photo editor (Next.js + PixiJS + LayerGraph + Commands), live on Vercel, with tabs, autosave, masks, paint/retouch, selections, PWA, and free on-device ML for background removal. Next I want a **suite**: this app, then a Lightroom-like library/Develop app, then a simpler video editor — shared brand and shared TypeScript cores, **not** three Adobe clones. Platform strategy: keep web-capable cores and wrap with **Tauri for Windows** when filesystem/performance need it; do **not** rewrite as pure WinUI/WPF apps. Help me align on suite architecture and a Phase 0 plan for the Lightroom-like app.
