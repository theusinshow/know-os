# Tests

Phase 0 test harness:

- `tests/unit/` covers deterministic infrastructure such as design-token generation.
- `tests/integration/` covers runtime validation boundaries and safe infrastructure behavior.
- `tests/component/` covers accessible React shell composition with Testing Library.
- `tests/e2e/` covers Playwright smoke journeys against the local app shell.

As V1 features are implemented, add invariant tests from `docs/15-TESTING-STRATEGY.md` beside the affected layer.
