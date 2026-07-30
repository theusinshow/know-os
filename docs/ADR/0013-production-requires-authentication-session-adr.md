# ADR 0013 — Require a dedicated authentication and session decision before production deployment

Status: Accepted
Date: 2026-07-30

## Context

V1 is intentionally single-user and owner-ready. The implemented local owner boundary uses `KNOW_OS_OWNER_ID` to keep imported content separate from owner-scoped learning state, but this is not a public authentication system.

The security architecture states that no internet-accessible production deployment is approved without a dedicated authentication/session ADR and threat review. Choosing an auth provider, session strategy or hosted identity model would be a durable product and security decision.

## Decision

Do not implement or imply production authentication in V1. Production deployment remains blocked until a future ADR selects:

- identity provider or local credential strategy;
- session storage and expiration policy;
- owner ID mapping;
- CSRF/session protection approach;
- deployment-specific secret management;
- threat review and acceptance tests.

Local development and CI may continue to use the deterministic `KNOW_OS_OWNER_ID` boundary.

## Consequences

The product can remain runnable and testable locally without inventing an auth system. Any public deployment request must stop for user confirmation and complete the authentication/session ADR first.

## Review trigger

Revisit when the product is prepared for internet-accessible hosting, multi-device sync, multi-user accounts, shared content publishing or any external integration that can read or mutate user state.
