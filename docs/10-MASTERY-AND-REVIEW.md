# 10 — Mastery and Review

## Mastery states

0. Unseen
1. Introduced
2. Understood
3. Practicing
4. Strong
5. Mastered

## Evidence

Evidence can include:

- concept content viewed;
- prediction answered;
- quiz result;
- code written;
- bug diagnosed;
- explanation produced;
- delayed review result;
- application in a new or project context.

Evidence has type, strength, timestamp, source and conditions such as hint usage.

## Deterministic policy

Mastery state is calculated from documented thresholds and evidence rules. The UI can explain why a concept has its current state. Policy versions are recorded so historical changes remain interpretable.

A concept should not become Mastered from one immediate activity. Delayed retrieval and transfer/application evidence are expected.

Initial implementation policy `mastery.v1`:

- no evidence: Unseen;
- immediate approved activity evidence: Understood at most;
- repeated or varied approved evidence: Practicing;
- delayed review plus varied evidence: Strong;
- Mastered requires delayed review, transfer/application evidence, at least three evidence records and sufficient accumulated strength.

## Review scheduling

Initial scheduling may use a simple deterministic interval model. Required fields include last reviewed time, next review time, review count, recent quality and current mastery.

Review policy must be replaceable behind a domain interface and covered by deterministic tests.

Initial implementation policy `review.v1`:

- first review is scheduled one day after official submission evidence;
- quality 0-2 schedules the next review after one day;
- quality 3 schedules after three days;
- quality 4 schedules after seven days;
- quality 5 schedules after fourteen days.

## Mistakes

Mistakes are categorized links to attempts. Repeated patterns can create practice recommendations. A corrected mistake remains in history and gains a resolved state rather than disappearing.

Initial mistake categories are `failed_check`, `runtime_error`, `timeout` and `output_limit`. Passing evidence for the same concept resolves active mistakes without deleting the original row.
