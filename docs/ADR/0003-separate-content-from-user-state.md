# ADR 0003 — Separate imported content from user state

Status: Accepted
Date: 2026-07-30

## Context

KNOW/OS needs a durable decision for this concern before implementation.

## Decision

Content updates must never overwrite attempts, notes, mastery evidence or review state.

## Consequences

Stable content IDs and explicit joins are mandatory; import logic is more deliberate.

## Review trigger

Revisit only when new evidence materially changes scale, security, product scope or implementation feasibility.
