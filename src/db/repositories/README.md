# Repositories

Database write/read repositories live here. Append-only records must not expose normal update paths.

- `track-import-repository.ts` applies validated Track Packs through a Drizzle transaction.
- `catalog-repository.ts` reads imported tracks, lessons, blocks and activities for the browsing slice.
- `catalog-repository.ts` also exposes Phase 2 concept read models.
- `history-repository.ts` reads append-only study events.
