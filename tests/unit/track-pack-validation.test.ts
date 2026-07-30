import examplePack from "../../packs/examples/javascript-fundamentals.track.json";
import { describe, expect, it } from "vitest";

import { validateTrackPack } from "@/features/import/application/track-pack-validation";

describe("validateTrackPack", () => {
  it("accepts the approved example fixture and returns a deterministic content hash", () => {
    const first = validateTrackPack(examplePack);
    const second = validateTrackPack(examplePack);

    expect(first).toMatchObject({ ok: true });
    expect(second).toMatchObject({ ok: true });

    if (first.ok && second.ok) {
      expect(first.contentHash).toMatch(/^[a-f0-9]{64}$/);
      expect(first.contentHash).toBe(second.contentHash);
      expect(first.pack.track.modules[0]?.lessons[0]?.activities[0]?.type).toBe("code");
    }
  });

  it("rejects activity concept references that are not declared in the lesson", () => {
    const invalidPack = structuredClone(examplePack);
    invalidPack.track.modules[0].lessons[0].activities[0].conceptIds = ["missing-concept"];

    const result = validateTrackPack(invalidPack);

    expect(result).toMatchObject({
      ok: false,
      issues: [expect.objectContaining({ code: "missing_concept" })]
    });
  });
});
