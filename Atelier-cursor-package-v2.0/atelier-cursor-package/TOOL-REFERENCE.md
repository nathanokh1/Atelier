# Atelier Tool Reference

Every tool, panel and command, with the workspace it belongs to and when it ships. Pixel terms follow Aseprite. Source of truth for tool behavior; keep statuses current as work lands (NOK-191).

Status: **Now** = in Atelier today · **S1/S2/S3** = Slice 1/2/3 · **Later**.

## Draw

Freehand tools. In Pixel every stroke lands on whole pixels with no anti-aliasing.

### Pencil
- Workspace: Pixel · Status: S1 · Pixel key: `B`
- Does: Paints whole pixels in the foreground color. Right-click paints the background color.
- How: Click for one pixel, drag for a stroke, Shift+click for a straight line from the last point.
- When: Most of your drawing: outlines, details and single-pixel fixes.
- Note: Photo has a Pencil (P) today, but it draws an anti-aliased stroke.

### Brush
- Workspace: Photo · Status: Now · Photo key: `B`
- Does: Soft painting with size, hardness, flow, spacing and presets.
- How: Pick a preset or set the sliders in the options bar, then drag.
- When: Painting, retouching and painting on masks. Not used in Pixel.

### Eraser
- Workspace: Both · Status: S1 · Photo key: `E` · Pixel key: `E`
- Does: Removes pixels to transparent. In Pixel it always removes whole pixels.
- How: Drag over what you want gone. In Photo, hardness controls the edge.
- When: Cleaning stray pixels, cutting shapes out of a silhouette.
- Note: Photo version is in Atelier today.

### Spray
- Workspace: Pixel · Status: Later · Pixel key: `Shift+B`
- Does: Scatters random pixels inside the brush area.
- How: Hold and drag. Larger brush and longer hold give denser spray.
- When: Texture: grass, dust, sparkles, noise on rock.

### Eyedropper
- Workspace: Both · Status: S1 · Photo key: `I` · Pixel key: `I or hold Alt`
- Does: Picks a color from the canvas into the foreground color. Right-click picks into the background color.
- How: Hold Alt while using any drawing tool, click, release.
- When: Reusing an exact color without hunting through the Palette.

### Blur and Jumble
- Workspace: Pixel · Status: Later · Pixel key: `R / Shift+R`
- Does: Blur averages neighboring pixels. Jumble shuffles nearby pixels randomly.
- How: Drag over an area like a brush.
- When: Rarely in small sprites. Blur for quick soft transitions on big art, Jumble for organic noise.

### Text
- Workspace: Both · Status: Later · Photo key: `T`
- Does: Adds text. Photo: editable text layers with font, outline and shadow. Pixel: stamps text with a pixel font.
- How: Click to place, type, style in the Text options bar.
- When: Titles, labels, UI mockups, damage numbers.
- Note: Photo text layers are in Atelier today; Pixel text is Later.

## Shapes & Fill

Lines, shapes and fills. In Pixel they draw with the current brush and ink, snapped to the grid.

### Line
- Workspace: Pixel · Status: S1 · Pixel key: `L`
- Does: Draws a straight line of pixels with the current brush.
- How: Drag from start to end. Hold Shift to snap to clean pixel-art angles (flat, 45°, 1:2 steps).
- When: Edges, UI borders, perspective lines, weapons.

### Curve
- Workspace: Pixel · Status: Later · Pixel key: `Shift+L`
- Does: Draws a line, then lets you bend it with two control points.
- How: Drag the line, then drag each handle, then click to commit.
- When: Arcs, ropes, tails, smooth hair strands.

### Rectangle
- Workspace: Both · Status: S1 · Pixel key: `U`
- Does: Draws a rectangle outline. Its second state, Filled Rectangle, fills it.
- How: Drag corner to corner. Shift makes a square, Alt draws from the center. Click the tool again for Filled.
- When: UI panels, crates, windows, tile blocks.
- Note: Photo has raster rectangle and ellipse shapes today.

### Ellipse
- Workspace: Pixel · Status: S1 · Pixel key: `Shift+U`
- Does: Draws an ellipse outline, or Filled Ellipse as its second state.
- How: Drag the bounding box. Shift makes a circle.
- When: Coins, bubbles, eyes, shadows under characters.

