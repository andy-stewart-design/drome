# Sketch Persistence — Design Summary

## Schema (IndexedDB)

| Field               | Type               | Notes                                       |
| ------------------- | ------------------ | ------------------------------------------- |
| `tid`               | `string`           | TID (primary key), AT Proto rkey-compatible |
| `title`             | `string`           | Display name, not unique                    |
| `code`              | `string`           | The sketch source code                      |
| `origin`            | `string \| null`   | AT URI this was forked from                 |
| `originDid`         | `string \| null`   | DID of original author                      |
| `originDisplayName` | `string \| null`   | Cached handle, refreshed opportunistically  |
| `description`       | `string \| null`   | Optional description                        |
| `tags`              | `string[] \| null` | Optional tags                               |
| `publishedUri`      | `string \| null`   | AT URI of latest publication                |
| `createdAt`         | `string`           | ISO 8601                                    |
| `updatedAt`         | `string`           | ISO 8601                                    |
| `deletedAt`         | `string \| null`   | ISO 8601, soft delete                       |

**Indexes:** `updatedAt`, `title`, `publishedUri`, `deletedAt`

## IDs

- TIDs (Timestamp IDs) from the start, matching AT Proto rkey format
- Base32-sortable, lexicographically ordered by creation time
- Forking a remote sketch generates a new local TID and stores the `origin` AT URI
- No mapping layer needed between local and AT Proto identifiers

## Routing

- `/` — redirects to `/:tid` (most recently updated sketch) or `/new` (if no sketches exist)
- `/new` — blank scratch pad, ephemeral until explicitly saved. On save, generates TID, persists, and replaces URL to `/:tid` via client-side router
- `/:tid` — loads sketch from IndexedDB, hydrates the editor

## Save/Load Behavior

- Explicit save only (`Cmd+S` or equivalent)
- First save prompts for title, generates TID, persists to IndexedDB, updates URL
- Subsequent saves overwrite in place
- `beforeunload` guard fires when editor content differs from last saved state
- Default example code on `/new` is ephemeral — not auto-persisted

## Sketch List UI

- Sidebar below the visualizer — scrollable, shows recent sketches
- Default sort: most recently updated
- Alternative sort: alphabetical by title
- Full collection view via dialog (future)
- Sidebar is resizable

## Deletion

- Soft delete via `deletedAt` timestamp
- Cleanup runs on app startup, purges sketches deleted more than N days ago
- Future: prompt to also delete from PDS if sketch was published

## Database Migrations

- Array of versioned migration functions
- `onupgradeneeded` walks from `oldVersion` to `newVersion`, running each step
- v1: create sketches object store + indexes

## AT Protocol Mapping

- Local schema is a superset of the AT Proto Lexicon record
- Publishing = extract the AT Proto fields (`tid`, `title`, `code`, `origin`, `description`, `tags`, `createdAt`) and POST to PDS
- Local is always source of truth — no bidirectional sync
- Version chain on the network via `previousVersion` links between records
- Pulling a remote sketch creates a new local sketch with a new TID and an `origin` pointer back to the source

## What a Sketch Is

- Just the code string — no BPM, channel state, visualizer config, or MIDI mappings
- Title and authorship metadata for display and provenance
- Optional description and tags for discoverability

## Compression — Deferred

Considered using the Compression Streams API to gzip + base64-encode sketch code in IndexedDB. **Decision: skip for now.**

- Sketches are small (typically a few hundred bytes). Gzip headers (~20 bytes) plus base64's 33% inflation can make compressed output larger than the original for small payloads.
- IndexedDB stores strings natively — no encoding needed. Quotas are generous (50%+ of disk).
- Compression may become relevant at the AT Protocol publishing layer if PDS blob limits are a concern, but it can be added there without affecting the local storage format.
- Keeping `code` as a plain string simplifies debugging, export, and avoids save/load overhead.
