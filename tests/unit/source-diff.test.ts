import { describe, expect, it } from "vitest";

import { diffSourceLines } from "@/features/attempts/source-diff";

describe("diffSourceLines", () => {
  it("computes a display-only line diff without mutating attempt data", () => {
    expect(diffSourceLines("const canOpen = false;", "const canOpen = documentExists && userAuthorized;")).toEqual([
      { type: "removed", text: "const canOpen = false;" },
      { type: "added", text: "const canOpen = documentExists && userAuthorized;" }
    ]);
  });

  it("preserves unchanged lines around additions and removals", () => {
    expect(diffSourceLines("const a = 1;\nconsole.log(a);", "const a = 2;\nconsole.log(a);")).toEqual([
      { type: "removed", text: "const a = 1;" },
      { type: "added", text: "const a = 2;" },
      { type: "unchanged", text: "console.log(a);" }
    ]);
  });
});
