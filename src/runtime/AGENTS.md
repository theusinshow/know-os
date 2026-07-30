# Runtime Rules

Learner code is untrusted.

- Do not execute learner code with `eval`, `new Function`, browser main-window scripts, the Next.js server VM or database-side execution.
- Runtime adapters must enforce timeout and output limits.
- Runtime outputs are learning data, not application exceptions.
- Network, DOM access and ambient secrets must not be exposed to learner code.
- Add security-focused tests for every new runtime capability.
