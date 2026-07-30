# Scripts

Repository automation scripts live here.

- `generate-design-tokens.mjs` reads `design-system/design-tokens.json` and writes `src/styles/generated/design-tokens.css`.

Scripts must be deterministic and callable from package scripts or CI. They must not read real secrets unless an approved workflow explicitly requires it.
