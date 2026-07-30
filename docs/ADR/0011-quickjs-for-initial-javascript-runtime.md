# ADR 0011 — Use QuickJS for the initial JavaScript runtime adapter

Status: Accepted
Date: 2026-07-30

## Context

Phase 1 needs a JavaScript runtime for `RUN` and `SUBMIT SOLUTION`. The repository forbids executing learner code in the browser main context, the Next.js application VM, or through direct `eval`/`new Function` in application code.

## Decision

Use `quickjs-emscripten` as the initial JavaScript runtime adapter. Learner code runs inside a QuickJS WASM context with explicit host bindings for output capture, an execution timeout and an output-size limit.

## Consequences

The first slice can validate deterministic execution and RUN/SUBMIT separation without depending on browser DOM execution or Node's ambient globals. The adapter still needs hardening in Phase 3 for worker termination, richer test isolation, resource measurement and broader escape analysis.

## Review trigger

Revisit before expanding the Programming Lab beyond the Phase 1 vertical slice, before enabling untrusted long-running code, or if QuickJS cannot support required JavaScript semantics.
