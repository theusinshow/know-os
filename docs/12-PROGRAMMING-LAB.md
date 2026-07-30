# 12 — Programming Lab Architecture

The normative interaction specification lives in `design-system/PROGRAMMING_LAB.md`. This document defines technical boundaries.

## Initial runtime

V1 supports JavaScript only. TypeScript, Python, SQL and shell execution are future extensions.

## Runtime boundary

Learner code must execute through a `CodeRuntime` adapter in an isolated context. It must not execute in the React/Next.js main window, server process or database process.

Required controls:

- no DOM access;
- no ambient application secrets;
- network disabled or explicitly blocked;
- execution timeout;
- output-size limit;
- deterministic capture of stdout and stderr;
- termination on runaway execution;
- serialized input/output boundary;
- runtime version recorded with official submissions.

A sandboxed Web Worker backed by a dedicated interpreter such as a WASM JavaScript runtime is preferred over direct `eval` or `new Function` in application code. Final library selection requires implementation validation.

## RUN

RUN is exploratory. It creates an `ExecutionRun`, displays output and does not create an Attempt, affect mastery or award XP.

## SUBMIT SOLUTION

Submission re-runs through the controlled evaluator, executes declared tests, records an immutable Attempt and emits relevant study events. It may produce mastery evidence and XP.

## Tests

Public tests may be visible. Hidden tests can exist but feedback must remain educational and not misleading. Test definitions are versioned with the activity.
