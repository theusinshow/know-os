# ADR 0001 — Use a modular monolith

Status: Accepted
Date: 2026-07-30

## Context

KNOW/OS needs a durable decision for this concern before implementation.

## Decision

Deploy one application while enforcing feature/domain boundaries. Microservices add operational cost before scale or team boundaries justify them.

## Consequences

Simpler local development and transactions; modules must be kept explicit to avoid a monolithic tangle.

## Review trigger

Revisit only when new evidence materially changes scale, security, product scope or implementation feasibility.
