# 03 — Information Architecture

## Primary navigation

1. Today
2. Learn
3. Practice
4. Review
5. Projects
6. Progress
7. Achievements
8. History
9. Search / Command Palette
10. Settings

## Learning hierarchy

```text
Track
└── Module
    └── Lesson
        ├── Concept
        ├── Block
        └── Activity
            └── Attempt
```

Concept is the primary unit of knowledge. Lessons arrange concepts; they do not own mastery.

## Cross-cutting entities

- Review items reference concepts.
- Mistakes reference attempts and concepts.
- Project contexts reference activities and concepts.
- Study events reference the relevant aggregate without duplicating its full state.
- Gamification awards reference meaningful domain events.

## Routing direction

Initial route concepts:

```text
/today
/learn
/tracks/:trackSlug
/lessons/:lessonId
/concepts/:conceptId
/practice
/review
/projects
/projects/:projectId
/progress
/achievements
/history
/settings
/import
/export/context
```

Routes are not final API contracts and may change during scaffold. Stable content IDs must not depend on human-readable slugs.
