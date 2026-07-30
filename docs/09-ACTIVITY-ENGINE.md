# 09 — Activity Engine

## Contract

Every activity type provides:

- renderer;
- validated configuration;
- response model;
- validator/scorer;
- feedback model;
- evidence mapping;
- accessibility behavior.

## Initial types

- prediction
- multiple-choice
- explain
- complete-code
- code
- debug
- project-challenge

Future types can include SQL, terminal, diagram, calculation, flashcard and architecture activities without changing the core Attempt model.

## Hints

Hints are progressive:

1. direction;
2. relevant concept;
3. near-solution guidance;
4. full solution only when permitted.

Hint use is recorded as evidence metadata. It may affect XP or mastery evidence strength but must not erase a successful result.

## Attempts

An Attempt stores response, outcome, timing, hint usage, attempt number, evaluator version and relevant output. It is immutable.

## Validation

Deterministic validation is preferred. Free-text explanations may initially use self-check or rubric-assisted review without making an AI service mandatory.
