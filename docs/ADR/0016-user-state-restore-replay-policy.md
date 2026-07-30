# ADR 0016 — User-state restore replay policy

Status: Accepted
Date: 2026-07-30

## Context

ADR 0014 keeps V1 restore non-destructive because attempts, study events, concept evidence and XP transactions are append-only. Step 7 added persisted gamification projections, which makes Backup exports more complete but also increases replay risk.

A future "restore full user state" feature must move learning history between databases without duplicating attempts, changing content meaning, overwriting local history or trusting derived projections as authoritative evidence.

## Decision

Full user-state restore will be implemented as a two-phase flow:

1. `user_state_dry_run` validates the Backup, resolves content references and produces a category-by-category merge plan.
2. `user_state_apply` is enabled only when the dry-run has no blocking conflicts and the user explicitly applies the plan.

The current V1 `pack_manifest` restore remains the only automatic apply mode.

### Identity and provenance

Content identity is resolved before user-state replay using:

- Pack schema;
- Pack ID;
- Pack version;
- canonical content hash;
- content stable IDs for tracks, lessons, activities and concepts.

User-state replay must use a restore provenance ledger before any apply path is implemented. The ledger must record:

- source export ID or source backup fingerprint;
- source record kind;
- source record ID;
- source content tuple;
- local record ID created during restore;
- payload hash;
- applied timestamp.

This ledger is the idempotency boundary. Retrying the same Backup must not create duplicate attempts, XP, study events, evidence, mistakes, reviews or gamification records.

### Append-only categories

Append-only records may be imported only as new local records with restore provenance:

- attempts;
- attempt test results;
- concept evidence;
- study events;
- XP transactions;
- badge awards;
- mission progress events.

The restore process must not reuse exported primary keys as local primary keys unless a future ADR proves it is safe for all supported databases. Local IDs may differ from source IDs; references must be remapped through the restore provenance ledger.

### Projection categories

Derived or mutable projections are not trusted as authoritative input:

- lesson progress;
- track progress;
- review schedules;
- active/resolved mistake state;
- mission progress;
- rank.

These records are rebuilt or reconciled from append-only inputs where possible. Exported projection rows may be used for dry-run explanation and conflict reporting, but they must not overwrite local projection rows without a deterministic recomputation or an explicit projection reconciliation policy.

### Blocking conflicts

`user_state_apply` stays disabled when any of these conflicts exist:

- referenced Pack is missing locally and cannot be restored from the Backup manifest;
- same Pack schema/ID/version exists locally with a different content hash;
- referenced activity, concept, lesson or track stable ID cannot be resolved after Pack restore;
- evaluator version in an Attempt is unsupported by the current runtime policy;
- source record has already been imported with the same identity but a different payload hash;
- source record references private source code that the user excluded from restore;
- owner mapping is ambiguous;
- applying would require deleting, rewriting or renumbering existing local append-only records;
- a projection row cannot be rebuilt deterministically from imported append-only records.

Non-blocking conflicts may be reported as warnings when the apply path can skip a category without corrupting other categories. Skipped categories must be explicit in the result.

### Ordering

Apply order for a future full restore is:

1. Pack manifests and content reference validation.
2. Attempts and attempt test results.
3. Concept evidence.
4. Study events.
5. XP transactions.
6. Badge awards and mission progress events.
7. Recomputed projections for progress, review, mistakes, missions and export summaries.

All apply work must run in a database transaction or in resumable batches with recorded checkpoints. Partial replay without provenance is not allowed.

## Consequences

Backups can remain complete without making V1 restore destructive. Full migration between machines becomes possible only after adding the restore provenance ledger, dry-run planner, compatibility tests and explicit UI review.

This policy favors duplicate prevention and learning-history integrity over automatic convenience.

## Review trigger

Revisit before implementing `user_state_apply`, multi-device sync, hosted account migration, destructive restore, source-code redaction restore or any restore path that writes append-only user-state records.
