# ADR 0002 — Use PostgreSQL with Drizzle ORM

Status: Accepted
Date: 2026-07-30

## Context

KNOW/OS needs a durable decision for this concern before implementation.

## Decision

The domain requires relational integrity, transactions, JSONB flexibility and migration control. Drizzle keeps schemas close to TypeScript while preserving SQL visibility.

## Consequences

A PostgreSQL service is required; migrations and repository boundaries must be tested.

## Review trigger

Revisit only when new evidence materially changes scale, security, product scope or implementation feasibility.
