# 14 — Gamification

## Separation of meanings

- XP measures meaningful effort and journey.
- Mastery measures knowledge evidence.
- Rank summarizes progression, not intelligence.
- Badges recognize specific accomplishments.
- Missions organize useful next actions.

XP and Mastery never share one visual bar or imply equivalence.

## XP policy

Low or zero XP for passive navigation. Higher awards for successful practice, no-hint completion, delayed review, debugging, explanation and real-context application. Duplicate farming must be capped or ignored.

XP changes are append-only transactions with reason and source event.

Implemented V1 XP policy:

- first successful `SUBMIT SOLUTION` for a code activity: 60 XP;
- first successful `SUBMIT SOLUTION` for a debug activity: 80 XP;
- repeated successful submissions for the same activity do not create additional XP transactions;
- `RUN` never awards XP and never records an official attempt.

## Consistency

Use weekly goals rather than punitive daily streak resets. Missing a day does not destroy long-term progress.

## Badges

Badges use technical certification language and objective unlock rules. Examples: First Bug, Debugger, No Shortcuts, I Can Explain, Returned Stronger.

Implemented V1 badges, ranks and missions are deterministic read models. They are displayed separately from concept mastery:

- rank is derived from total XP thresholds;
- badges are derived from XP transaction reasons and review/mistake state;
- missions point to continuation, due review and active mistake work;
- project application appears as a Today recommendation after review, mistakes and catalog continuation.

Persisted gamification projections:

- `badge_awards` records each earned badge once per owner with the criteria snapshot and `gamification.v1` source.
- `mission_progress` stores the current mission status, completion timestamp and criteria snapshot per owner.
- `mission_progress_events` appends a status-change record when a mission becomes available or complete.
- These records are exportable user-state projections. They do not certify mastery and do not feed the recommendation policy.

## Anti-patterns

- leaderboards in V1;
- random rewards;
- punishment for errors;
- huge rewards for clicking Complete;
- fantasy visual language that conflicts with the Design System;
- hidden manipulation of study priorities.