### Contour
- Workspace: Pixel · Status: Later · Pixel key: `D`
- Does: Freehand shape that fills when you let go.
- How: Draw around an area and release.
- When: Fast silhouettes and blobs before detailing.

### Polygon
- Workspace: Pixel · Status: Later · Pixel key: `Shift+D`
- Does: Filled shape from points you click.
- How: Click each corner, close on the first point.
- When: Crystals, rocks, angular UI shapes.

### Paint Bucket
- Workspace: Pixel · Status: S1 · Pixel key: `G`
- Does: Fills a connected area of the same color. With Contiguous off, it fills every matching pixel in the Cel.
- How: Click inside the area. Tolerance defaults to 0 so it only fills exact matches.
- When: Blocking in flat colors, recoloring one region.
- Note: Photo has Fill selection today, not a bucket.

### Gradient
- Workspace: Pixel · Status: Later · Pixel key: `Shift+G`
- Does: Fills with a gradient between foreground and background, dithered so it stays pixel art.
- How: Drag the direction of the gradient across the area.
- When: Skies, glows, light falloff. Use sparingly.

## Select

Selections limit where you paint and what you copy, move or delete. Pixel selections always have hard edges.

### Rectangular Marquee
- Workspace: Both · Status: S1 · Photo key: `M` · Pixel key: `M`
- Does: Box selection. In Pixel it snaps to whole pixels.
- How: Drag a box. Shift adds, Alt subtracts.
- When: Copying part of a sprite, moving a region, limiting where you paint.
- Note: Photo version is in Atelier today.

### Elliptical Marquee
- Workspace: Pixel · Status: S1 · Pixel key: `Shift+M`
- Does: Round selection, snapped to pixels.
- How: Drag the bounding box.
- When: Selecting round parts: heads, shields, orbs.

### Lasso
- Workspace: Both · Status: S1 · Photo key: `L` · Pixel key: `Q`
- Does: Freehand selection.
- How: Draw around what you want and release. Shift adds, Alt subtracts.
- When: Odd shapes such as a raised arm you want to move.
- Note: Photo version is in Atelier today.

### Polygonal Lasso
- Workspace: Pixel · Status: Later · Pixel key: `Shift+Q`
- Does: Selection from straight segments you click.
- How: Click each corner, close on the first point.
- When: Angular regions: roofs, blades.

### Magic Wand
- Workspace: Both · Status: S1 · Photo key: `W` · Pixel key: `W`
- Does: Selects by color, either connected or across the whole layer.
- How: Click a color. Tolerance 0 in Pixel selects one exact color.
- When: Grabbing every pixel of one color, such as the outline, to recolor it.
- Note: Photo version (with tolerance and feather) is in Atelier today.

### Select All, Deselect, Invert
- Workspace: Both · Status: Now · Photo key: `Ctrl+A / Ctrl+D / Ctrl+Shift+I` · Pixel key: `Ctrl+A / Ctrl+D / Ctrl+Shift+I`
- Does: Selects everything, clears the selection, or flips what is selected.
- How: Use the shortcuts or the selection bar.
- When: Invert is handy after wand-selecting the background to grab the character.

### Feather
- Workspace: Photo · Status: Now
- Does: Softens a selection's edge.
- How: Set the feather amount before or after selecting.
- When: Photo blending only. Pixel never feathers, edges stay hard.

### Fill and Delete selection
- Workspace: Both · Status: Now · Photo key: `Del` · Pixel key: `Del`
- Does: Fills the selection with the foreground color, or clears it.
- How: Make a selection, then Fill or press Delete.
- When: Quick blocking or cutting out parts.

## Move & View

Moving content, flipping it, and finding your way around the canvas.

### Move (Aseprite: Move (moves the selection or the whole Cel))
- Workspace: Both · Status: S1 · Photo key: `V` · Pixel key: `V or hold Ctrl`
- Does: Photo moves the layer. Pixel moves the selected pixels, or the whole Cel if nothing is selected.
- How: Drag. Arrow keys nudge 1 pixel, Shift+arrow nudges 10.
- When: Repositioning parts between frames, centering a sprite.
- Note: Photo version is in Atelier today.

