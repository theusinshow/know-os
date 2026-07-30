# 27 — Deployment Preparation

Date: 2026-07-30

## Current status

KNOW/OS V1 is prepared for local development and CI validation. No production deployment is authorized in the current scope.

The repository has:

- reproducible pnpm install through `pnpm-lock.yaml`;
- Next.js App Router build with TypeScript strict mode;
- Drizzle migration files under `src/db/migrations`;
- environment validation for `DATABASE_URL`, `APP_URL`, `KNOW_OS_OWNER_ID` and `LOG_LEVEL`;
- CI for install, lint, typecheck, unit/integration tests and build;
- separate Playwright smoke workflow;
- baseline response security headers.

## Required local commands

```text
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

Do not treat Playwright as a production readiness test. It currently uses `DATABASE_URL=memory://local` through the Next dev server to validate the UI when PostgreSQL is unavailable.

## Required environment

| Variable | Required for local build | Required for production | Notes |
| --- | --- | --- | --- |
| `DATABASE_URL` | No | Yes | Must point to PostgreSQL for durable state. Never commit it. |
| `APP_URL` | No | Yes | Must match the deployed origin for callbacks, links and future auth. |
| `KNOW_OS_OWNER_ID` | No | Yes | Local default is `local-owner`; production needs an authenticated owner mapping. |
| `LOG_LEVEL` | No | No | Defaults to `info`. |

## Production blockers

Production remains blocked until all items below are resolved:

- authentication/session ADR accepted;
- owner identity mapping implemented and tested;
- PostgreSQL migrations executed in a real environment;
- secret management selected for hosting provider;
- enforced CSP selected and validated;
- dependency vulnerability scanning added;
- backup/export handling reviewed for the target storage and download path.

## Deployment policy

Autonomous agents may prepare local configuration and documentation. They must not deploy, publish, push secrets, create external infrastructure, or select an authentication provider without user confirmation.
