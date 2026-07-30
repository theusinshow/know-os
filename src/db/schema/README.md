# Schema

Drizzle table definitions are grouped by domain and migrated as one application.

- `content.ts` stores imported catalog content and Pack provenance.
- `user-state.ts` stores owner-scoped progress, attempts and study events.

Imported content and user state must remain separate. Append-only records such as attempts and study events must not gain normal update paths in repositories.
