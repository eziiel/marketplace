import { test, expect } from "@playwright/test";

test.describe("Detalhes do NFT", () => {
  test("navega do catálogo para a página de detalhe", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: /Genesis NFT/ }).click();

    await expect(page).toHaveURL(/\/nfts\/1/);
    await expect(
      page.getByRole("heading", { name: "Genesis NFT" }),
    ).toBeVisible();
    await expect(page.getByText("Edição: Genesis")).toBeVisible();
    await expect(page.getByText("Disponíveis: 5")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Adicionar ao carrinho" }),
    ).toBeEnabled();
  });

  test("acesso direto a um NFT existente funciona", async ({ page }) => {
    await page.goto("/nfts/2");

    await expect(page.getByRole("heading", { name: "Cyber Ape" })).toBeVisible();
    await expect(page.getByText("Edição: Cyber")).toBeVisible();
  });

  test("NFT inexistente exibe mensagem de não encontrado", async ({ page }) => {
    await page.goto("/nfts/999");

    await expect(page.getByText("NFT não encontrado.")).toBeVisible();
  });
});
