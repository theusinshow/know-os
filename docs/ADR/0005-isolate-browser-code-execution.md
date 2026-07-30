# ADR 0005 — Isolate learner code execution

Status: Accepted
Date: 2026-07-30

## Context

KNOW/OS needs a durable decision for this concern before implementation.

## Decision

Executing untrusted learner code in the main UI or server process is unsafe and can damage reliability.

## Consequences

The runtime uses an adapter and isolated interpreter/worker with strict limits; extra implementation complexity is accepted.

## Review trigger

Revisit only when new evidence materially changes scale, security, product scope or implementation feasibility.