### Transform
- Workspace: Photo · Status: Now · Photo key: `T`
- Does: Scale and rotate with corner, edge and rotation handles.
- How: Drag handles. Aspect lock in the options bar.
- When: Photo layouts. In Pixel, free scaling smears pixels, so Pixel uses Flip, Rotate 90° and Sprite Size instead.

### Flip Horizontal / Vertical
- Workspace: Pixel · Status: S1 · Pixel key: `Shift+H / Shift+V`
- Does: Mirrors the selection or the whole Cel.
- How: Select (or not), then flip.
- When: Making a left-facing sprite from a right-facing one.

### Rotate 90° / 180°
- Workspace: Pixel · Status: S1
- Does: Turns the selection or Sprite in quarter turns without losing pixels.
- How: Choose from the Edit or Sprite menu.
- When: Tiles and items that need four orientations.

### Hand
- Workspace: Both · Status: Now · Photo key: `H or hold Space` · Pixel key: `H or hold Space`
- Does: Pans the view without changing anything.
- How: Drag, or hold Space with any tool.
- When: Constantly while zoomed in.

### Zoom
- Workspace: Both · Status: S1 · Photo key: `wheel, + / -` · Pixel key: `Z, wheel`
- Does: Zooms the view. Pixel zooms in whole steps (100%, 200%, 300%) so pixels stay square.
- How: Wheel, Z then click, or + and -. 0 fits to view.
- When: Draw zoomed in, check at 1× in the Preview Window.
- Note: Photo wheel zoom is in Atelier today.

### Pixel Grid and Grid
- Workspace: Both · Status: S1 · Pixel key: `Ctrl+'`
- Does: Pixel Grid draws a line between every pixel at high zoom. Grid draws larger cells, such as 16×16 tiles.
- How: Toggle in the View menu. Set the cell size in Grid Settings.
- When: Pixel Grid when placing exact pixels; Grid when drawing tiles.
- Note: Photo grid guides are in Atelier today.

### Preview Window
- Workspace: Pixel · Status: S2
- Does: A small floating view that shows the sprite at 1× and plays the animation while you draw zoomed in.
- How: Open from the View menu and park it in a corner.
- When: Always on while animating. Sprites must read well at real size.

## Brush & Ink

Options in the context bar that change how every drawing tool behaves.

### Brush size and shape
- Workspace: Both · Status: S1
- Does: Sets how big the brush is. Pixel offers square, circle and line shapes, starting at 1 pixel.
- How: Context bar, or [ and ] to shrink and grow.
- When: 1 pixel for most sprite work, bigger for blocking.
- Note: Photo brush size, hardness, flow and spacing are in Atelier today.

### Custom Brush
- Workspace: Pixel · Status: Later · Pixel key: `Ctrl+B`
- Does: Turns a selection into a brush you can stamp.
- How: Select a pattern, make it a brush, click to stamp.
- When: Bricks, leaves, rivets, repeated details.

### Pixel-perfect
- Workspace: Pixel · Status: S1
- Does: Removes the extra corner pixels freehand strokes create, so 1-pixel lines stay clean.
- How: Toggle in the context bar while using Pencil.
- When: Always on for outlines and line art.

### Ink: Simple
- Workspace: Pixel · Status: S1
- Does: Paints the color exactly as it is. Painting a transparent color erases.
- How: Choose Simple in the Ink menu (the default).
- When: Normal drawing.

### Ink: Alpha Compositing
- Workspace: Pixel · Status: S1
- Does: Blends a semi-transparent color over the pixels below.
- How: Choose it, lower the color's alpha, paint.
- When: Glass, glows, soft shadows on larger art.

### Ink: Lock Alpha
- Workspace: Pixel · Status: S1
- Does: Paints only on pixels that already have color.
- How: Choose it, then paint freely over the shape.
- When: Shading inside a silhouette without spilling outside.

### Ink: Shading
- Workspace: Pixel · Status: S1
- Does: Each pass moves a pixel one step along a color ramp in the Palette. Right-click steps the other way.
- How: Select the ramp in the Palette, choose Shading, paint over the area.
- When: Fast, consistent light and shadow.

