# ADR 0006 — Keep attempts and study events append-only

Status: Accepted
Date: 2026-07-30

## Context

KNOW/OS needs a durable decision for this concern before implementation.

## Decision

Historical evidence is necessary for learning analysis, debugging and trust.

## Consequences

Corrections require new records/projections instead of simple updates.

## Review trigger

Revisit only when new evidence materially changes scale, security, product scope or implementation feasibility.
