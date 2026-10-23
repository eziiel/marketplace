import { test, expect } from "@playwright/test";

test.describe("Catálogo", () => {
  test("lista NFTs e exibe controles de busca/ordenação/paginação", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: "Catálogo de NFTs" }),
    ).toBeVisible();

    await expect(page.getByRole("link", { name: /Genesis NFT/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /Cyber Ape/ })).toBeVisible();

    await expect(page.getByPlaceholder("Buscar NFTs...")).toBeVisible();
    await expect(
      page.getByRole("navigation", { name: "Paginação do catálogo" }),
    ).toBeVisible();
    await expect(page.getByText("Página 1 de 1")).toBeVisible();
  });

  test("busca filtra os resultados e persiste após refresh", async ({
    page,
  }) => {
    await page.goto("/");

    await page.getByPlaceholder("Buscar NFTs...").fill("Cyber");
    await page.getByRole("button", { name: "Buscar" }).click();

    await expect(page).toHaveURL(/search=Cyber/);
    await expect(page.getByRole("link", { name: /Cyber Ape/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /Genesis NFT/ })).toHaveCount(0);

    await page.reload();
    await expect(page.getByRole("link", { name: /Cyber Ape/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /Genesis NFT/ })).toHaveCount(0);
  });

  test("ordenação por maior preço reordena a lista", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("link", { name: /ETH/ }).first()).toContainText(
      "Genesis NFT",
    );

    await page.getByRole("combobox").selectOption("price_desc");

    await expect(page).toHaveURL(/sort=price_desc/);
    await expect(page.getByRole("link", { name: /ETH/ }).first()).toContainText(
      "Cyber Ape",
    );
  });
});