### Ink: Copy Alpha+Color
- Workspace: Pixel · Status: Later
- Does: Replaces both color and transparency of each pixel exactly.
- How: Choose it in the Ink menu.
- When: Editing partly transparent pixels precisely.

### Symmetry
- Workspace: Pixel · Status: S1
- Does: Mirrors every stroke across a vertical axis, horizontal axis, or both.
- How: Toggle in the context bar; drag the axis line to move it.
- When: Front-facing characters, icons, shields, symmetrical props.

### Tiled Mode
- Workspace: Pixel · Status: Later
- Does: Shows copies of the canvas around itself so strokes wrap across the edges.
- How: Choose X, Y or both from the View menu, then draw over the seams.
- When: Seamless floor, wall and background tiles.

### Opacity
- Workspace: Both · Status: Now
- Does: How see-through paint or a layer is.
- How: Slider in the options bar or Layers panel.
- When: Photo blending. In Pixel prefer solid colors; use layer opacity only for effects.

## Color & Palette

The colors you paint with. In Pixel the Palette is the backbone of a consistent style.

### Foreground and Background color
- Workspace: Both · Status: S1
- Does: The two active colors. Left click paints foreground, right click paints background.
- How: Click a swatch to set foreground, right-click to set background.
- When: Keep your main color and its shadow one click apart.
- Note: Photo has a single paint color today.

### Palette panel
- Workspace: Pixel · Status: S1
- Does: The swatches that make up the Sprite's colors.
- How: Add, delete, drag to reorder into ramps (dark to light). Turn on Palette only to block colors outside it.
- When: Set it before you draw. A small palette (8 to 32 colors) gives a consistent look.

### Add colors from canvas
- Workspace: Pixel · Status: S1
- Does: Pulls every color used in the Sprite into the Palette.
- How: Palette menu, then Add from canvas.
- When: Cleaning up a sprite drawn freely, or one created by Draft.

### Palette presets
- Workspace: Pixel · Status: S1
- Does: Ready-made palettes such as DB16, DB32 and PICO-8.
- How: Palette menu, then Load preset.
- When: Starting a Project fast with a proven palette.

### Color Mode (Aseprite: RGB / Indexed / Grayscale)
- Workspace: Pixel · Status: Later
- Does: RGB stores any color. Indexed stores each pixel as a Palette number, so editing a swatch recolors the whole Sprite.
- How: Sprite menu, then Color Mode.
- When: Indexed for strict retro work and instant palette swaps. Slice 1 ships RGB with Palette only.

### Replace Color
- Workspace: Pixel · Status: S2
- Does: Swaps one color for another across the Cel, Layer or selection.
- How: Pick from and to colors, set the scope, apply.
- When: Making recolor Variants: team colors, enemy tiers.

### Outline
- Workspace: Pixel · Status: S2
- Does: Adds a 1-pixel outline around all colored pixels, inside or outside the shape.
- How: Edit menu, then Outline. Choose color and place.
- When: Making a sprite pop against busy backgrounds.

## Layers

Stacked content. In Pixel each Layer holds one Cel per Frame.

### New Layer
- Workspace: Both · Status: Now · Pixel key: `Shift+N`
- Does: Adds an empty layer above the current one.
- How: Layers panel button or shortcut. Double-click to rename.
- When: Separate outline, color and shading so each stays editable.

### Background layer
- Workspace: Pixel · Status: S1
- Does: An opaque bottom layer. Only one per Sprite, and it cannot move.
- How: Choose a solid background in New Sprite, or convert a layer.
- When: Tiles and backdrops that must never be see-through. Game sprites usually skip it.

### Group
- Workspace: Both · Status: Now
- Does: Folder of layers that hide, lock and move together.
- How: Select layers, then Group.
- When: Body parts, equipment sets, effects.

### Reference layer
- Workspace: Pixel · Status: Later
- Does: An image you trace over. It is never exported.
- How: Layer menu, then New Reference Layer from file.
- When: Tracing a sketch, photo, or a Draft result.

### Tilemap layer
- Workspace: Pixel · Status: Later · Pixel key: `Space+N`
- Does: A layer made of grid cells, each pointing at a tile in a Tileset.
- How: Layer menu, then New Tilemap Layer. Uses the current Grid size.
- When: Levels and maps built from reusable tiles.

