import { test, expect } from "@playwright/test";

function results(
  page: Parameters<typeof test>[1] extends never
    ? never
    : import("@playwright/test").Page,
) {
  return page.getByRole("list", { name: "Resultados do catálogo" });
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
    ).toHaveValue("recent");

    const pagination = page.getByRole("navigation", {
      name: "Paginação do catálogo",
    });
    await expect(pagination).toBeVisible();
    await expect(
      pagination.getByRole("button", { name: "Página 1", exact: true }),
    ).toHaveAttribute("aria-current", "page");

    await pagination
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

    const sort = page.getByRole("combobox", { name: /Ordenar por/ });

    await sort.selectOption("price_desc");

    await expect(page).toHaveURL(/sort=price_desc/);
    await expect(results(page).getByRole("link").first()).toContainText(
      "Onyx Curator #001",
    );

    await sort.selectOption("price_asc");

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
    await expect(results(page).getByRole("listitem")).toHaveCount(7);

    await page.getByRole("button", { name: /^Música/ }).click();

    await expect(page).not.toHaveURL(/collection=/);
  });
});
