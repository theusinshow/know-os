export type StaticActivityChoice = Readonly<{
  label: string;
  isCorrect?: boolean;
  explanation?: string;
}>;

export type StaticActivityConfig = Readonly<{
  instructions?: string;
  hint?: string;
  answer?: string;
  explanation?: string;
  choices: StaticActivityChoice[];
}>;

type UnknownRecord = Record<string, unknown>;

export function parseStaticActivityConfig(config: unknown): StaticActivityConfig {
  const record = isRecord(config) ? config : {};
  const rawChoices = readArray(record.choices) ?? readArray(record.options) ?? [];

  return {
    instructions: readText(record.instructions) ?? readText(record.description),
    hint: readText(record.hint),
    answer: readText(record.answer) ?? readText(record.expected),
    explanation: readText(record.explanation) ?? readText(record.rationale),
    choices: rawChoices.map(normalizeChoice).filter((choice): choice is StaticActivityChoice => choice !== null)
  };
}

function normalizeChoice(choice: unknown): StaticActivityChoice | null {
  if (typeof choice === "string") {
    return readText(choice) ? { label: choice.trim() } : null;
  }

  if (!isRecord(choice)) {
    return null;
  }

  const label =
    readText(choice.label) ?? readText(choice.text) ?? readText(choice.value) ?? readText(choice.id) ?? readText(choice.title);

  if (!label) {
    return null;
  }

  return {
    label,
    isCorrect: typeof choice.correct === "boolean" ? choice.correct : undefined,
    explanation: readText(choice.explanation) ?? readText(choice.rationale)
  };
}

function readText(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

function readArray(value: unknown): unknown[] | undefined {
  return Array.isArray(value) ? value : undefined;
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
