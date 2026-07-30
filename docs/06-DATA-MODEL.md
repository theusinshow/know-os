# 06 — Data Model

## Ownership

Every user-owned record includes `owner_id`, even while V1 uses a single seeded owner. Imported catalog content is not duplicated per owner unless modification or provenance requires it.

## Planned relational tables

### Content

- `tracks`
- `modules`
- `lessons`
- `concepts`
- `lesson_concepts`
- `content_blocks`
- `activities`
- `content_versions`
- `pack_imports`

### User state

- `owners`
- `track_progress`
- `lesson_progress`
- `concept_evidence`
- `concept_progress`
- `attempts`
- `attempt_test_results`
- `mistakes`
- `review_schedules`
- `study_events`
- `project_contexts`
- `project_concepts`
- `project_activities`
- future `restore_provenance` ledger before user-state replay

### Gamification

- `xp_transactions`
- `badge_definitions`
- `badge_awards`
- `missions`
- `mission_progress`
- `mission_progress_events`

## JSONB use

JSONB is acceptable for flexible block payloads, activity configuration, validator configuration, import manifests and raw provenance. Core identity, relations, status, dates and query-critical evidence remain relational.

## Append-only tables

- `attempts`
- `concept_evidence`
- `study_events`
- `xp_transactions`
- `badge_awards`

Corrections are represented through new records or explicit revocation/compensation records, not destructive updates.

## Implemented V1 notes

Current migrations implement imported content tables, owner-scoped progress/attempt/evidence/review/mistake state, optional project context joins to imported concepts and activities, append-only XP transactions, append-only badge awards, mission progress projections and mission progress status-change events.

Rank, badge eligibility and mission status remain derived from deterministic rules over XP, reviews, mistakes and mastery evidence. The persisted gamification tables are read/export projections and audit records; they must not drive mastery or learning recommendations.

## Time

Persist timestamps in UTC. Display in the user's configured timezone. Review scheduling uses absolute timestamps plus scheduling metadata.

## Deletion

User-requested deletion may physically remove private data. Normal application behavior must not mutate historical evidence merely to simplify UI.
