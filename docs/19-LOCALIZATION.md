# 19 — Localization

## Initial language

The interface is Portuguese (`pt-BR`). Technical identifiers, code and database names remain English.

## Architecture

Do not hardcode visible copy deeply inside domain logic. Centralize interface messages so later localization does not require rewriting components.

## Dates and numbers

Store timestamps in UTC and format with locale/timezone-aware utilities. Avoid manual date string concatenation. Numeric formats depend on content type; programming examples may intentionally use language syntax rather than locale formatting.

## Pack content

Packs declare content language. A Track may be Portuguese while technical keywords and code remain English. Translation is not automatic in V1.
