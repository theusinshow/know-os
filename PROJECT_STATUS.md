# KNOW/OS — Project Status

Last updated: 2026-07-30

## Current phase

`V1 PRODUCTION DEPLOYED — MANUAL OWNER LOGIN VALIDATION PENDING`

Phase 0 repository foundation is implemented and verified. The repository now contains a Next.js App Router scaffold with TypeScript strict mode, Tailwind/token generation, minimal accessible shell, Drizzle/PostgreSQL foundation, Zod validation, Vitest/Testing Library/Playwright smoke tests and GitHub Actions CI.

Phase 1 first vertical slice is implemented and verified: import Track Pack, browse Track and Lesson, open JavaScript activity, RUN code, SUBMIT solution, record Attempt, update simple progress and show History event.

Phase 2 learning core is implemented and verified: concept read models/pages, lesson block renderers, activity registry routing, persisted latest attempt feedback and navigation progress summaries.

Phase 3 programming lab is implemented and verified: explicit runtime contracts, clearer terminal/test feedback, display-only attempt diffs and a first debug activity path.

Phase 4 mastery, review and mistakes is implemented and verified.

Phase 5 projects and gamification is implemented and verified. The implemented surface includes optional project contexts, append-only XP, transparent ranks/badges/missions, an accessible knowledge map and project-aware Today recommendations.

Phase 6 portability and hardening is implemented and verified. The V1 local product now includes import preview/hardening, Backup/Progress/Teacher Context exports, non-destructive Backup restore for Pack manifests, accessibility/responsive audit coverage, baseline security headers, security audit documentation and deployment preparation within local-only guardrails.

Production deployment is live at `https://know-os.vercel.app` using the ADR 0015 stack: Vercel, Neon Postgres and Auth.js Google OAuth. Step 2 implementation includes the Auth.js Google foundation, production environment contract, central session guard and Neon/Vercel runbook. Neon migrations have been applied and unauthenticated production smoke checks pass. The sign-in surface now uses the custom `/auth/signin` page following the KNOW/OS Design System, and Google OAuth requests include `prompt=select_account` so account selection is explicit. After a Google `invalid_client` response, Vercel Production OAuth/Auth environment values were re-applied from ignored local values, production was redeployed and the Google page was verified without `invalid_client`. ADR 0014 keeps append-only user-state replay/merge out of V1 restore.

## Agent operating mode

`HIGH AUTONOMY WITH REPOSITORY GUARDRAILS`

Codex may progress through approved V1 roadmap phases without routine user confirmation, provided each phase gate passes and no stop condition in `AUTONOMY.md` applies.

## Approved

- Product name: `KNOW/OS`.
- Technical identifier and repository: `know-os`.
- Positioning: Personal Learning Operating System.
- Design System v2.2 with official logo and icon assets.
- Modular-monolith direction.
- PostgreSQL + Drizzle persistence direction.
- Generic learning core with programming as the first extension.
- Portable Pack architecture.
- JavaScript Programming Lab with isolated execution.
- Append-only attempts and study events.
- Deterministic concept mastery.
- Single-user now, ownership-ready for future multi-user evolution.
- Guarded autonomous execution protocol in `AUTONOMY.md`.

## Implemented in Phase 0

- Pinned pnpm dependency graph in `package.json` and `pnpm-lock.yaml`.
- Next.js App Router application shell with official `public/branding` lockup, skip link, navigation placeholders, main landmark and status region.
- Generated design-token CSS at `src/styles/generated/design-tokens.css` from `design-system/design-tokens.json`.
- Planned modular-monolith source directories with boundary README files.
- Drizzle configuration, database connection helper, schema placeholder and safe `GET /api/health/db` endpoint.
- Zod server-environment validation that treats absent/blank optional URLs as not configured.
- Unit, integration, component and Playwright smoke tests.
- Baseline CI workflow plus separate Playwright workflow.

## Implemented in Phase 1

