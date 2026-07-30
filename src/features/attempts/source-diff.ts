export type SourceDiffLine = Readonly<{
  type: "unchanged" | "added" | "removed";
  text: string;
}>;

export function diffSourceLines(before: string, after: string): SourceDiffLine[] {
  const beforeLines = before.split("\n");
  const afterLines = after.split("\n");
  const table = buildLcsTable(beforeLines, afterLines);
  const result: SourceDiffLine[] = [];
  let beforeIndex = beforeLines.length;
  let afterIndex = afterLines.length;

  while (beforeIndex > 0 || afterIndex > 0) {
    if (
      beforeIndex > 0 &&
      afterIndex > 0 &&
      beforeLines[beforeIndex - 1] === afterLines[afterIndex - 1]
    ) {
      result.unshift({ type: "unchanged", text: beforeLines[beforeIndex - 1] ?? "" });
      beforeIndex -= 1;
      afterIndex -= 1;
      continue;
    }

    if (afterIndex > 0 && (beforeIndex === 0 || table[beforeIndex][afterIndex - 1] >= table[beforeIndex - 1][afterIndex])) {
      result.unshift({ type: "added", text: afterLines[afterIndex - 1] ?? "" });
      afterIndex -= 1;
      continue;
    }

    if (beforeIndex > 0) {
      result.unshift({ type: "removed", text: beforeLines[beforeIndex - 1] ?? "" });
      beforeIndex -= 1;
    }
  }

  return result;
}

function buildLcsTable(beforeLines: string[], afterLines: string[]) {
  const table = Array.from({ length: beforeLines.length + 1 }, () => Array(afterLines.length + 1).fill(0) as number[]);

  for (let beforeIndex = 1; beforeIndex <= beforeLines.length; beforeIndex += 1) {
    for (let afterIndex = 1; afterIndex <= afterLines.length; afterIndex += 1) {
      if (beforeLines[beforeIndex - 1] === afterLines[afterIndex - 1]) {
        table[beforeIndex][afterIndex] = table[beforeIndex - 1][afterIndex - 1] + 1;
      } else {
        table[beforeIndex][afterIndex] = Math.max(table[beforeIndex - 1][afterIndex], table[beforeIndex][afterIndex - 1]);
      }
    }
  }

  return table;
}
