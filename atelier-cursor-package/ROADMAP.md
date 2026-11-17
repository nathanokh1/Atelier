# ROADMAP: Atelier

Milestones match Linear (team Portfolio, project Atelier). They are gates, not sprints: don't start a slice while the one before it is shaky. Phases 0 to 3 of the original CreativePhotoEditor roadmap are done (the Photo workspace).

## M0: Repo sync & rename
- NOK-95 Push local work to GitHub (Nathan) **urgent, do first**
- NOK-96 Rename CreativePhotoEditor to Atelier (code-level by Cursor; GitHub repo, Vercel, domain by Nathan)

## M1: Planning & mockups (done)
Decisions NOK-97, 98, 99, 163, 164 are closed. Mockups in `mockups/`. Remaining: NOK-102 Aseprite walkthrough on the Mac (optional research).

## Slice 1: Pixel workspace
Goal: draw a static sprite well. See SLICE-1-PLAN.md for order and details.
- NOK-181 Document model v3: Frames and Cels
- NOK-182 `.atelier` save format v3 (opens `.cpe` v1/v2)
- NOK-184 Workspace switch + per-workspace keymaps
- NOK-183 Home + New (Photo / Design / Sprite) + Sprite setup
- NOK-185 Pixel canvas: nearest-neighbor, whole-step zoom, Pixel Grid, Grid
- NOK-189 Palette panel
- NOK-186 Pixel drawing tools
- NOK-188 Inks and brush options
- NOK-187 Pixel selection and moving
- NOK-190 Export Sprite PNG 1× and 2×/4×/8×
- NOK-191 Docs after Slice 1

**Exit criteria:** from Home, create a 16×16 Sprite, draw it with Pencil, Line, Bucket and Shading using a ramp from the palette, select and flip part of it, save as `.atelier`, reopen it, export a crisp 1× and 8× PNG, and confirm every Photo test case still passes.

## Slice 2: Frames, Library & game exports
- NOK-192 Timeline: frames, cels, linked cels, durations, play, Onion Skin, Preview Window
- NOK-193 Sequences: Animations (Tags), Upgrades, States + slot actions
- NOK-194 Sprite detail view
- NOK-195 Library: Projects, Categories, Labels, status, Variants
- NOK-196 Export core: export set, manifest, PNG + JSON, linked folders
- NOK-197 Swift code format
- NOK-165 Connect a game wizard + AtelierKit (Swift reader, own repo)
- NOK-198 Palette swaps, Sprite Sheet import/export, GIF

**Exit criteria:** Bap is connected, a paddle with 4 upgrades and an idle animation exports as Swift, and Bap draws it through AtelierKit.

## Slice 3: Draft
- NOK-199 Draft panel: prompt to editable Sprite (user's API key, cost confirm)

## Later
- NOK-200 Tilemaps, Tilesets, Slices
- NOK-170 Desktop version (Mac first)
- NOK-180 Customizable shortcuts

## Out of scope (until re-opened)
Editable vector documents, RAW, CMYK/print, plugins, 3D, video, accounts, charging users, diffusion image APIs, using a Claude.ai login as a generator.
