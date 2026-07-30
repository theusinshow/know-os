# ADR 0014 — Keep V1 backup restore non-destructive for append-only user state

Status: Accepted
Date: 2026-07-30

## Context

V1 Backup exports include imported Pack manifests and owner-scoped learning state categories such as attempts, concept evidence, review queue, mistakes, project context, XP, gamification projections and history. The learning-history rules require attempts, study events, concept evidence and XP transactions to remain append-only.

Automatically replaying exported user state into an existing local database would need conflict handling for existing attempts, source activity references, timestamps, derived projections, XP duplication, gamification projection identity and event identity. Overwriting local rows would violate the non-destructive restore expectation and can erase learning history.

## Decision

V1 restore applies imported content manifests through the normal Pack importer and validates/reports owner-scoped user-state categories, but it does not overwrite or replay append-only user state.

The Backup payload remains the portability contract for preserving user-state records. A future user-state replay or merge restore requires a separate ADR, compatibility tests and explicit UX for conflict handling.

## Consequences

V1 can restore the content references needed to interpret a Backup without mixing imported content and local user state. Users keep local append-only history intact. Full user-state migration between machines remains a future capability, not an implicit side effect of the V1 restore endpoint.

## Review trigger

Revisit before implementing multi-device migration, destructive restore, user-state merge, external backup storage, or hosted account sync.