- Minimal content/user-state Drizzle schema and generated migration for the vertical slice.
- Zod Track Pack validation, semantic validation, deterministic hashing and idempotent/conflict-aware import service.
- Drizzle-backed import repository tested against a migrated PGlite database.
- Disposable `memory://local` repository harness for Playwright/UI validation when no PostgreSQL service is available.
- Imported track, lesson and activity browsing routes.
- QuickJS child-process JavaScript runtime adapter with timeout/output limits.
- RUN API that executes code without recording an Attempt.
- SUBMIT API that evaluates deterministic tests, records one immutable Attempt, writes test results, updates simple progress and emits an append-only StudyEvent.
- Activity panel with editable code, RUN, SUBMIT SOLUTION, terminal output and test results.
- History route showing submitted activity events.
- ADR 0011 for the initial QuickJS runtime decision.

## Implemented in Phase 2

- Concept detail route at `/concepts/[conceptId]`.
- Catalog repository concept read model with imported lesson/activity relationships.
- Lesson concept links to concept pages.
- Explicit placeholder copy separating current progress from future deterministic mastery/review.
- Drizzle/PGlite integration test and Playwright coverage for concept navigation.
- Allowlisted lesson block renderer registry for text, code, concept, note, warning, example, prediction and summary blocks.
- Safe invalid/unsupported block surfaces that do not execute arbitrary imported UI payloads.
- Typed activity registry for code activity config parsing and rendering.
- Persisted latest Attempt feedback read model with stdout/stderr and test results.
- Activity panel initializes from the latest persisted Attempt after page reload while preserving RUN versus SUBMIT SOLUTION semantics.
- Lesson and track progress summaries derived from append-only Attempt evidence.
- Progress UI explicitly separates navigation/completion from future deterministic concept mastery.

## Implemented in Phase 3

- JavaScript runtime contract metadata with runtime version, timeout/output limits and blocked capability expectations.
- Runtime tests covering stdout, stderr, runtime errors, timeout, output limits and blocked DOM/network/process/window access.
- Activity feedback UI that separates runtime status/contract metadata, STDOUT, STDERR and automated test summaries.
- Display-only source diff from immutable submitted Attempt source against starter code.
- Debug activity type registered through the activity registry and example Track Pack fixture.
- RUN/SUBMIT boundaries preserved for both code and debug activities.

## Implemented in Phase 4

- Append-only `concept_evidence` table and ADR 0012 for concept-scoped evidence.
- SUBMIT writes concept evidence in the same transaction as Attempt creation.
- Deterministic `mastery.v1` policy with explainable concept page output.
- `review_schedules` projection and `review.v1` interval policy.
- `/review` page plus review completion API/action that appends delayed-review evidence and `review_completed` StudyEvent.
- `mistakes` table, categorization rules, active/resolved state and `/mistakes` page.
- Deterministic Today recommendations ordered by due review, active mistake and catalog continuation.

## Implemented in Phase 5

- Optional `project_contexts` with joins to imported `concepts` and `activities`.
- `/projects` page that keeps project flow optional and reports linked concept/activity counts.
- Append-only `xp_transactions` ledger.
- First successful `SUBMIT SOLUTION` awards XP once per activity; `RUN` awards nothing and records no attempt.
- `/progress` page with total XP and transaction history.
- Deterministic rank, badge and mission read models displayed on `/achievements`.
- `/knowledge-map` page with a complete list-first fallback for imported concept relationships.
- Today recommendations include project application suggestions after review, mistake and catalog continuation priorities.

## Implemented in Phase 6

- Track Pack import size limit, preview endpoint and content-hash conflict reporting.
- Explicit Backup, Progress and Teacher Context export contracts with category previews and privacy warnings.
- `/exports` portability surface.
- Backup restore preview and non-destructive Pack manifest application through `/api/restore/preview` and `/api/restore`.
- ADR 0014 documenting why append-only user-state replay/merge is not automatic in V1 restore.
- Accessibility and responsive audit documentation plus Playwright coverage for landmarks, headings, skip link and page overflow across implemented V1 routes.
- Baseline response security headers and Playwright header smoke coverage.
- Security audit and deployment preparation documents.
- ADR 0013 documenting the authentication/session stop condition before public deployment.

