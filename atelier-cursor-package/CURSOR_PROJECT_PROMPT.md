# Session kickoff: Atelier

Paste the block below at the start of a Cursor Agent session. Fill in the last two lines.

---

You're working on **Atelier** (formerly CreativePhotoEditor): a browser-first art studio with two workspaces on one engine. **Photo** is today's layered photo editor. **Pixel** is a new Aseprite-style workspace for game sprites.

Before doing anything:

1. Read `atelier-cursor-package/PROJECT_BRAIN.md` (what this is, principles, decisions log).
2. Read `atelier-cursor-package/DECISIONS.md` (the five locked decisions from Nov 16, 2026). These are settled. Don't reopen them; flag a conflict instead.
3. Read `atelier-cursor-package/TAXONOMY.md` and use the terms exactly.
4. Read `atelier-cursor-package/ARCHITECTURE.md` (module boundaries, document model v3, `.atelier` format).
5. Check `atelier-cursor-package/ROADMAP.md` for the current milestone. Don't build ahead of it.
6. For the current slice, follow its plan file (Slice 1: `atelier-cursor-package/SLICE-1-PLAN.md`).
7. Look at `atelier-cursor-package/mockups/` (PNG screenshots, plus the HTML source with exact colors and copy) before building any UI.
8. `atelier-cursor-package/TOOL-REFERENCE.md` defines what each tool does. Build to it.
9. Track work in Linear as described in `atelier-cursor-package/LINEAR.md`.
10. Rules in `.cursor/rules/` load automatically. If anything here conflicts with them, the rules win; flag the conflict rather than picking silently.

**Current milestone:** [e.g. "M0: Repo sync & rename" or "Slice 1: Pixel workspace"]

**What I want this session:** [e.g. "Start Slice 1 with NOK-181"]

Standing reminders:
- Every document mutation goes through a Command. Undo/redo is not optional.
- `pixi.js` is imported only inside `core/render`. `core/` never imports React or Next.
- Photo must keep working exactly as it does today. Run docs/TEST-CASES.md after any core change.
- Approval-by-exception: don't stop for routine work. Do stop for: a new module kickoff, a material architecture change, a direction decision not already in DECISIONS.md, or anything touching save/load of existing files (data-loss risk).
- Check `@nathanokh/codebase` before building a UI primitive from scratch.

---

## First session only (one time)

Do these before any Slice 1 code, in order:

1. Confirm the repo is current: `git status` is clean and `main` matches GitHub (Linear NOK-95). If local is ahead, stop and tell Nathan to push first.
2. Merge `atelier-cursor-package/` into the repo: it replaces `CreativePhotoEditor-cursor-package/`. Before deleting the old folder, carry over anything in it that is newer than this package (the GitHub copy this package was built from is from Aug 30, so local docs may have moved on). List what you carried over.
3. Update `.cursor/rules/project.mdc` to point at `atelier-cursor-package/` and describe Atelier (keep the stack and conventions sections). `40-atelier.mdc` is new and ships with this package.
4. Code-level rename for NOK-96: `package.json` name, landing page, title bar, README, settings footer. The GitHub repo, Vercel project and domain are renamed by Nathan, not you.
5. Refresh the stale `memory/backlog.md` so it points at Linear as the source of truth.
6. Log a DECISION entry in `memory/forge-changelog.md` for the package adoption.
7. Move NOK-96 to In Review and report back with a short summary before starting Slice 1.
