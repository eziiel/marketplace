import { test, expect, type Page } from "@playwright/test";
import { chooseOption } from "./select";

function results(page: Page) {
  return page.getByRole("list", { name: "Resultados do catálogo" });
}

function cards(page: Page) {
  return results(page).getByRole("listitem");
}

function pagination(page: Page) {
  return page.getByRole("navigation", { name: "Paginação do catálogo" });
}

function count(page: Page) {
  return page.getByText(/^\d+ NFTs? encontrados?$/);
}

async function firstCard(page: Page) {
  return results(page).getByRole("link").first();
}

test.describe("Catálogo", () => {
  test("lista NFTs com abas, ordenação e paginação numerada", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(
      page.getByRole("link", { name: /Emerald Ape #042/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Sage Nomad #009/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Todos os NFTs" }),
    ).toHaveAttribute("aria-current", "page");
    await expect(
      page.getByRole("combobox", { name: /Ordenar por/ }),
    ).toHaveText("Listados recentemente");

    await expect(pagination(page)).toBeVisible();
    await expect(
      pagination(page).getByRole("button", { name: "Página 1", exact: true }),
    ).toHaveAttribute("aria-current", "page");

    await pagination(page)
      .getByRole("button", { name: "Página 2", exact: true })
      .click();

    await expect(page).toHaveURL(/page=2/);
    await expect(
      page.getByRole("link", { name: /Emerald Ape #042/ }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("link", { name: /Jade Scholar #301/ }),
    ).toBeVisible();

    await page.goBack();

    await expect(
      page.getByRole("link", { name: /Emerald Ape #042/ }),
    ).toBeVisible();
  });

  test("busca pelo header filtra os resultados e persiste após refresh", async ({
    page,
  }) => {
    await page.goto("/");

    await page.getByRole("button", { name: "Abrir busca" }).click();
    await page.getByPlaceholder("Buscar NFTs...").fill("Sage");
    await page.getByRole("button", { name: "Buscar" }).click();

    await expect(page).toHaveURL(/search=Sage/);
    await expect(
      page.getByRole("link", { name: /Sage Nomad #009/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Emerald Ape #042/ }),
    ).toHaveCount(0);

    await page.reload();

    await expect(
      page.getByRole("link", { name: /Sage Nomad #009/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Emerald Ape #042/ }),
    ).toHaveCount(0);
    await expect(page.getByPlaceholder("Buscar NFTs...")).toHaveValue("Sage");
  });

  test("ordenação por preço reordena a lista", async ({ page }) => {
    await page.goto("/");

    await chooseOption(page, "Ordenar por", "Maior preço");

    await expect(page).toHaveURL(/sort=price_desc/);
    await expect(results(page).getByRole("link").first()).toContainText(
      "Onyx Curator #001",
    );

    await chooseOption(page, "Ordenar por", "Menor preço");

    await expect(page).toHaveURL(/sort=price_asc/);
    await expect(results(page).getByRole("link").first()).toContainText(
      "Golden Spark #013",
    );
  });

  test("filtro de coleção entra na URL e reinicia a paginação", async ({
    page,
  }) => {
    await page.goto("/?page=2");

    await expect(page).toHaveURL(/page=2/);

    await page.getByRole("button", { name: /^Música/ }).click();

    await expect
      .poll(() => decodeURIComponent(page.url()))
      .toContain("collection=Música");
    await expect(page).toHaveURL(/page=1/);
    await expect(cards(page)).toHaveCount(7);

    await page.getByRole("button", { name: /^Música/ }).click();

    await expect(page).not.toHaveURL(/collection=/);
  });

  test("exibe a contagem de resultados do catálogo completo", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(count(page)).toHaveText("36 NFTs encontrados");
    await expect(cards(page)).toHaveCount(9);
  });

  test("filtro por rede entra na URL e pagina dentro do recorte", async ({
    page,
  }) => {
    await page.goto("/");

    await page.getByRole("button", { name: /^Ethereum/ }).click();

    await expect(page).toHaveURL(/network=ethereum/);
    await expect(count(page)).toHaveText("15 NFTs encontrados");
    await expect(cards(page)).toHaveCount(9);

    await pagination(page)
      .getByRole("button", { name: "Página 2", exact: true })
      .click();

    await expect(page).toHaveURL(/network=ethereum/);
    await expect(page).toHaveURL(/page=2/);
    await expect(cards(page)).toHaveCount(6);
    await expect(
      page.getByRole("link", { name: /Emerald Herald #390/ }),
    ).toBeVisible();
  });

  test("filtro por faixa de preço reduz os resultados", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("slider", { name: "Preço máximo" }).fill("100");
    await page.getByRole("button", { name: "Aplicar" }).click();

    await expect(page).toHaveURL(/maxPrice=/);
    await expect(count(page)).toHaveText("17 NFTs encontrados");
    await expect(
      page.getByRole("link", { name: /Onyx Curator #001/ }),
    ).toHaveCount(0);
  });

  test("combina coleção, rede e preço e preserva a ordenação", async ({
    page,
  }) => {
    await page.goto("/?sort=price_asc");

    await page.getByRole("button", { name: /^Música/ }).click();
    await expect(count(page)).toHaveText("7 NFTs encontrados");

    await page.getByRole("button", { name: /^Solana/ }).click();
    await expect(count(page)).toHaveText("4 NFTs encontrados");

    await page.getByRole("slider", { name: "Preço mínimo" }).fill("50");
    await page.getByRole("slider", { name: "Preço máximo" }).fill("100");
    await page.getByRole("button", { name: "Aplicar" }).click();

    await expect(count(page)).toHaveText("2 NFTs encontrados");
    await expect(page).toHaveURL(/sort=price_asc/);
    await expect(await firstCard(page)).toContainText("Citrus Pulse #219");

    const url = decodeURIComponent(page.url());
    expect(url).toContain("collection=Música");
    expect(url).toContain("network=solana");
    expect(url).toContain("minPrice=");
    expect(url).toContain("maxPrice=");
  });

  test("link direto com filtros reproduz a mesma consulta", async ({
    page,
  }) => {
    await page.goto(
      "/?collection=M%C3%BAsica&network=solana&minPrice=0.5&maxPrice=1&sort=price_asc",
    );

    await expect(count(page)).toHaveText("2 NFTs encontrados");
    await expect(await firstCard(page)).toContainText("Citrus Pulse #219");
    await expect(
      page.getByRole("button", { name: /^Música/ }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(
      page.getByRole("button", { name: /^Solana/ }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  test("filtros sobrevivem a refresh e à navegação pelo histórico", async ({
    page,
  }) => {
    await page.goto("/");

    await page.getByRole("button", { name: /^Música/ }).click();
    await expect(count(page)).toHaveText("7 NFTs encontrados");

    await page.getByRole("button", { name: /^Solana/ }).click();
    await expect(count(page)).toHaveText("4 NFTs encontrados");

    await page.reload();
    await expect(count(page)).toHaveText("4 NFTs encontrados");
    await expect(page).toHaveURL(/network=solana/);

    await page.goBack();
    await expect(count(page)).toHaveText("7 NFTs encontrados");
    await expect(page).not.toHaveURL(/network=solana/);

    await page.goForward();
    await expect(count(page)).toHaveText("4 NFTs encontrados");
    await expect(page).toHaveURL(/network=solana/);
  });

  test("troca de página preserva os filtros e trocar filtro reinicia a página", async ({
    page,
  }) => {
    await page.goto("/?network=polygon");

    await expect(count(page)).toHaveText("11 NFTs encontrados");

    await pagination(page)
      .getByRole("button", { name: "Página 2", exact: true })
      .click();

    await expect(page).toHaveURL(/page=2/);
    await expect(page).toHaveURL(/network=polygon/);

    await page.getByRole("button", { name: /^Ethereum/ }).click();

    await expect(page).toHaveURL(/page=1/);
    await expect(page).toHaveURL(/network=ethereum/);
    await expect(count(page)).toHaveText("15 NFTs encontrados");
  });

  test("ordenação reinicia a página e mantém os filtros", async ({ page }) => {
    await page.goto("/?network=ethereum&page=2");

    await expect(page).toHaveURL(/page=2/);

    await chooseOption(page, "Ordenar por", "Maior preço");

    await expect(page).toHaveURL(/sort=price_desc/);
    await expect(page).toHaveURL(/page=1/);
    await expect(page).toHaveURL(/network=ethereum/);
    await expect(await firstCard(page)).toContainText("Onyx Curator #001");
  });

  test("combinação sem resultados mostra o estado vazio e permite limpar", async ({
    page,
  }) => {
    await page.goto("/?collection=M%C3%BAsica&network=ethereum&minPrice=5");

    await expect(count(page)).toHaveText("0 NFTs encontrados");
    await expect(page.getByText("Nenhum NFT encontrado")).toBeVisible();
    await expect(results(page)).toHaveCount(0);

    await page
      .getByRole("button", { name: "Limpar filtros" })
      .first()
      .click();

    await expect(count(page)).toHaveText("36 NFTs encontrados");
    await expect(page).not.toHaveURL(/collection=/);
    await expect(page).not.toHaveURL(/network=/);
    await expect(page).not.toHaveURL(/minPrice=/);
  });

  test("página fora do intervalo é normalizada para a última página", async ({
    page,
  }) => {
    await page.goto("/?page=99");

    await expect(page).toHaveURL(/page=4/);
    await expect(cards(page)).toHaveCount(9);
    await expect(
      pagination(page).getByRole("button", { name: "Página 4", exact: true }),
    ).toHaveAttribute("aria-current", "page");
  });

  test("faixa de preço invertida é normalizada", async ({ page }) => {
    await page.goto("/?minPrice=3&maxPrice=1");

    await expect(count(page)).toHaveText("14 NFTs encontrados");

    const url = decodeURIComponent(page.url());
    expect(url).toContain("minPrice=\"1\"");
    expect(url).toContain("maxPrice=\"3\"");
  });

  test("filtros do mobile não geram rolagem horizontal", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    await page.getByRole("button", { name: "Filtros" }).click();
    await page.getByRole("button", { name: /^Música/ }).click();

    await expect(page).toHaveURL(/collection=/);
    await expect(count(page)).toHaveText("7 NFTs encontrados");

    for (const width of [390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });

      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth,
      );

      expect(overflow, `rolagem horizontal em ${width}px`).toBe(false);
    }
  });
});
