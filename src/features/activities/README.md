# Activities

Activity registry and renderers live here. `RUN` and `SUBMIT SOLUTION` semantics must stay distinct:

- `RUN` evaluates learner code and never records an official attempt.
- `SUBMIT SOLUTION` evaluates learner code, appends an Attempt, appends a StudyEvent and updates deterministic progress projections only on pass.
- Renderers must be allowlisted by activity type and must not execute imported UI payloads.
