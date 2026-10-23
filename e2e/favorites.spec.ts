import { test, expect, type Page } from "@playwright/test";

const ANA = {
  email: "ana@example.com",
  password: "Teste@123",
  greeting: "Olá, Ana Silva",
};

const BRUNO = {
  email: "bruno@example.com",
  password: "Teste@456",
  greeting: "Olá, Bruno Costa",
};

async function loginUI(
  page: Page,
  account: { email: string; password: string; greeting: string },
) {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill(account.email);
  await page.getByLabel("Senha").fill(account.password);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page.getByText(account.greeting)).toBeVisible();
}

async function logoutUI(page: Page) {
  await page.getByRole("button", { name: "Sair" }).click();
  await expect(page.getByRole("link", { name: "Entrar" })).toBeVisible();
}

function favoriteToggle(page: Page, nftName: string) {
  return page.getByRole("button", { name: new RegExp(nftName) });
}

test.describe("Favoritos", () => {
  test("visitante é redirecionado ao login ao clicar no coração", async ({
    page,
  }) => {
    await page.goto("/");

    const heart = favoriteToggle(page, "Genesis NFT");
    await expect(heart).toBeVisible();
    await heart.click();

    await expect(page).toHaveURL(/auth=login/);
    await expect(
      page.getByRole("dialog", { name: "Entrar na Kurio" }),
    ).toBeVisible();
  });

  test("usuário autenticado adiciona e remove favoritos", async ({ page }) => {
    await loginUI(page, ANA);

    const genesis = favoriteToggle(page, "Genesis NFT");
    await expect(genesis).toHaveAttribute("aria-pressed", "false");

    await genesis.click();
    await expect(genesis).toHaveAttribute("aria-pressed", "true");

    await genesis.click();
    await expect(genesis).toHaveAttribute("aria-pressed", "false");
  });

  test("favoritos persistem após recarregar a página", async ({ page }) => {
    await loginUI(page, ANA);

    const genesis = favoriteToggle(page, "Genesis NFT");
    await genesis.click();
    await expect(genesis).toHaveAttribute("aria-pressed", "true");

    await page.reload();

    await expect(favoriteToggle(page, "Genesis NFT")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  test("favoritos são isolados entre Ana e Bruno", async ({ page }) => {
    await loginUI(page, ANA);
    await favoriteToggle(page, "Genesis NFT").click();
    await expect(favoriteToggle(page, "Genesis NFT")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await logoutUI(page);

    await loginUI(page, BRUNO);
    await expect(favoriteToggle(page, "Genesis NFT")).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    await favoriteToggle(page, "Cyber Ape").click();
    await expect(favoriteToggle(page, "Cyber Ape")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await logoutUI(page);

    await loginUI(page, ANA);
    await expect(favoriteToggle(page, "Genesis NFT")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(favoriteToggle(page, "Cyber Ape")).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  test("endpoints de favoritos rejeitam requisições não autenticadas", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(favoriteToggle(page, "Genesis NFT")).toBeVisible();

    const statuses = await page.evaluate(async () => {
      const get = await fetch("/api/favorites");
      const post = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nftId: "1" }),
      });
      const del = await fetch("/api/favorites/1", { method: "DELETE" });

      return { get: get.status, post: post.status, del: del.status };
    });

    expect(statuses.get).toBe(401);
    expect(statuses.post).toBe(401);
    expect(statuses.del).toBe(401);
  });
});
