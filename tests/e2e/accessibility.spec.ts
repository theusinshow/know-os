import { readFile } from "node:fs/promises";
import path from "node:path";

import { expect, test } from "@playwright/test";

const auditedRoutes = [
  "/",
  "/import",
  "/tracks",
  "/tracks/javascript",
  "/review",
  "/mistakes",
  "/projects",
  "/progress",
  "/knowledge-map",
  "/achievements",
  "/exports"
];

test("implemented V1 routes expose landmarks, headings and responsive page bounds", async ({ page, request }) => {
  test.setTimeout(60_000);

  const packPath = path.join(process.cwd(), "packs", "examples", "javascript-fundamentals.track.json");
  const pack = JSON.parse(await readFile(packPath, "utf8"));
  await request.post("/api/import/track", { data: pack });

  for (const route of auditedRoutes) {
    await page.goto(route);

    await expect(page.getByRole("navigation", { name: "Navegação principal" })).toBeVisible();
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.locator("h1")).toHaveCount(1);

    const hasPageOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
    );
    expect(hasPageOverflow, `${route} should not create page-level horizontal overflow`).toBe(false);
  }
});

test("skip link remains first keyboard target on portability surfaces", async ({ page }) => {
  await page.goto("/exports");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Pular para o conteúdo principal" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();
});
