# Packs

This folder contains draft schemas, examples and future importer fixtures.

- `schemas/`: machine-readable draft contracts.
- `examples/`: valid example content.
- `fixtures/`: future invalid, duplicate, update and conflict cases.
- `catalog.json`: the publication catalog for Packs accepted for distribution.

The normative product rules are in `docs/11-PACK-SPEC.md`. Schemas are pre-implementation drafts and may be refined only through compatibility-aware changes.

Before publishing or changing a distributed Pack, run:

```text
pnpm packs:verify
```

The catalog records `schema`, `packId`, integer content `version`, repository path and canonical content hash. The same `schema:packId:version` tuple must never point to different content. A changed Pack requires a new integer `version`; user state remains separate and is not migrated implicitly by content publication.