### Visibility and Lock
- Workspace: Both · Status: Now · Pixel key: `Shift+X (visibility)`
- Does: Hides a layer, or stops you drawing on it.
- How: Eye and lock icons in the Layers panel. On a Group they apply to every child.
- When: Lock finished layers so stray strokes never land on them.

### Layer opacity and blend mode
- Workspace: Both · Status: Now
- Does: How a layer mixes with the layers below.
- How: Layers panel, or Layer Properties.
- When: Photo compositing. In Pixel, keep to Normal unless making effects.

### Merge Down and Flatten
- Workspace: Both · Status: S1 · Photo key: `Ctrl+E` · Pixel key: `Ctrl+E`
- Does: Merge Down joins a layer into the one below. Flatten joins all layers.
- How: Layer menu.
- When: Before exporting a single-layer asset, or to simplify.

### Duplicate layer
- Workspace: Both · Status: Now
- Does: Copies the layer with all its Cels.
- How: Layers panel button or right-click menu.
- When: Trying a change without losing the original.

### Layer Properties
- Workspace: Both · Status: S1 · Pixel key: `Shift+P`
- Does: Name, opacity and blend mode in one dialog.
- How: Double-click the layer or use the shortcut.
- When: Renaming and tuning a layer quickly.

### Masks and Clipping
- Workspace: Photo · Status: Now
- Does: A mask hides parts of a layer without erasing them. Clipping shows a layer only where the layer below has pixels.
- How: Layers panel MASK section. Paint white to reveal, erase to hide.
- When: Photo compositing. Pixel uses Lock Alpha instead.

## Timeline & Animation

Frames, Cels and Tags: how a Sprite moves.

### Timeline panel
- Workspace: Pixel · Status: S2
- Does: A grid with Layers as rows and Frames as columns. Each square is a Cel.
- How: Click a square to edit that Layer at that Frame. Drag to select ranges.
- When: Any time a Sprite has more than one Frame.

### New Frame
- Workspace: Pixel · Status: S2 · Pixel key: `Alt+N`
- Does: Adds a Frame after the current one, copying its Cels.
- How: Shortcut or the + in the Timeline. New Empty Frame adds a blank one.
- When: Building an animation pose by pose.

### Duplicate and Delete Frame
- Workspace: Pixel · Status: S2
- Does: Copies or removes the selected Frames.
- How: Right-click a Frame number.
- When: Holding a pose longer, trimming a loop.

### Frame Duration
- Workspace: Pixel · Status: S2
- Does: How long each Frame shows, in milliseconds.
- How: Right-click the Frame number, then Frame Properties.
- When: Timing: hold the anticipation, speed through the swing.

### Previous and Next Frame
- Workspace: Pixel · Status: S2 · Pixel key: `, and . or ← →`
- Does: Steps through Frames.
- How: Shortcuts or Timeline arrows.
- When: Flipping back and forth to check motion.

### Play and Stop
- Workspace: Pixel · Status: S2 · Pixel key: `Enter`
- Does: Plays the animation on the canvas and in the Preview Window.
- How: Press Enter, or the play button.
- When: After every few frames.

### Tags
- Workspace: Pixel · Status: S2
- Does: Name a range of Frames and how it loops: Forward, Reverse or Ping-pong.
- How: Select Frames, then New Tag. Name it (idle, walk) and pick a color and direction.
- When: One Tag per animation in a Sprite. Game engines read Tags from the sheet JSON.

### Linked Cels
- Workspace: Pixel · Status: S2
- Does: Several Frames share the same Cel pixels. Edit one and all update.
- How: Select Cels, then Link Cels.
- When: Parts that do not move, such as a body while only the arm animates.

### Cel Properties
- Workspace: Pixel · Status: S2
- Does: Opacity for a single Cel.
- How: Right-click a Cel.
- When: Fade-ins and flashes without touching the layer.

### Onion Skin
- Workspace: Pixel · Status: S2
- Does: Shows the previous and next Frames faintly under the current one.
- How: Toggle in the Timeline; set how many Frames and their tint.
- When: Drawing in-betweens and keeping motion smooth.

