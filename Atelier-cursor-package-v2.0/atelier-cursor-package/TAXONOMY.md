# TAXONOMY: Atelier

Canonical terms. Use them exactly in code, docs and UI copy. If a new concept needs a name, add it here first. Pixel terms follow Aseprite; where Aseprite has no term, the Atelier term is marked.

## App and documents

| Term | Definition |
|---|---|
| **Atelier** | The app. One engine, two workspaces. |
| **Workspace** | A set of tools, panels and shortcuts for one kind of work: **Photo** or **Pixel**. Switching workspace never changes the document's data. |
| **Document** | Anything open in a tab. Has a kind: `photo` or `sprite`. Source of truth is the LayerGraph. |
| **Canvas** | The rendered composite area the user sees and edits. In Photo it is smooth; in Pixel it is nearest-neighbor with whole-step zoom. |
| **Sprite** | A Document of kind `sprite`, edited in the Pixel workspace: size, color mode, Palette, Layers, Frames, Cels, Sequences. |
| **Project File (`.atelier`)** | The saved, reopenable Document: zip with `manifest.json` + cel images. Legacy `.cpe` files still open. |
| **Save** | Writes the Document to an `.atelier` file. Reopenable. |
| **Export** | One-way output (PNG/JPEG/WebP, or a game export). Not reopenable as a Document. |
| **Import** | Brings an external image in as a new Layer. |

## Structure

| Term | Definition |
|---|---|
| **LayerGraph** | Our scene-graph abstraction. Owns layers, groups, frames, cels and their order. |
| **Layer** | A row in the stack. Kinds: Normal, Background (Pixel only, opaque, bottom), Group, Tilemap (later), Reference (later, never exported). Has name, visibility, lock, opacity, blend mode. |
| **Group** | A Layer that holds other Layers; visibility and lock cascade. |
| **Frame** | One point in time, with a duration in ms. Photo documents have exactly one. |
| **Cel** | One Layer at one Frame: the actual pixels at that spot. Can be empty, normal, or **Linked** (shares pixels with another Cel). |
| **Active Layer / Active Frame / Active Cel** | What edit operations target. "Selecting a layer" means setting the Active Layer; don't call it a Selection. |
| **Selection** | A pixel region that limits where edits apply. In Pixel it is always hard-edged. |

## Sequences (Atelier terms unless noted)

| Term | Definition |
|---|---|
| **Sequence** | (Atelier) A named row of slots in a Sprite: an Animation, an Upgrade or a State. |
| **Tag / Animation** | (Aseprite: Tag) A named Frame range with a loop direction: Forward, Reverse, Ping-pong. One per animation (idle, walk). |
| **Upgrade** | (Atelier) Ordered steps that build on each other (Lv1 to Lv4). Each step is a saved list of visible layers. |
| **State** | (Atelier) Named, unordered looks that swap in (full, cracked, broken). Each is a saved list of visible layers. |
| **Step / Slot** | (Atelier) One entry in a Sequence, shown as a card in Sprite detail. |
| **Build on this / Duplicate / Branch from parent** | (Atelier) Slot actions. See DECISIONS.md §2. |

## Color and drawing

| Term | Definition |
|---|---|
| **Palette** | The ordered list of colors a Sprite (or Project) uses. |
| **Ramp** | (Atelier) An ordered run of Palette colors, dark to light, used by the Shading ink. |
| **Palette swap** | (Atelier) An alternate palette applied to the same pixels (recolors). |
| **Palette only** | (Atelier) Lock that blocks painting with colors outside the Palette. |
| **Color Mode** | RGB, Indexed (later), Grayscale (later). |
| **Foreground / Background color** | The two active colors: left click paints foreground, right click background. |
| **Ink** | How a tool applies color: Simple, Alpha Compositing, Lock Alpha, Shading, Copy Alpha+Color (later). |
| **Pixel-perfect** | Stroke cleanup that removes doubled corner pixels. |
| **Symmetry** | Mirrors strokes across a vertical and/or horizontal axis. |
| **Tool** | The active click/drag behavior. Exactly one at a time. Tools differ per workspace (see TOOL-REFERENCE.md). |
| **Keymap** | (Atelier) A workspace's keyboard shortcuts. Photo: current keys. Pixel: Aseprite's. |

## History

| Term | Definition |
|---|---|
| **Command** | An undoable unit of work with `execute()` / `undo()`. Every mutation goes through one. |
| **History Stack** | Executed Commands for undo/redo. Per document, in memory. |
| **Clipboard** | Internal cut/copy/paste buffer, bridged to the OS clipboard for images. |

## Library and games (Atelier terms)

| Term | Definition |
|---|---|
| **Library** | Every Sprite the user has, organized by Project, Category and Label. |
| **Project** | One game's Sprites. Holds the shared Palette, base size, output format and linked folder. Not to be confused with the Project File. |
| **Category** | Character, Tile, Item, UI or Effect. |
| **Label** | Free-form sorting word in the Library. Never called a "tag". |
| **Variant** | A linked copy of a Sprite (same size and palette) for recolors or alternates. |
| **Status** | Draft, Ready, Exported, Changed since export. |
| **Export set** | The sprite data + palette + `atelier-manifest.json` that every format packages. |
| **Output format** | How an export set is packaged: Swift code, PNG + JSON, later Unity and `.atlas`. |
| **Linked folder** | The folder in a game repo that exports are written to. |
| **Connect a game** | Per-Project setup ending in the required **Developer step**. |
| **Handshake** | `atelier-handshake.json`, written by the game side, proving the game reads Atelier's exports. |
| **AtelierKit** | Small Swift package that turns Atelier's palette-index data into textures and images. |
| **Draft** | (Slice 3) Optional prompt-to-sprite step billed to the user's own API key. |

## Retired terms

- `.cpe` (CreativePhotoEditor project file): legacy, read-only support.
- "Pixel mode": use **Pixel workspace**.
- "Game project library": use **Library** and **Project**.
- "Frame slot", "frame strip": use **Frame**, **Cel** and **Timeline**.
