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
| Response hardening | Next.js hides `X-Powered-By` and sends `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options` and `Permissions-Policy`. | `tests/e2e/security-headers.spec.ts` |
| Owner scoping | User-state repositories use the local owner ID boundary while imported content remains separate from user state. | Integration tests across attempts, progress, review, mistakes, projects and export snapshots |

## Remaining production gates

- No internet-accessible deployment is approved until an authentication/session ADR and threat review are completed.
- An enforced Content Security Policy should be designed with the selected hosting/runtime strategy. It must account for Next.js script/style requirements and the Programming Lab isolation boundary.
- Dependency vulnerability scanning should be added before public distribution.
- A real PostgreSQL environment must run migrations and health checks before any production deployment.
- Backup restore intentionally does not overwrite append-only user state in V1. A future destructive or merging restore needs a separate ADR, migration plan and tests.

## Result

V1 is acceptable for local development and local single-user evaluation under the current guardrails. It is not approved for public internet deployment.
