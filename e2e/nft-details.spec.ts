import { test, expect } from "@playwright/test";

test.describe("Detalhes do NFT", () => {
  test("navega do catálogo para a página de detalhe", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: /Emerald Ape #042/ }).click();

    await expect(page).toHaveURL(/\/nfts\/1/);
    await expect(
      page.getByRole("heading", { name: "Emerald Ape #042" }),
    ).toBeVisible();

    const editions = page.getByRole("list", { name: "Edição:" });
    await expect(editions.locator('[aria-current="true"]')).toHaveText(
      "Genesis",
    );
    await expect(page.getByText("Disponíveis: 5")).toBeVisible();
    await expect(page.getByText("ID do token:")).toBeVisible();
    await expect(page.getByText("#0042", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Comprar" })).toBeEnabled();
    await expect(
      page.getByRole("button", { name: "Favoritar" }),
    ).toBeVisible();
  });

  test("galeria troca a imagem principal e abre o zoom", async ({ page }) => {
    await page.goto("/nfts/1");

    const thumbs = page.getByRole("list", { name: "Miniaturas" });
    await expect(thumbs.getByRole("button")).toHaveCount(3);

    await thumbs.getByRole("button", { name: "Imagem 2 de 3" }).click();
    await expect(
      thumbs.getByRole("button", { name: "Imagem 2 de 3" }),
    ).toHaveAttribute("aria-pressed", "true");

    await page.getByRole("button", { name: "Ampliar imagem" }).click();
    const dialog = page.getByRole("dialog", { name: /ampliado/ });
    await expect(dialog).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("abas mostram detalhes e avaliações de colecionadores", async ({
    page,
  }) => {
    await page.goto("/nfts/1");

    await expect(
      page.getByRole("tab", { name: "Detalhes do NFT" }),
    ).toHaveAttribute("aria-selected", "true");
    await expect(page.getByText("Rede:", { exact: true })).toBeVisible();

    await page
      .getByRole("tab", { name: /Avaliações de colecionadores \(19\)/ })
      .click();
    await expect(
      page.getByText(/de 5 · 19 avaliações de colecionadores/),
    ).toBeVisible();
  });

  test("acesso direto a um NFT existente funciona", async ({ page }) => {
    await page.goto("/nfts/2");

    await expect(page.getByRole("heading", { name: "Sage Nomad #009" })).toBeVisible();

    const editions = page.getByRole("list", { name: "Edição:" });
    await expect(editions.locator('[aria-current="true"]')).toHaveText("1/10");
  });

  test("NFT inexistente exibe mensagem de não encontrado", async ({ page }) => {
    await page.goto("/nfts/999");

    await expect(page.getByText("NFT não encontrado.")).toBeVisible();
  });
});
