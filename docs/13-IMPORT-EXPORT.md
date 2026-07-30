# 13 — Import and Export

## Import guarantees

- Untrusted input.
- Size limits before full parsing where possible.
- Schema and semantic validation.
- No executable UI payloads.
- Preview before mutation.
- Deterministic diff.
- Idempotency by stable ID and version.
- Atomic application.
- Import provenance and result stored.

## Conflict types

- same ID and same version with different content;
- unsupported schema version;
- missing dependency;
- deleted or renamed referenced concept;
- invalid stable-ID relationship;
- local content override conflict.

`APPLY` remains disabled while unresolved conflicts exist.

## Export types

### Teacher Context

Selectable current lesson, mastery evidence, recent attempts, mistakes, review queue, notes and projects. Preview content and approximate size before export.

### Backup

Complete user-owned state plus necessary content references, manifest, schema versions and checksums.

### Progress

Portable user progress and evidence without including unnecessary private notes unless selected.

## Privacy

Exports are explicit user actions. The UI must show included categories and warn about private notes or source code.
