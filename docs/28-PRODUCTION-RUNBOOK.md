# 28 — Production Runbook

Date: 2026-07-30

## Status

This runbook prepares KNOW/OS for the selected production stack from ADR 0015:

- Vercel hosting.
- Neon Postgres.
- Auth.js with Google OAuth.

It does not authorize external resource creation, deployment or secret handling by an autonomous agent. Those actions require explicit user confirmation.

## Step 1 — GitHub source

Repository:

```text
https://github.com/theusinshow/know-os
```

Current branch:

```text
main
```

Before any deployment attempt:

```text
git status --short --branch
git log --oneline --decorate -1
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Step 2 — Neon Postgres

User action required:

1. Create or select a Neon project.
2. Create a database for KNOW/OS.
3. Copy the PostgreSQL connection string.
4. Store it as `DATABASE_URL` in Vercel project environment variables.

Do not commit the connection string.

Local validation, only after the user provides a disposable or intended target `DATABASE_URL`:

```text
pnpm db:migrate
```

`pnpm db:migrate` runs `drizzle-kit migrate` against the configured `DATABASE_URL`.

## Step 3 — Google OAuth

User action required:

1. Create Google OAuth credentials.
2. Add authorized redirect URIs:

```text
http://localhost:3000/api/auth/callback/google
https://<production-domain>/api/auth/callback/google
```

3. Store credentials in Vercel:

```text
AUTH_GOOGLE_ID
AUTH_GOOGLE_SECRET
```

Do not commit OAuth credentials.

## Step 4 — Auth.js secret and owner mapping

User action required:

1. Generate a cryptographically secure `AUTH_SECRET` with at least 32 characters.
2. Set Auth.js trusted-host handling for Vercel's reverse proxy:

```text
AUTH_TRUST_HOST=true
```

3. Store the allowed Google account e-mail list:

```text
KNOW_OS_ALLOWED_GOOGLE_EMAILS=owner@example.com
```

4. Store the owner mapping:

```text
KNOW_OS_OWNER_ID=production-owner
```

Only e-mails in `KNOW_OS_ALLOWED_GOOGLE_EMAILS` can access protected pages and APIs when Google OAuth is configured.

## Step 5 — Vercel project

User action required:

1. Import `theusinshow/know-os` into Vercel.
2. Configure environment variables for Production and Preview as appropriate.
3. Confirm that Vercel's system environment variables are enabled.
4. Do not deploy until the local production-readiness gate passes.

Required Vercel variables:

```text
DATABASE_URL
APP_URL
AUTH_SECRET
AUTH_TRUST_HOST
AUTH_GOOGLE_ID
AUTH_GOOGLE_SECRET
KNOW_OS_ALLOWED_GOOGLE_EMAILS
KNOW_OS_OWNER_ID
LOG_LEVEL
```

## Step 6 — Production-readiness gate

Run locally before deployment:

```text
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Run Playwright locally as smoke coverage, but remember it uses `DATABASE_URL=memory://local`:

```text
pnpm test:e2e
```

## Step 7 — Deployment validation

After the user explicitly authorizes deployment:

1. Deploy from Vercel.
2. Open `GET /api/health/db`.
3. Confirm unauthenticated protected pages redirect to Google sign-in.
4. Sign in with the allowed Google account.
5. Import the example Track Pack.
6. Run the JavaScript vertical slice.
7. Confirm export preview does not expose data to unauthenticated requests.

## Stop conditions

Stop immediately if:

- any secret would need to be pasted into repository files;
- Google OAuth callback URL is not known;
- `DATABASE_URL` target is ambiguous;
- migrations fail against Neon;
- protected API routes are accessible without an allowed Google session;
- deployment would publish before the user confirms external writes.
