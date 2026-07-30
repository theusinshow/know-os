# ADR 0015 — Use Vercel, Neon Postgres and Google OAuth for production preparation

Status: Accepted
Date: 2026-07-30

## Context

KNOW/OS V1 is complete for local use. ADR 0013 blocks any internet-accessible deployment until authentication, session handling, owner mapping, secret management and production database boundaries are explicitly decided.

The product remains single-user initially. Production preparation needs a minimal, reversible stack that supports the existing Next.js App Router application, Drizzle/PostgreSQL persistence and owner-scoped user state without adding multi-user product scope.

Official documentation checked during this decision:

- Auth.js Google provider uses the `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` environment variables.
- Auth.js deployment requires `AUTH_SECRET`.
- Google OAuth callback URLs must include the deployed domain and end with `/api/auth/callback/google`.
- Vercel supports environment variables per environment.
- Neon provides a managed Postgres integration path for Vercel.

## Decision

Prepare production around:

- Hosting: Vercel.
- Database: Neon Postgres.
- Authentication: Auth.js with Google OAuth.
- Session strategy: Auth.js JWT/session cookies for initial single-owner deployment.
- Initial access model: allow only configured Google account e-mail addresses through `KNOW_OS_ALLOWED_GOOGLE_EMAILS`.
- Owner mapping: authenticated allowed Google account resolves to `KNOW_OS_OWNER_ID`.
- Local development: keep an explicit local-owner fallback only when production auth variables are absent.

## Required environment variables

```text
DATABASE_URL=
APP_URL=
AUTH_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
KNOW_OS_ALLOWED_GOOGLE_EMAILS=
KNOW_OS_OWNER_ID=
LOG_LEVEL=
```

No real values may be committed.

## Implementation sequence

1. Update environment schema, `.env.example` and docs.
2. Add Auth.js and Google provider dependencies.
3. Add auth route and server-side auth helpers.
4. Add owner resolution that maps an allowed Google e-mail to `KNOW_OS_OWNER_ID`.
5. Protect private user-state pages and mutating/export/restore APIs in production mode.
6. Preserve local development flow without requiring OAuth when auth variables are absent.
7. Add tests for environment validation, owner resolution and protected boundaries.
8. Run the full validation gate before commit.

## Consequences

Vercel plus Neon keeps the production path close to the existing Next.js/PostgreSQL architecture. Google OAuth avoids introducing password storage. Restricting by e-mail keeps V1 single-owner while preserving a future path to multi-user accounts.

The implementation must not create Vercel projects, Neon databases, Google OAuth credentials, secrets or deployments without explicit user confirmation.

## Review trigger

Revisit before enabling multiple owners, organization accounts, public sign-up, paid plans, shared content publishing, external sync or any provider migration away from Vercel, Neon or Google OAuth.
