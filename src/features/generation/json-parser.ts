export type GeneratedJsonParseResult =
  | Readonly<{ ok: true; value: unknown }>
  | Readonly<{ ok: false; code: "empty_response" | "invalid_json" | "markdown_wrapped"; message: string }>;

export function parseGeneratedJson(raw: string): GeneratedJsonParseResult {
  const trimmed = raw.trim();

  if (!trimmed) {
    return { ok: false, code: "empty_response", message: "Generation response was empty." };
  }

  if (trimmed.startsWith("```") || trimmed.endsWith("```")) {
    return { ok: false, code: "markdown_wrapped", message: "Generation response must be raw JSON without Markdown fences." };
  }

  try {
    return { ok: true, value: JSON.parse(trimmed) };
  } catch {
    return { ok: false, code: "invalid_json", message: "Generation response is not valid JSON." };
  }
}
