# SLICE 1 PLAN: Pixel workspace

Goal: draw a static sprite well, with Photo untouched. Work the cards in this order; each step builds on the one before. Card IDs are Linear (project Atelier).

Before starting: M0 is done (NOK-95 pushed, NOK-96 renamed). If not, stop.

---

## Step 1. NOK-181 Document model v3 (kickoff checkpoint)

**This is a material architecture change. Write a short design note first and wait for Nathan's OK before coding.**

The note covers:
- Final type definitions for Frame, Cel, Layer, Palette, PixelSettings, DocumentV3 (start from ARCHITECTURE.md).
- How existing Photo code reads pixels after the move from Layer to Cel (helper functions, not a rewrite).
- Which Commands change and which are new.
- How the Renderer picks the active frame.

Then build it. Slice 1 UI stays single-frame, but the model must support many.

Done when: types, LayerGraph and Commands support frames and cels; the Renderer draws the active frame; every case in docs/TEST-CASES.md still passes.

## Step 2. NOK-182 `.atelier` format v3

**Safety-floor area: stop and confirm before changing how existing files load.**

- Save writes `.atelier` v3 (see ARCHITECTURE.md). Sprites store cels as PNG.
- Load reads `.atelier` v3 and `.cpe` v1/v2 (converted in memory, never rewritten on disk).
- Autosave writes v3; existing autosaves still restore.

Done when: Photo and Sprite documents round-trip; an old `.cpe` from before this change opens identically.

## Step 3. NOK-184 Workspace switch + keymaps

- Photo/Pixel switch in the top bar (see `mockups/03-pixel-workspace.png`).
- `core/tools/keymaps.ts` with `photoKeymap` and `pixelKeymap` as data (DECISIONS.md §5).
- Tool rail, options bar and tooltips follow the active workspace.

Done when: switching swaps tools and shortcuts without changing the document.

## Step 4. NOK-183 Home + New + Sprite setup

- Home: "What are you making?" with Photo, Design, Sprite; Recent; Game Projects (static list until the Library). See `mockups/01-home.png`.
- Sprite setup dialog. See `mockups/02-new-sprite.png`. Project and Category fields can be stored now and wired to the Library in Slice 2.

Done when: Sprite opens a new sprite document in the Pixel workspace; Photo and Design open today's editor.

## Step 5. NOK-185 Pixel canvas

- Nearest-neighbor rendering and whole-step zoom (100%, 200%, ...) for sprites only.
- Pixel Grid (lines between pixels at high zoom) and Grid (cell size + offset) overlays.
- Status line: cursor x/y, size, color mode, frame (see mockup).

Done when: a 16×16 sprite at 1800% shows crisp square pixels and toggleable grids.

## Step 6. NOK-189 Palette panel

- Palette stored on the sprite document. FG/BG colors, swatch grid, add/remove/reorder into ramps, presets (DB16, DB32, PICO-8), Add from canvas, Palette only.
- Shape the data so palette swaps can be added in Slice 2 without a format change.

Done when: a sprite can be drawn entirely from its palette and the palette survives save/load.

## Step 7. NOK-186 Pixel drawing tools

Pencil, Eraser, Eyedropper, Paint Bucket, Line, Rectangle, Ellipse. Behavior and keys: TOOL-REFERENCE.md (Draw, Shapes & Fill). Integer pixel coordinates only. One Command per stroke.

Done when: each tool works at 1px on a 16×16 sprite with undo; Photo tools unchanged.

## Step 8. NOK-188 Inks and brush options

Brush size and shape, Pixel-perfect, Ink menu (Simple, Alpha Compositing, Lock Alpha, Shading), Symmetry with a movable axis, opacity. TOOL-REFERENCE.md (Brush & Ink).

## Step 9. NOK-187 Pixel selection and moving

Marquee, Elliptical Marquee, Lasso, Magic Wand (tolerance 0), Move (selection or whole cel, arrow nudge), Flip H/V, Rotate 90°/180°. Hard edges only. Reuse existing selection code where it fits.

## Step 10. NOK-190 Export Sprite PNG

1× plus 2×/4×/8× nearest-neighbor, transparent by default. Photo export unchanged.

## Step 11. NOK-191 Docs

Update docs/FEATURES.md, TAXONOMY.md, TOOL-REFERENCE.md statuses, PROJECT_BRAIN.md decisions log, and `memory/forge-changelog.md`. Queue a Dashboard edit (LINEAR.md) for tools whose status changed.

---

## Slice 1 exit check

From Home, create a 16×16 Sprite; draw with Pencil, Line, Bucket and Shading using a palette ramp; select and flip part of it; save as `.atelier`; reload the page and reopen it; export 1× and 8× PNGs; run every Photo test case. Record the result on each card and move the cards to In Review.
