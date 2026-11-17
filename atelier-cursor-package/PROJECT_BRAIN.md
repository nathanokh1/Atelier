# PROJECT_BRAIN: Atelier

> Living memory document. Cursor agents read this at session start (via CURSOR_PROJECT_PROMPT.md). Keep it current as decisions land; a stale brain doc is worse than none.

---

## 1. What this is

**Atelier** (formerly CreativePhotoEditor, also called Pixresso at one point) is a free, browser-first art studio. One engine, two workspaces:

- **Photo**: the layered photo editor that already exists (layers, masks, selections, pen, text, retouch, adjustments, on-device background removal, multi-tab autosave, history).
- **Pixel**: an Aseprite-style workspace for game art. Sprites, frames and cels, palettes, inks, animations, upgrades and states, a Library organized by game, and exports that game projects (Swift, Unity, any engine) can consume.

Atelier owns the art for Nathan's games (first: **Bap**, iOS; then **CastledMe**, Unity), but it is built to work with any game.

**Not building (for now):** editable vector/Illustrator documents, RAW, CMYK/print, plugins, 3D, video timelines, accounts, charging users, diffusion image APIs. Generative help is limited to the optional **Draft** feature (Slice 3), billed to the user's own API key.

## 2. Platform sequence

1. **Browser**: the product today, on Vercel.
2. **Desktop (wanted, NOK-170)**: wrap the same browser core so linked game folders work everywhere and folder watching is possible. Tauri or Electron, decided when it starts.
3. **Mobile**: not scoped.

This is why `core/` stays framework-agnostic.

## 3. Decisions log

| Date | Decision | Why |
|---|---|---|
| 2026-07-17 | Rendering: PixiJS (WebGL) + custom LayerGraph | GPU-bound editing; keep layer ergonomics without a 2D-canvas ceiling. |
| 2026-07-17 | Browser-first; desktop deferred | Prove the editor before packaging. |
| 2026-07-17 | Standalone repo, bidirectional with `@nathanokh/codebase` | Reuse shared UI; promote proven pieces back. |
| 2026-07-17 | Project file: zip container, manifest + per-layer WebP | Portable, inspectable, no custom binary parser. |
| 2026-07-17 | Next.js 14 + TypeScript | Matches the rest of the portfolio. |
| 2026-11-12 | Rename to **Atelier**; Pixel workspace stays in this app | A sprite is a small raster document; the engine already works. Split apps only if the data model changes (photo catalog, video). |
| 2026-11-12 | Pixel terminology follows Aseprite | Familiar to pixel artists; no invented synonyms. |
| 2026-11-12 | Linear (team Portfolio, project Atelier) is the work tracker | One board for planning, dashboard and Cursor. |
| 2026-11-16 | Frames model: Layers × Frames = Cels (NOK-99) | See DECISIONS.md §1. |
| 2026-11-16 | Sequences: Animation, Upgrade, State as layer lists (NOK-164) | See DECISIONS.md §2. |
| 2026-11-16 | One-way export contract; Swift + AtelierKit first (NOK-163) | See DECISIONS.md §3. |
| 2026-11-16 | `.atelier` file extension (NOK-97) | See DECISIONS.md §4. |
| 2026-11-16 | Per-workspace shortcuts, Aseprite keys in Pixel (NOK-98) | See DECISIONS.md §5. |
| 2026-11-16 | Desktop version wanted (NOK-170) | Linked folders in every browser/OS; folder watching. |

## 4. Principles

- **KISS.** The simplest thing that meets the card's "Done when".
- **Architecture before code.** This package exists so Cursor isn't guessing.
- **Photo never regresses.** Pixel work must not change Photo behavior; run TEST-CASES.md after core changes.
- **Commands for every mutation.** Undo/redo always works.
- **Check `@nathanokh/codebase` first**, and flag promotion candidates (label `Promote` in Linear).
- **Approval-by-exception** (kickoff, material change, direction decision, safety floor). Anything touching load of existing user files is a safety-floor stop.
- **Living docs.** Update this file, DECISIONS.md, TAXONOMY.md, TOOL-REFERENCE.md and docs/FEATURES.md as work lands.

## 5. Where things are

- Design references: `mockups/` (PNG + HTML source), the Design canvas (https://claude.ai/artifact/1yWMNyan2PXoc3t4SuU1Fh), the Whiteboard flows (https://claude.ai/artifact/RPomfP5TdQepmiZXmrzKvv).
- Tracking: Linear project Atelier; dashboard "Atelier Mission Control" (https://claude.ai/artifact/Wi6rSdhjtMPTz1qKsTDTgC). See LINEAR.md.
- Tool behavior: TOOL-REFERENCE.md.

## 6. Open questions (don't block on these)

- Draft quality: models are rough at drawing coherent sprites as pixel grids. Treat Draft as a starting sketch; Haiku is likely only useful at 16×16.
- Indexed color mode: Slice 1 ships RGB + "Palette only". Revisit Indexed if Bap's palette-ramp workflow needs it sooner.
- Desktop wrapper choice (Tauri vs Electron) and whether Darkroom's Electron shell can be shared.
- AtelierKit lives in its own repo (proposed `nathanokh1/AtelierKit`); confirm before creating it.
