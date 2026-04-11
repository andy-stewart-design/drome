# Plan: Local Sketch Persistence

> Source PRD: `plans/sketch-persistence-prd.md`

## Architectural decisions

Durable decisions that apply across all phases:

- **Routes**: `/` (redirect), `/new` (blank editor), `/:tid` (load sketch)
- **Schema**: IndexedDB object store `sketches` with fields: `tid` (primary key), `title`, `code`, `origin`, `originDid`, `originDisplayName`, `description`, `tags`, `publishedUri`, `createdAt`, `updatedAt`, `deletedAt`. Indexes on `updatedAt`, `title`, `publishedUri`, `deletedAt`.
- **Key models**: Sketch record — the `code` string plus metadata. No audio/visual state.
- **IDs**: TIDs via `@atproto/common-web` — base32-sortable, AT Proto rkey-compatible from day one.
- **Storage library**: `idb` (Jake Archibald's promise wrapper over native IndexedDB API)
- **Authorship**: No local author identity. `origin`/`originDid`/`originDisplayName` are null for sketches you create. Non-null `origin` means the sketch was forked from a remote record. Local author identity arrives with AT Proto integration.
- **Migrations**: Ordered array of versioned migration functions. `onupgradeneeded` walks from `oldVersion` to `newVersion`.

---

## Phase 1: IndexedDB Foundation

### What to build

The data layer for sketch persistence, independent of any UI. Set up the IndexedDB database with a versioned migration framework. The v1 migration creates the `sketches` object store with its primary key (`tid`) and indexes. Build a data access module that exposes CRUD operations — create, read, update, soft-delete, and list (sorted by `updatedAt` descending). Implement TID generation using `@atproto/common-web`. On database open, run startup cleanup to permanently remove sketches where `deletedAt` is older than 30 days.

### Acceptance criteria

- [ ] IndexedDB database opens with a versioned migration framework that walks from `oldVersion` to `newVersion`
- [ ] v1 migration creates the `sketches` object store with `tid` as keyPath and indexes on `updatedAt`, `title`, `publishedUri`, `deletedAt`
- [ ] TID generation produces valid AT Proto rkey-compatible identifiers
- [ ] Can create a sketch (generates TID, sets `createdAt` and `updatedAt`)
- [ ] Can read a sketch by TID (returns `undefined` for missing TIDs)
- [ ] Can update a sketch in place (bumps `updatedAt`)
- [ ] Can soft-delete a sketch (sets `deletedAt`)
- [ ] Can list non-deleted sketches sorted by `updatedAt` descending
- [ ] Startup cleanup permanently removes sketches with `deletedAt` older than 30 days
- [ ] Data module is importable with no dependency on Svelte components or SvelteKit routing

---

## Phase 2: Routing & Navigation

### What to build

Add SvelteKit routes that make sketches addressable by TID. `/new` renders a blank editor with the default example code — this state is ephemeral and not persisted. `/:tid` loads the sketch from IndexedDB and hydrates the CodeMirror editor with its code; if the TID doesn't exist, redirect to `/new`. `/` redirects to the most recently updated sketch's `/:tid`, or to `/new` if no sketches exist. All transitions use SvelteKit's client-side router.

### Acceptance criteria

- [ ] `/new` renders the editor with default example code
- [ ] `/:tid` loads the sketch from IndexedDB and sets the editor content to its code
- [ ] `/:tid` redirects to `/new` if the TID is not found in IndexedDB
- [ ] `/` redirects to `/:tid` for the most recently updated sketch
- [ ] `/` redirects to `/new` when no sketches exist
- [ ] All route transitions are client-side SPA navigation (no full page reloads)
- [ ] The editor, visualizer, and audio engine continue to function on all routes

---

## Phase 3: Save Flow

### What to build

Wire up explicit save triggered by `Cmd+S` (or `Ctrl+S`). When saving a new sketch (on `/new`), prompt the user for a title, generate a TID, persist to IndexedDB, and replace the URL to `/:tid` via the client-side router. Subsequent saves on an existing sketch update the record in place and bump `updatedAt`. Track dirty state by comparing current editor content against the last saved state (or against the default code on `/new`). Show a `beforeunload` warning when the editor has unsaved changes.

### Acceptance criteria

- [ ] `Cmd+S` / `Ctrl+S` triggers save (does not trigger browser's native save dialog)
- [ ] First save on `/new` prompts for a title
- [ ] After first save, a TID is generated, the sketch is persisted, and the URL replaces to `/:tid`
- [ ] Subsequent saves on `/:tid` update the record in place and bump `updatedAt`
- [ ] Dirty state is tracked: editor content is compared against saved state
- [ ] `beforeunload` fires a warning when the editor has unsaved changes
- [ ] Navigating away from a dirty sketch triggers the `beforeunload` warning

---

## Phase 4: Sketch List Sidebar

### What to build

A sidebar below the visualizer that displays a scrollable list of saved sketches. Default sort order is by `updatedAt` descending (most recently updated first). A toggle switches to alphabetical sort by title. Clicking a sketch navigates to its `/:tid` route. The sidebar is resizable. The currently loaded sketch is visually indicated in the list.

### Acceptance criteria

- [ ] Sidebar appears below the visualizer and lists saved sketches
- [ ] Default sort is by `updatedAt` descending
- [ ] User can toggle to alphabetical sort by title
- [ ] Clicking a sketch navigates to `/:tid` and loads it in the editor
- [ ] The currently active sketch is visually indicated in the list
- [ ] The sidebar is resizable
- [ ] The list updates when sketches are saved or deleted
- [ ] Soft-deleted sketches are not shown

---

## Phase 5: Provenance Display

### What to build

When a sketch has a non-null `origin` field, display provenance information in the UI — e.g., "forked from @handle" using `originDisplayName`. This phase is UI-only; there is no mechanism to create forked sketches yet (that arrives with AT Proto integration). The display prepares the interface for the fork workflow.

### Acceptance criteria

- [ ] When `origin` is set, the UI displays provenance (e.g., "forked from @handle")
- [ ] When `origin` is null, no provenance is shown
- [ ] `originDisplayName` is used for display; falls back gracefully if it's null
