# ADR 0012 — Store concept evidence as an append-only user-state table

Status: Accepted
Date: 2026-07-30

## Context

Phase 4 needs deterministic mastery, review scheduling, mistakes and recommendations. The existing `attempts` and `study_events` tables preserve important history, but mastery policy needs concept-scoped evidence with typed strength, source, conditions and timestamps.

## Decision

Create a `concept_evidence` user-state table. Each row is owner-scoped, references imported `concepts`, may link to an immutable `attempt`, records a generic evidence type, strength, source metadata, conditions and creation time.

The table is append-only in normal application behavior. Projections such as ConceptProgress and ReviewSchedule may be updated later, but they must remain explainable from evidence and scheduling rules.

## Consequences

Mastery and review policies can query concept-scoped evidence without parsing every Attempt payload. Imported Pack content remains separate from user state. The model adds a small amount of write amplification on SUBMIT because official submissions now append both Attempt and concept evidence rows in the same transaction.

## Alternatives Considered

- Derive all concept evidence directly from `attempts`: simpler schema, but weaker query boundaries and harder explanation/debugging as more evidence types arrive.
- Encode evidence only inside `study_events.payload`: flexible, but too opaque for deterministic mastery and review projections.

## Review trigger

Revisit if evidence volume requires event-sourcing infrastructure, if Pack schemas gain explicit concept-evidence contracts, or if future non-activity evidence cannot fit the generic source/conditions model.
