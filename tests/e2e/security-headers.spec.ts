import { expect, test } from "@playwright/test";

test("application responses include baseline security headers", async ({ request }) => {
  const response = await request.get("/");

  expect(response.headers()["x-content-type-options"]).toBe("nosniff");
  expect(response.headers()["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(response.headers()["x-frame-options"]).toBe("DENY");
  expect(response.headers()["permissions-policy"]).toContain("camera=()");
  expect(response.headers()["content-security-policy"]).toContain("default-src 'self'");
  expect(response.headers()["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(response.headers()["content-security-policy"]).toContain("object-src 'none'");
  expect(response.headers()["content-security-policy"]).toContain("https://accounts.google.com");
  expect(response.headers()["x-powered-by"]).toBeUndefined();
});
