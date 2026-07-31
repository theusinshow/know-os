# Generation

Provider-optional content generation contracts for Manual Copy/Paste and DeepSeek.

The generation feature must produce validated Pack JSON before import. Model/manual output is never imported directly; later increments route it through the same parser, schema validator, semantic validator, preview/diff and atomic importer used by trusted Pack flows.
