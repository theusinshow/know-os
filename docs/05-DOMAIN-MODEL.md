# 05 — Domain Model

## Bounded feature areas

### Content catalog

Track, Module, Lesson, Concept, Block, ActivityDefinition and content versions.

### Learning state

Enrollment/TrackProgress, LessonProgress, ConceptProgress, Attempt, Mistake, ReviewSchedule and StudyEvent.

### Programming extension

CodeActivityConfiguration, ExecutionRun, SubmissionEvaluation and TestResult. ExecutionRun is ephemeral or short-lived; an official submission becomes an Attempt.

### Projects

ProjectContext and links between project examples, concepts and activities.

### Packs

PackManifest, PackImport, ImportDiff, ImportConflict and content provenance.

### Gamification

XPTransaction, Level, Rank, BadgeDefinition, BadgeAward and MissionProgress.

## Aggregate rules

- Content versions are imported through Pack boundaries.
- User state references stable content IDs and survives content updates.
- Attempts are created, never rewritten.
- Study events are append-only records of meaningful actions.
- ConceptProgress is a projection derived from evidence and scheduling state, not an arbitrary manual score.
- XP transactions are append-only and independently auditable.

## Identity

Use UUID/ULID database identifiers for internal records and stable string IDs from Packs for portable content. Never use display names as identity.
