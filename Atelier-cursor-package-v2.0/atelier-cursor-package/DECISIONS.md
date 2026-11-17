# DECISIONS: Atelier

Locked decisions. Don't reopen them in code; if something you're building conflicts with one, stop and flag it. Each links to its Linear card (team Portfolio, project Atelier).

## Naming (Nov 12, 2026)

- The app is **Atelier**. It has two **workspaces**: **Photo** (today's editor) and **Pixel**.
- A Pixel document is a **Sprite** (Aseprite's word). Product line name: **Atelier Pixel**.
- Pixel terms follow Aseprite exactly: Cel, Frame, Tag, Palette, Ink, Tileset, Tilemap, Slice, Onion Skin, Sprite Sheet, Pixel-perfect.
- The Library sorts with **Labels**, never "tags" (Tags are frame ranges).
- Don't use Level, Stage or Tier for Atelier concepts: Bap already uses them in gameplay.

## 1. Frames model: Aseprite's grid (NOK-99)

A Sprite has **Layers × Frames**. Each layer at each frame is a **Cel**: empty, normal, or linked (several frames share the same pixels). Pixel data lives on Cels, not Layers. A Photo document is a one-frame document and must behave exactly as it does today. The save format gets a new version; old `.cpe` files still open.

Rejected: frames as layers (multiplies layers and breaks upgrades), frames as separate files (no shared size, palette or tags).

## 2. Sequences: Animations, Upgrades, States (NOK-164)

A Sprite holds three kinds of sequence, shown as rows of slot cards in Sprite detail:

- **Animation**: frames over time. This is an Aseprite Tag: a named frame range with a loop direction (Forward, Reverse, Ping-pong).
- **Upgrade**: ordered steps that build on each other (Lv1 to Lv4).
- **State**: named looks that swap in, unordered (full, cracked, broken).

Every Upgrade or State step is a **saved list of visible layers**. That's how export knows what to write, and why every animation works at every upgrade without redrawing.

Slot actions:
- **Build on this**: adds a new empty layer; the new step = previous step's layers + the new one.
- **Duplicate**: copies the slot's pixels into a new layer group; the new step shows only that group (a full redraw that is still layer-based).
- **Branch from parent**: either of the above, starting from any earlier step.

Export writes every upgrade × state × frame. Size stays per Sprite for now; an optional size + anchor per step can be added to the manifest later without breaking older exports.

## 3. Export contract (NOK-163)

- **One way.** Art is edited only in Atelier. Games receive exports and never write art back.
- **One export set**, packaged per format: sprite data, palette, and `atelier-manifest.json` (per-sprite fingerprint, size, layers, upgrades, states, animations).
- **Build order:** (1) Swift code + AtelierKit, (2) PNG + JSON, (3) later: Unity importer script and Xcode `.atlas` folders, each only when a game needs it.
- **Source files** (`.atelier`) are also saved into the game repo under `Art/Source/`.
- **Linked folders:** write straight into the game folder in Chrome/Edge (File System Access API); other browsers download a `.zip` with the same layout. The desktop version (NOK-170) removes this limit later.
- **Names never change:** `project/category/name`; Tags are animation names; frames are `sprite_tag_frame`.
- **Connect a game** (NOK-165): per-Project setup with a required developer step. The game side adds a reader (AtelierKit for Swift) and an `atelier-handshake.json`. Until that file is found the Project shows Not connected; exports still work.
- **Palette** is chosen per Project: use the game's palette (import) or give the game Atelier's (written into the export). Palette swaps (runtime recolors) export only the extra palettes.

## 4. File extension: `.atelier` (NOK-97)

One format for Photo documents and Sprites. New saves use `.atelier`. `.cpe` v1 and v2 files open forever. Ships with the format version bump from decision 1.

## 5. Shortcuts: per workspace (NOK-98)

Pixel uses Aseprite's keymap. Photo keeps its current keys. Keys both already agree on stay shared: V Move, H Hand, M Marquee, W Magic Wand, E Eraser, and Ctrl/Cmd commands. Tooltips and the Tool Reference show the active workspace's key. Customizable shortcuts come later (NOK-180).

| Key | Photo | Pixel (Aseprite) |
|---|---|---|
| B | Brush | Pencil |
| P | Pencil | (none) |
| L | Lasso | Line |
| Q | (none) | Lasso |
| C | Crop | (none) |
| U | (none) | Rectangle (Shift+U Ellipse) |
| G | (none) | Paint Bucket |
| I | Eyedropper | Eyedropper |
| Z | (none) | Zoom |

## Also decided

- A **desktop version** is wanted (NOK-170). Wrapper (Tauri or Electron) is chosen when that work starts.
- **Bap** is the first connected game: SpriteKit draws the playfield, SwiftUI everything around it, BapEngine runs the rules, and its sprites are currently pixel grids and color ramps in code. **CastledMe** is Unity and uses PNG + JSON.