### Reverse Frames
- Workspace: Pixel · Status: Later
- Does: Reverses the order of the selected Frames.
- How: Select Frames, then Reverse.
- When: Turning an open animation into a close animation.

## Tilemaps & Slices

Reusable tiles for levels, and named regions for UI and hitboxes.

### Tileset
- Workspace: Pixel · Status: Later
- Does: A collection of same-sized tiles, like a Palette for tiles. Tile 0 is empty.
- How: Created with a Tilemap layer; tiles appear in the Tileset panel.
- When: Any game with grid-based levels.

### Draw Pixels / Draw Tiles
- Workspace: Pixel · Status: Later · Pixel key: `Space+Tab`
- Does: Draw Pixels edits what tiles look like. Draw Tiles places tiles on the map.
- How: Switch modes with the shortcut or the Tilemap bar.
- When: Draw Pixels to paint tiles, Draw Tiles to build the level.

### Manual / Auto / Stack
- Workspace: Pixel · Status: Later · Pixel key: `Space+1 / 2 / 3`
- Does: How pixel edits affect tiles. Auto (default) creates and reuses tiles as you draw. Manual edits tiles in place. Stack always makes new tiles.
- How: Choose in the Tilemap bar.
- When: Auto for most work; Manual when every copy of a tile should change.

### Slice
- Workspace: Pixel · Status: Later · Pixel key: `Shift+C`
- Does: A named rectangle on the Sprite with optional 9-slice center and pivot point.
- How: Drag a box with the Slice tool, then name it in its properties.
- When: Stretchable UI buttons, hitboxes, a pivot at a character's feet.

## Sprite & Canvas

Document-level commands: create, resize and set up the grid.

### New Sprite
- Workspace: Pixel · Status: S1
- Does: Creates a Sprite: size (16, 32, 48, 64 or custom), background, Project and Category.
- How: Home or New, choose Sprite, fill in Sprite setup.
- When: Start of every asset. Match the Project's base size.

### New Document
- Workspace: Photo · Status: Now
- Does: Creates a Photo canvas from size presets (1:1, 16:9, A4) with a transparent or color background.
- How: New, choose Photo or Design.
- When: Photos, graphics and layouts.

### Canvas Size
- Workspace: Both · Status: S1
- Does: Adds or trims space around the edges without scaling content.
- How: Sprite menu. Choose the anchor side.
- When: Room for a sword swing or a taller hat.
- Note: Photo crop and canvas sizing are in Atelier today.

### Sprite Size
- Workspace: Pixel · Status: S1
- Does: Scales the whole Sprite with nearest-neighbor, so pixels stay sharp.
- How: Sprite menu. Use whole-number scales (2×, 3×).
- When: Upscaling for preview or a higher-resolution game. Downscaling rarely works; redraw instead.

### Grid Settings
- Workspace: Pixel · Status: S1
- Does: Grid cell size and offset.
- How: View menu, then Grid Settings.
- When: Match your tile size (16×16) before drawing tiles.

## File & Export

Saving your work and getting it into a game.

### Save
- Workspace: Both · Status: Now · Photo key: `Ctrl+S` · Pixel key: `Ctrl+S`
- Does: Saves a reopenable project file with layers, frames and settings.
- How: Shortcut or File menu.
- When: Always. Exports are one-way.
- Note: Saves as .cpe today; .atelier is pending a decision.

### Tabs and Autosave
- Workspace: Both · Status: Now
- Does: Several open documents, each autosaved in the browser and restored on reload.
- How: Tab bar: new, switch, close.
- When: Working on several sprites side by side.

### Export PNG
- Workspace: Both · Status: S1
- Does: Flattened image. Pixel exports at 1× (the game file) and at nearest-neighbor multiples (2×, 4×, 8×).
- How: File, Export. Pick scale and background.
- When: 1× for the engine, 4× or 8× for sharing.
- Note: Photo PNG/JPG/WebP export with scale is in Atelier today.

### Export each layer
- Workspace: Both · Status: Now
- Does: Every layer as its own file in a .zip, optionally trimmed.
- How: Export dialog, Per layer.
- When: Handing separate parts to an engine or animator.

