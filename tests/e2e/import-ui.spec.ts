import { expect, test } from "@playwright/test";

test("imports the bundled example Track Pack through the product surface", async ({ page }) => {
  await page.goto("/import");

  await expect(page.getByRole("heading", { name: "Ativar catálogo" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Aplicar" })).toBeDisabled();

  await page.getByRole("button", { name: "Carregar exemplo" }).click();
  await expect(page.getByRole("status", { name: "Estado da importação" })).toContainText(
    /Preview válido|Pack já importado/
  );
  await expect(page.getByRole("region", { name: "Preview" })).toContainText("JavaScript");

  const applyButton = page.getByRole("button", { name: "Aplicar" });
  if (await applyButton.isEnabled()) {
    await applyButton.click();
    await expect(page.getByRole("status", { name: "Estado da importação" })).toContainText(
      /Pack aplicado|Pack já estava importado/
    );
    await expect(page.getByRole("status", { name: /Catálogo ativado|Sem alteração/ })).toBeVisible();
  }

  await page.goto("/tracks");
  await expect(page.getByRole("link", { name: /JavaScript/ }).first()).toBeVisible();
});
