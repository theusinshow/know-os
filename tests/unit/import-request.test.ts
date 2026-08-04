import { describe, expect, it } from "vitest";

import { MAX_TRACK_PACK_BYTES, readJsonRequestWithLimit } from "@/features/import/application/import-request";

describe("readJsonRequestWithLimit", () => {
  it("rejects requests larger than the configured limit before parsing", async () => {
    const request = new Request("http://local.test/import", {
      method: "POST",
      headers: { "content-length": "12" },
      body: "{}"
    });

    await expect(readJsonRequestWithLimit(request, 4)).resolves.toMatchObject({
      ok: false,
      code: "payload_too_large",
      maxBytes: 4,
      byteLength: 12
    });
  });

  it("returns invalid_json for malformed payloads within the size limit", async () => {
    const request = new Request("http://local.test/import", {
      method: "POST",
      body: "{"
    });

    await expect(readJsonRequestWithLimit(request, 4)).resolves.toMatchObject({
      ok: false,
      code: "invalid_json"
    });
  });

  it("keeps the default Track Pack import limit at one MiB for complete generated tracks", () => {
    expect(MAX_TRACK_PACK_BYTES).toBe(1024 * 1024);
  });
});