### Export Sprite Sheet
- Workspace: Pixel · Status: S2
- Does: All Frames laid out in one image (horizontal, vertical, rows or packed) plus a JSON file with frame positions, durations and Tags.
- How: File, Export Sprite Sheet. Choose layout, padding and trim.
- When: Getting animations into a game engine.

### Import Sprite Sheet
- Workspace: Pixel · Status: S2
- Does: Cuts a sheet image back into Frames by cell size, offset and padding.
- How: File, Import Sprite Sheet. Set cell size and order.
- When: Editing sheets made elsewhere.
- Note: Built on the Auto-Layers slicer that ships today.

### Export GIF
- Workspace: Pixel · Status: S2
- Does: Animated GIF of a Tag or all Frames.
- How: File, Export, choose GIF and scale.
- When: Sharing progress, store pages, Discord.

## Library

Where every sprite lives, organized by Project and Category.

### Library browser
- Workspace: Pixel · Status: S2
- Does: Thumbnails of every Sprite, filtered by Project, Category and Label.
- How: Home, then Library. Click to open, right-click for options.
- When: Finding and reusing assets across a game.

### Project
- Workspace: Pixel · Status: S2
- Does: A game's set of Sprites, with its own shared Palette and base size.
- How: Create from the Library; pick it in Sprite setup.
- When: One per game: Bap, CastleD.

### Category
- Workspace: Pixel · Status: S2
- Does: What kind of asset: Character, Tile, Item, UI or Effect.
- How: Set in Sprite setup; change in Library.
- When: Keeps big projects browsable.

### Labels
- Workspace: Pixel · Status: S2
- Does: Free-form sorting words such as boss, forest, v2.
- How: Add in the Library card.
- When: Cross-cutting groups. Named Labels so they never clash with Tags.

### New Variant
- Workspace: Pixel · Status: S2
- Does: Duplicates a Sprite with the same size and Palette, linked to the original.
- How: Right-click a Sprite in the Library, New Variant.
- When: Recolors, damaged states, seasonal skins.

## Draft (prompt to sprite)

Optional AI step that writes a rough Sprite you then edit by hand. Billed to your own API key.

### Draft panel
- Workspace: Pixel · Status: S3
- Does: Describe a Sprite; Atelier asks Claude for a Palette and a grid of pixels and adds it as a new Layer.
- How: Type a prompt, check size and Palette, review the cost line, Confirm.
- When: A rough start for an idea. Expect to clean it up by hand.

### Vary current sprite
- Workspace: Pixel · Status: S3
- Does: Sends the current grid back with your note and saves the result as a new Variant.
- How: Draft panel, Vary, type what should change.
- When: Quick alternates: angrier face, different weapon.

### Model choice
- Workspace: Pixel · Status: S3
- Does: Haiku (default, cheapest) or Sonnet (better at following the format).
- How: Dropdown in the Draft panel.
- When: Haiku for 16×16 tries, Sonnet for 32×32 and up.

### Cost line and Confirm
- Workspace: Pixel · Status: S3
- Does: Shows the estimated cost before anything is spent.
- How: Read it, then Confirm or cancel.
- When: Every Draft. Nothing runs without Confirm.

### API key
- Workspace: Both · Status: S3
- Does: Your Anthropic API key, stored only in this browser and sent per request through Atelier's route.
- How: Settings, Draft, paste key.
- When: Once, before the first Draft.

## Photo retouch

Photo-only tools that already ship in Atelier.

### Clone Stamp
- Workspace: Photo · Status: Now · Photo key: `K`
- Does: Copies pixels from one spot to another as you paint.
- How: Alt+click to set the source, then paint.
- When: Removing objects by covering them with nearby texture.

### Heal
- Workspace: Photo · Status: Now · Photo key: `J`
- Does: Content-aware fill that rebuilds texture over what you brush.
- How: Brush over the blemish.
- When: Spots, wires, small distractions.

### Pen
- Workspace: Photo · Status: Now · Photo key: `N`
- Does: Bezier path you can turn into a stroke, a fill or a selection.
- How: Click anchors, drag for curves, Enter to close.
- When: Precise cutouts and smooth shapes.

### Crop
- Workspace: Photo · Status: Now · Photo key: `C`
- Does: Trims the canvas to a rectangle.
- How: Drag the area, confirm.
- When: Framing photos.

