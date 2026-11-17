# LINEAR: how Cursor tracks Atelier work

Linear is the source of truth for what to build and its status. `memory/backlog.md` only points here.

- Workspace: nathanokh · Team: **Portfolio** (key NOK) · Project: **Atelier**
- Milestones: M0 Repo sync & rename, M1 Planning & mockups, Slice 1, Slice 2, Slice 3, Later
- Dashboard: Atelier Mission Control (https://claude.ai/artifact/Wi6rSdhjtMPTz1qKsTDTgC) reads the same cards live.

## Connect Linear to Cursor (one time, Nathan)

Linear's MCP server is `https://mcp.linear.app/mcp`. In Cursor, open Settings, MCP, search for Linear and install it (or add it to `.cursor/mcp.json` as a remote server with that URL), then sign in when prompted. Don't commit tokens.

## Status rules

| Status | Meaning | Who moves it |
|---|---|---|
| Backlog | Planned, not next | Anyone |
| Todo | Next up | Nathan or Cursor |
| In Progress | Cursor is working on it | Cursor, when it starts |
| In Review | Built and checked; waiting for Nathan to try it | Cursor, when "Done when" is met |
| Done | Nathan tried it and accepts it | **Nathan only** |
| Canceled | Dropped | Nathan |

## Working a card

1. Move it to In Progress when you start.
2. Build to its description and "Done when". If the card and DECISIONS.md disagree, DECISIONS.md wins; comment on the card.
3. When done, add a short comment: what changed, files touched, how to test, anything left. Move it to In Review.
4. New bug found: create a card with label **Bug**, project Atelier, the right milestone, steps to reproduce.
5. New decision needed: create a card with label **Decision** and stop work that depends on it.
6. Reusable code worth sharing: label **Promote**.

## Dashboard edits

Nathan queues changes from the dashboard (Suggest change on tools, flows and terms). They arrive as a card titled **"Dashboard edit: N changes"** in Todo. Pick these up first in a session: apply them to TOOL-REFERENCE.md, TAXONOMY.md, DECISIONS.md or the mockup notes as listed, then move the card to In Review.

## Labels in use

Feature, Bug, Decision, Design, Docs, Research, Chore, Improvement, Test, Promote.
