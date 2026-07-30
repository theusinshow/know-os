# 25 — Accessibility and Responsive Audit

Last updated: 2026-07-30

## Automated coverage

`tests/e2e/accessibility.spec.ts` audits implemented V1 routes on desktop Chromium and mobile Chrome:

- main navigation landmark is visible;
- main landmark is visible;
- each audited route exposes exactly one `h1`;
- page-level horizontal overflow is absent;
- the skip link is the first keyboard target on the portability surface and moves focus to `#main-content`.

Audited routes:

- `/`
- `/tracks`
- `/tracks/javascript`
- `/review`
- `/mistakes`
- `/projects`
- `/progress`
- `/knowledge-map`
- `/achievements`
- `/exports`

Latest focused command:

```text
pnpm exec playwright test tests/e2e/accessibility.spec.ts — passed, 4 tests across desktop Chromium and mobile Chrome.
```

## Manual audit limits

The automated audit does not replace a full assistive-technology pass. Before public deployment, perform keyboard-only review with real content volume, screen-reader smoke checks and color-contrast sampling against the final production theme.