### Adjustments and Filters
- Workspace: Photo · Status: Now
- Does: Exposure, contrast, saturation, hue, temperature, levels; B&W, sepia, blur, sharpen, vignette.
- How: Adjust & Filters panel, per layer.
- When: Color correction and quick looks.

### Remove Background
- Workspace: Photo · Status: Now
- Does: On-device model cuts the subject out. Free, images never leave the device.
- How: Select the layer, Remove background.
- When: Product shots, portraits, stickers.
- Note: Code is on GitHub; confirm status after the local push.

### Auto-Layers (Slicer)
- Workspace: Photo · Status: Now
- Does: Detects separate regions or a grid in an image and splits each into its own layer.
- How: Auto-Layers dialog: detect regions or even grid.
- When: Sticker sheets, card grids; the base for Import Sprite Sheet.

## General

Commands that work everywhere.

### Undo and Redo
- Workspace: Both · Status: Now · Photo key: `Ctrl+Z / Ctrl+Y` · Pixel key: `Ctrl+Z / Ctrl+Y`
- Does: Steps backward and forward through every edit.
- How: Shortcuts or the History panel.
- When: Always. Every change in Atelier is undoable.

### History panel
- Workspace: Both · Status: Now
- Does: List of recent edits; click one to jump back.
- How: Open from the Window menu.
- When: Going back several steps at once.
- Note: Reported done locally; not on GitHub yet.

### Settings and tooltips
- Workspace: Both · Status: Now
- Does: App preferences, including hover tips with a delay.
- How: Settings panel.
- When: Turning tips off once you know the tools.

## Glossary

- **Atelier** (The app): One browser studio with two workspaces sharing one engine.
- **Workspace** (Atelier term): A set of tools, panels and shortcuts for a kind of work: Photo or Pixel. It changes the tools, not the engine.
- **Document** (Atelier term): Anything open in a tab. In Photo it is a Canvas; in Pixel it is a Sprite.
- **Sprite** (Aseprite): A Pixel document: size, color mode, Palette, Layers, Frames, Tags, Slices.
- **Layer** (Aseprite): A stack of content. Kinds: Normal, Background, Group, Tilemap, Reference.
- **Frame** (Aseprite): One point in time in an animation, with its own duration in milliseconds.
- **Cel** (Aseprite): One Layer in one Frame: the actual pixels at that spot in the Timeline. Can be empty or linked.
- **Linked Cel** (Aseprite): A Cel shared by several Frames. Edit one and all change.
- **Tag** (Aseprite): A named range of Frames with a loop direction. One Tag per animation (idle, walk).
- **Timeline** (Aseprite): The Layers × Frames grid at the bottom of the Pixel workspace.
- **Onion Skin** (Aseprite): Faint previous and next Frames shown while drawing.
- **Palette** (Aseprite): The ordered list of colors a Sprite uses.
- **Color Mode** (Aseprite): RGB, Indexed (pixels point at Palette slots) or Grayscale.
- **Ink** (Aseprite): How a drawing tool applies color: Simple, Alpha Compositing, Lock Alpha, Shading, Copy Alpha+Color.
- **Pixel-perfect** (Aseprite): Stroke cleanup that removes doubled corner pixels.
- **Tileset** (Aseprite): Reusable same-sized tiles. A Tilemap layer's cells point at them.
- **Tilemap** (Aseprite): A layer made of tile references on a grid.
- **Slice** (Aseprite): A named region with optional 9-slice center and pivot.
- **Sprite Sheet** (Aseprite): All Frames packed in one image, plus JSON with positions, durations and Tags.
- **Library** (Atelier term): Every Sprite you have, organized by Project, Category and Label.
- **Project** (Atelier term): One game's Sprites, sharing a Palette and base size.
- **Category** (Atelier term): Character, Tile, Item, UI or Effect.
- **Label** (Atelier term): A free-form sorting word in the Library. Not the same as a Tag.
- **Variant** (Atelier term): A linked copy of a Sprite for recolors or alternate states.
- **Draft** (Atelier term): The optional prompt step that writes a rough Sprite as a new Layer.
- **Command** (Atelier engine): Every change goes through one, which is why everything is undoable.
