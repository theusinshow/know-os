# 26 — Phase 6 Security Audit

Date: 2026-07-30

## Scope

This audit covers the implemented V1 local product surface: Pack import, JSON export/restore, learner code execution, owner-scoped learning state, application responses and local deployment readiness.

Production authentication, hosted infrastructure, billing, marketplace and public distribution remain out of V1 scope.

## Controls verified

| Area | Implemented control | Verification |
| --- | --- | --- |
| Learner code isolation | `RUN` and `SUBMIT SOLUTION` execute through the QuickJS child-process runtime adapter, never in the browser main context. | `tests/unit/javascript-runtime.test.ts`, `tests/integration/run-submit-boundary.test.ts`, `tests/e2e/vertical-slice.spec.ts` |
| RUN/SUBMIT boundary | `RUN` reports execution output but records no official Attempt, StudyEvent, concept evidence or XP. `SUBMIT SOLUTION` records append-only user state. | `tests/integration/run-submit-boundary.test.ts`, `tests/e2e/vertical-slice.spec.ts` |
| Import validation | Track Pack requests are size-limited before JSON parsing, Zod-validated, semantically checked and previewable before mutation. | `tests/unit/import-request.test.ts`, `tests/unit/track-pack-validation.test.ts`, `tests/unit/track-import-service.test.ts` |
| Import conflicts | Same stable ID/version with different content hashes returns a conflict and does not apply data. | `tests/unit/track-import-service.test.ts` |
| Export privacy | Backup, Progress and Teacher Context exports require explicit kind selection and return category previews plus privacy warnings. | `tests/unit/export-contracts.test.ts`, `/exports` page |
| Restore safety | Backup restore validates the export envelope, restores imported content manifests through the Pack importer and reports user-state categories without overwriting append-only state. | `tests/unit/restore-contracts.test.ts` |
| Secret redaction | Health checks return only status and timestamp. Connection URLs are parsed from environment but are not logged or returned by API routes. | `src/db/health.ts`, `src/app/api/health/db/route.ts` |
| Response hardening | Next.js hides `X-Powered-By` and sends `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy` and an enforced nonce-bearing CSP through `src/proxy.ts`. | `tests/unit/security-headers.test.ts`, `tests/e2e/security-headers.spec.ts` |
| Production dependency audit | Runtime dependency audit runs through `pnpm security:audit` (`pnpm audit --prod --audit-level moderate`) and currently reports no known production vulnerabilities after pnpm overrides for patched transitive versions. | `pnpm security:audit` |
| Owner scoping | User-state repositories use the local owner ID boundary while imported content remains separate from user state. | Integration tests across attempts, progress, review, mistakes, projects and export snapshots |

## Remaining production gates

- Authentication/session ADR 0015 and the Google OAuth allowlist are in place for the initial single-owner deployment.
- Runtime responses now use a per-request CSP nonce and no `script-src 'unsafe-inline'`. `script-src 'unsafe-eval'` is allowed only for the local Next.js development server; production CSP generation excludes it.
- Full dev dependency audit still reports a dev-only `eslint -> minimatch@3 -> brace-expansion` advisory. `brace-expansion@1.1.18` is pinned for compatibility; forcing `brace-expansion@5` breaks ESLint. This does not affect production dependency audit or runtime bundle but should be revisited when ESLint/minimatch publish a compatible patched path.
- A real PostgreSQL validation path now exists through `pnpm test:postgres`; it applies migrations in a disposable schema and validates import/RUN/SUBMIT/progress behavior.
- Backup restore intentionally does not overwrite append-only user state in V1. A future destructive or merging restore needs a separate ADR, migration plan and tests.

## Result

V1 is acceptable for protected single-owner production evaluation under the current guardrails. Broader public distribution still requires authenticated owner browser walkthrough/polish, public Pack release workflow decisions and continued dependency monitoring.