## Not implemented

Manual owner login validation after the OAuth environment repair, external sync, full user-state replay/merge restore, persisted badge award tables and persisted mission progress tables.

## Verification

Latest Phase 0 gate results:

```text
pnpm install --frozen-lockfile — passed, already up to date.
pnpm lint — passed.
pnpm typecheck — passed.
pnpm test — passed, 3 files and 4 tests.
pnpm build — passed, generated 150 tokens and built `/`, `/_not-found`, `/api/health/db`.
pnpm exec playwright install chromium — passed.
pnpm test:e2e — passed, 4 tests across desktop Chromium and mobile Chrome profiles.
pnpm db:generate — passed, generated src/db/migrations/0000_small_vargas.sql for 14 tables.
pnpm test after Phase 1 import foundation — passed, 5 files and 9 tests.
pnpm build after Phase 1 import foundation — passed, built /api/import/track.
pnpm test after Phase 1 completion — passed, 8 files and 17 tests.
pnpm test:e2e after Phase 1 completion — passed, 6 tests including import to history vertical slice on desktop and mobile.
pnpm build after Phase 1 completion — passed, built activity RUN/SUBMIT APIs, import API, tracks, lessons and history.
pnpm test after Phase 2 concept increment — passed, 9 files and 18 tests.
pnpm test:e2e after Phase 2 concept increment — passed, 6 tests including concept navigation.
pnpm build after Phase 2 concept increment — passed, built /concepts/[conceptId].
pnpm test after Phase 2 block renderer increment — passed, 10 files and 21 tests.
pnpm test:e2e after Phase 2 block renderer increment — passed, 6 tests.
pnpm build after Phase 2 block renderer increment — passed.
pnpm lint after Phase 2 activity registry increment — passed.
pnpm typecheck after Phase 2 activity registry increment — passed.
pnpm test after Phase 2 activity registry increment — passed, 11 files and 24 tests.
pnpm test:e2e after Phase 2 activity registry increment — passed, 6 tests including persisted latest attempt feedback after reload.
pnpm build after Phase 2 activity registry increment — passed.
pnpm lint after Phase 2 progress increment — passed.
pnpm typecheck after Phase 2 progress increment — passed.
pnpm test after Phase 2 progress increment — passed, 13 files and 26 tests.
pnpm test:e2e after Phase 2 progress increment — passed, 6 tests including lesson and track progress UI.
pnpm build after Phase 2 progress increment — passed.
pnpm install --frozen-lockfile for Phase 2 gate — passed, already up to date.
pnpm lint for Phase 2 gate — passed.
pnpm typecheck for Phase 2 gate — passed.
pnpm test for Phase 2 gate — passed, 13 files and 26 tests.
pnpm build for Phase 2 gate — passed.
pnpm test:e2e for Phase 2 gate — passed, 6 tests.
git status --short --branch for Phase 2 checkpoint — failed because this checkout has no .git directory.
pnpm typecheck after Phase 3 runtime contract hardening — passed.
pnpm exec vitest run tests/unit/javascript-runtime.test.ts after Phase 3 runtime contract hardening — passed, 1 file and 7 tests.
pnpm lint after Phase 3 runtime contract hardening — passed.
pnpm test after Phase 3 runtime contract hardening — passed, 13 files and 30 tests.
pnpm build after Phase 3 runtime contract hardening — passed.
pnpm typecheck after Phase 3 terminal/test feedback UI — passed.
pnpm exec vitest run tests/component/activity-registry.test.tsx after Phase 3 terminal/test feedback UI — passed, 1 file and 2 tests.
pnpm lint after Phase 3 terminal/test feedback UI — passed.
pnpm test after Phase 3 terminal/test feedback UI — passed, 13 files and 30 tests.
pnpm build after Phase 3 terminal/test feedback UI — passed.
pnpm test:e2e after Phase 3 terminal/test feedback UI — passed, 6 tests.
pnpm typecheck after Phase 3 attempt diff read model/UI — passed.
pnpm exec vitest run tests/unit/source-diff.test.ts tests/component/activity-registry.test.tsx after Phase 3 attempt diff read model/UI — passed, 2 files and 4 tests.
pnpm lint after Phase 3 attempt diff read model/UI — passed.
pnpm test after Phase 3 attempt diff read model/UI — passed, 14 files and 32 tests.
pnpm build after Phase 3 attempt diff read model/UI — passed.
pnpm test:e2e after Phase 3 attempt diff read model/UI — passed, 6 tests including explicit diff assertions.
pnpm typecheck after Phase 3 debug activity registry path — passed.
pnpm test after Phase 3 debug activity registry path — passed, 14 files and 32 tests.
pnpm lint after Phase 3 debug activity registry path — passed.
pnpm build after Phase 3 debug activity registry path — passed.
pnpm test:e2e after Phase 3 debug activity registry path — passed, 6 tests including code and debug activity submissions.
pnpm install --frozen-lockfile for Phase 3 gate — passed, already up to date.
pnpm lint for Phase 3 gate — passed.
pnpm typecheck for Phase 3 gate — passed.
pnpm test for Phase 3 gate — passed, 14 files and 32 tests.
pnpm build for Phase 3 gate — passed.
pnpm test:e2e for Phase 3 gate — passed, 6 tests.
git status --short --branch for Phase 3 checkpoint — failed because this checkout has no .git directory.
pnpm db:generate after Phase 4 evidence model — passed, generated src/db/migrations/0001_wet_skin.sql.
pnpm test after Phase 4 evidence model — passed, 14 files and 32 tests.
pnpm test after Phase 4 mastery policy — passed, 15 files and 35 tests.
pnpm build after Phase 4 mastery policy — passed.
pnpm test:e2e after Phase 4 mastery policy — passed, 2 focused vertical-slice tests.
pnpm db:generate after Phase 4 review scheduling — passed, generated src/db/migrations/0002_oval_secret_warriors.sql.
pnpm test after Phase 4 review scheduling — passed, 17 files and 39 tests.
pnpm build after Phase 4 review scheduling — passed after marking /review dynamic.
pnpm test:e2e after Phase 4 review scheduling — passed, 6 tests.
pnpm db:generate after Phase 4 mistake categorization — passed, generated src/db/migrations/0003_classy_wrecker.sql.
pnpm test after Phase 4 mistake categorization — passed, 19 files and 43 tests after setting Vitest testTimeout to 10000 for migration-backed integration tests.
pnpm build after Phase 4 mistake categorization — passed.
pnpm test:e2e after Phase 4 mistake categorization — passed, 6 tests after stabilizing lesson route navigation.
pnpm test after Phase 4 recommendation rules — passed, 20 files and 45 tests.
pnpm build after Phase 4 recommendation rules — passed.
pnpm test:e2e after Phase 4 recommendation rules — passed, 6 tests after scoping the shell status assertion.
pnpm install --frozen-lockfile for Phase 4 gate — passed, already up to date.
pnpm lint for Phase 4 gate — passed.
pnpm typecheck for Phase 4 gate — passed.
pnpm test for Phase 4 gate — passed, 20 files and 45 tests.
pnpm build for Phase 4 gate — passed.
pnpm test:e2e for Phase 4 gate — passed, 6 tests.
git status --short --branch for Phase 4 checkpoint — failed because this checkout has no .git directory.
pnpm db:generate after Phase 5 project contexts — passed, generated src/db/migrations/0004_misty_wong.sql.
pnpm test after Phase 5 project contexts — passed, 21 files and 46 tests.
pnpm build after Phase 5 project contexts — passed.
pnpm test:e2e after Phase 5 project contexts — passed, 6 tests.
pnpm db:generate after Phase 5 XP ledger — passed, generated src/db/migrations/0005_greedy_dreadnoughts.sql.
pnpm test after Phase 5 XP ledger — passed, 21 files and 47 tests.
pnpm build after Phase 5 XP ledger — passed.
pnpm test:e2e after Phase 5 XP ledger — passed, 6 tests.
pnpm test after Phase 5 achievements — passed, 22 files and 49 tests.
pnpm build after Phase 5 achievements — passed.
pnpm test:e2e after Phase 5 achievements — passed, 6 tests.
pnpm test after Phase 5 knowledge map — passed, 22 files and 49 tests.
pnpm build after Phase 5 knowledge map — passed.
pnpm test:e2e after Phase 5 knowledge map — passed, 6 tests.
pnpm test after Phase 5 project-aware recommendations — passed, 22 files and 50 tests.
pnpm build after Phase 5 project-aware recommendations — passed.
pnpm test:e2e after Phase 5 project-aware recommendations — passed, 6 tests.
pnpm db:generate after Phase 5 project activity links — passed, generated src/db/migrations/0006_curved_deadpool.sql.
pnpm test after Phase 5 project activity links — passed, 22 files and 51 tests.
pnpm build after Phase 5 project activity links — passed.
pnpm test:e2e after Phase 5 project activity links — passed, 6 tests.
pnpm install --frozen-lockfile for Phase 5 gate — passed, already up to date.
pnpm lint for Phase 5 gate — passed.
pnpm typecheck for Phase 5 gate — passed.
pnpm test for Phase 5 gate — passed, 22 files and 51 tests.
pnpm build for Phase 5 gate — passed.
pnpm test:e2e for Phase 5 gate — passed, 6 tests.
git status --short --branch for Phase 5 checkpoint — failed because this checkout has no .git directory.
pnpm install --frozen-lockfile after Phase 6 import hardening — passed, already up to date.
pnpm test after Phase 6 import hardening — passed, 23 files and 55 tests.
pnpm build after Phase 6 import hardening — passed.
pnpm test:e2e after Phase 6 import hardening — passed, 6 tests.
pnpm test after Phase 6 export contracts — passed, 24 files and 57 tests.
pnpm build after Phase 6 export contracts — passed.
pnpm test:e2e after Phase 6 export contracts — passed, 6 tests.
pnpm test after Phase 6 restore application — passed, 25 files and 60 tests.
pnpm build after Phase 6 restore application — passed.
pnpm test:e2e after Phase 6 restore application — passed, 6 tests.
pnpm exec playwright test tests/e2e/accessibility.spec.ts — passed, 4 tests.
pnpm test:e2e after accessibility stabilization — passed, 10 tests using 1 worker.
pnpm exec playwright test tests/e2e/security-headers.spec.ts — passed, 2 tests.
pnpm install --frozen-lockfile for final V1 gate — passed, already up to date.
pnpm lint for final V1 gate — passed.
pnpm typecheck for final V1 gate — passed.
pnpm test for final V1 gate — passed, 25 files and 60 tests.
pnpm build for final V1 gate — passed, generated 150 design tokens and built all implemented routes.
pnpm test:e2e for final V1 gate — passed, 12 tests across desktop Chromium and mobile Chrome.
git status --short --branch for final checkpoint — failed because this checkout has no .git directory.
pnpm install --frozen-lockfile for Step 2 final gate — passed, already up to date.
pnpm lint for Step 2 final gate — passed.
pnpm typecheck for Step 2 final gate — passed.
pnpm test for Step 2 final gate — passed, 28 files and 70 tests.
pnpm build for Step 2 final gate — passed, generated 150 design tokens and built Auth.js route plus middleware/proxy.
pnpm test:e2e for Step 2 final gate — passed, 12 tests across desktop Chromium and mobile Chrome.
git push origin main for Step 2 — passed, pushed main from bc146fa to 7adf18e.
pnpm db:migrate against Neon Postgres — passed, migrations applied successfully.
pnpm build with `.env.local` production values — passed.
vercel link --yes --project know-os — passed, linked to `theusinshows-projects/know-os`.
vercel --prod --yes — passed, deployed and aliased production to `https://know-os.vercel.app`.
production smoke `/api/health/db` — passed, 200 OK.
production smoke `/` — passed, 307 redirect to `/api/auth/signin`.
production smoke `/api/export/preview` — passed, 401 unauthenticated.
production smoke `/api/auth/signin` — initially 400 until `AUTH_TRUST_HOST=true` was added; redeploy passed and endpoint returned 200 OK.
pnpm typecheck after custom sign-in and Google account-selection config — passed.
pnpm exec vitest run tests/unit/google-oauth.test.ts tests/unit/session-guard.test.ts — passed, 2 files and 5 tests.
pnpm exec playwright test tests/e2e/auth.spec.ts — passed, 2 tests across desktop Chromium and mobile Chrome.
pnpm lint for custom sign-in gate — passed.
pnpm typecheck for custom sign-in gate — passed.
pnpm test for custom sign-in gate — passed, 29 files and 72 tests.
pnpm build for custom sign-in gate — passed, `/auth/signin` built as a dynamic route.
pnpm test:e2e for custom sign-in gate — passed, 14 Playwright tests across desktop Chromium and mobile Chrome.
git commit -m "Add custom Google sign-in surface" — passed, commit `dc236a3`.
git push origin main — passed, pushed `dc236a3`.
vercel --prod --yes after custom sign-in — passed, deployment ready and aliased to `https://know-os.vercel.app`.
production smoke `/api/health/db` after custom sign-in — passed, 200 OK.
production smoke `/` after custom sign-in — passed, 307 redirect to `/auth/signin`.
production smoke `/auth/signin` after custom sign-in — passed, 200 OK.
production smoke `/api/export/preview` after custom sign-in — passed, 401 unauthenticated.
production Google OAuth redirect request after custom sign-in — passed, observed `accounts.google.com` request with `prompt=select_account`.
```

Do not run `pnpm typecheck` concurrently with `pnpm build`; Next mutates generated `.next` types during build.

## Next milestone

Complete manual browser validation: sign in at `https://know-os.vercel.app` with the allowed Google account, confirm the account chooser appears, import the example Track Pack, run `RUN`, submit with `SUBMIT SOLUTION`, then verify history/export behavior.

## Risk register

- Browser code execution is isolated through the current QuickJS child-process adapter, but any broader runtime support needs a fresh threat review.
- Pack versioning must be finalized before public content distribution.
- Production authentication is configured for Google OAuth with e-mail allowlist; manual sign-in with the allowed account remains to be validated in a browser session.
- Gamification must not distort mastery or reward empty activity.
- High autonomy must remain bounded to the repository and approved V1 scope.
- Local checkpoint commits are now available after Git initialization. External push still requires user confirmation.
- Playwright uses port `3210`; port `3000` was already serving another local app during validation.
- No real local PostgreSQL service is available outside `.env.local`; production database is Neon and destructive writes require explicit confirmation.
- Playwright uses `memory://local` because PGlite works for Vitest/Drizzle integration but cannot be bundled reliably inside the Next dev server.
- Backup restore applies Pack manifests only in V1. User-state replay/merge is intentionally blocked by ADR 0014 until a conflict-safe append-only restore policy exists.

## NEXT ACTION

Complete manual browser validation: sign in at `https://know-os.vercel.app` with the allowed Google account, confirm the account chooser appears, import the example Track Pack, run `RUN`, submit with `SUBMIT SOLUTION`, then verify history/export behavior.
