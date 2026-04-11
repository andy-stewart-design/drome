# PRD: Local Sketch Persistence

## Problem

The Drome REPL has no persistence. All code lives in ephemeral editor state and is lost when the page is closed, the browser crashes, or the user navigates away. Users cannot save, name, organize, or return to their work. This blocks any meaningful creative workflow — you can't build on previous sketches, share your work, or maintain a library of compositions.

## Goal

Enable users to save, load, organize, and manage sketches locally in the browser using IndexedDB. The implementation must be designed with future AT Protocol integration in mind so that the local data model maps cleanly to AT Proto Lexicon records without migration or translation.

## Non-Goals (for this phase)

- AT Protocol publishing, syncing, or federation
- Cloud storage or server-side persistence
- Collaborative editing
- Audio/visual state persistence (BPM, channel config, visualizer settings)
- Auto-save or draft recovery beyond `beforeunload` protection

## Users

Live-coding musicians using the Drome REPL to compose, experiment with, and perform algorithmic music.

## Requirements

### 1. Data Model

**1.1** Sketches are stored in IndexedDB with the schema defined in `design-summary.md`.

**1.2** Primary keys are TIDs (Timestamp IDs) — base32-sortable, microsecond-precision timestamps compatible with AT Protocol rkeys.

**1.3** A sketch record contains: `tid`, `title`, `code`, `origin`, `originDid`, `originDisplayName`, `description`, `tags`, `publishedUri`, `createdAt`, `updatedAt`, `deletedAt`.

**1.4** Indexes on `updatedAt`, `title`, `publishedUri`, and `deletedAt` for efficient querying and sorting.

**1.5** The database uses a versioned migration framework. `onupgradeneeded` iterates through an ordered array of migration functions from `oldVersion` to `newVersion`.

### 2. Routing

**2.1** `/` redirects to `/:tid` for the most recently updated sketch, or to `/new` if no sketches exist.

**2.2** `/new` renders a blank editor with default example code. This state is ephemeral and not persisted until the user explicitly saves.

**2.3** `/:tid` loads the sketch from IndexedDB by TID and hydrates the CodeMirror editor with its code.

**2.4** All route transitions use SvelteKit's client-side router for seamless SPA navigation.

### 3. Saving

**3.1** Save is explicit — triggered by a keyboard shortcut (e.g., `Cmd+S`).

**3.2** On first save of a new sketch, the user is prompted for a title. A TID is generated, the sketch is persisted to IndexedDB, and the URL is replaced from `/new` to `/:tid`.

**3.3** Subsequent saves on an existing sketch overwrite the record in place and update `updatedAt`.

**3.4** A `beforeunload` handler warns the user if the current editor content differs from the last saved state (or from the initial state on `/new`).

### 4. Loading and Browsing

**4.1** The sidebar (below the visualizer) displays a scrollable list of recent sketches.

**4.2** Default sort order is by `updatedAt` descending (most recent first).

**4.3** Users can switch to alphabetical sort by title.

**4.4** Clicking a sketch in the sidebar navigates to `/:tid` and loads it.

**4.5** The sidebar is resizable.

**4.6** Future: a full-collection dialog view with search and filtering.

### 5. Deletion

**5.1** Deleting a sketch sets `deletedAt` to the current timestamp (soft delete). The sketch is hidden from all UI views.

**5.2** On app startup, sketches with `deletedAt` older than a configured threshold (e.g., 30 days) are permanently removed from IndexedDB.

**5.3** Future: if a sketch has a `publishedUri`, prompt the user to optionally delete the record from their PDS as well.

### 6. Provenance (Fork Support)

**6.1** When a sketch is pulled from the AT Protocol network (future), a new local sketch is created with a new TID. The `origin` field stores the AT URI of the source record. `originDid` and `originDisplayName` store the original author's identity.

**6.2** The UI displays provenance information (e.g., "forked from @alice.bsky.social") when `origin` is set.

**6.3** `originDisplayName` is a cached convenience field that can be refreshed opportunistically when online.

## AT Protocol Compatibility

The local schema is a deliberate superset of the planned `app.drome.sketch` Lexicon record. The AT Proto record contains: `tid` (as rkey), `title`, `code`, `origin`, `description`, `tags`, `createdAt`. Local-only fields (`updatedAt`, `publishedUri`, `originDid`, `originDisplayName`, `deletedAt`) are stripped when publishing.

Publishing a sketch is a one-way snapshot — local remains the source of truth. Republishing the same sketch creates a new record with a `previousVersion` link to the prior publication, forming a version chain on the network.

TIDs are used as primary keys from the start so that local IDs and AT Proto rkeys are the same value, eliminating any ID mapping layer.

## Technical Context

- **Framework:** SvelteKit 2 + Svelte 5 (runes mode)
- **Editor:** CodeMirror 6
- **Storage:** IndexedDB (no external dependencies — use the native API or a thin wrapper like `idb`)
- **Existing state:** Currently zero persistence; editor state is volatile, audio state is session-only
- **Monorepo:** The REPL is at `apps/repl` within the Drome monorepo

## Success Criteria

- A user can create, save, name, and reload sketches across browser sessions
- Unsaved changes trigger a browser warning on close/navigate
- Sketches are listed in the sidebar with sort options
- Deletion is soft with time-based cleanup
- The IndexedDB schema maps to the planned AT Proto Lexicon without structural changes
- Database migrations are versioned and extensible
