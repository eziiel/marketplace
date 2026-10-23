import { test, expect, type Page } from "@playwright/test";

const EMAIL = "ana@example.com";
const PASSWORD = "Teste@123";

async function login(page: Page) {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill(EMAIL);
  await page.getByLabel("Senha").fill(PASSWORD);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page.getByText("Olá, Ana Silva")).toBeVisible();
}

async function addGenesisToCart(page: Page) {
  await page.goto("/nfts/1");
  await page.getByRole("button", { name: "Adicionar ao carrinho" }).click();
  await expect(page.getByText("Item adicionado ao carrinho!")).toBeVisible();
}

async function setScenario(page: Page, scenario: string) {
  await page.evaluate(async (value) => {
    await fetch("/api/test/scenario", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scenario: value }),
    });
  }, scenario);
}

async function getCartItemCount(page: Page): Promise<number> {
  return page.evaluate(async () => {
    const token = localStorage.getItem("marketplace-auth-token");
    const sessionId = localStorage.getItem("marketplace-session-id");
    const cart = await fetch("/api/cart", {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Session-Id": sessionId ?? "",
      },
    }).then((response) => response.json());

    return cart.items.length as number;
  });
}

test.describe("Checkout", () => {
  test("compra completa do catálogo ao recibo confirmado", async ({ page }) => {
    await login(page);
    await addGenesisToCart(page);

    await page.goto("/checkout");

    await expect(
      page.getByRole("heading", { name: "Finalizar compra" }),
    ).toBeVisible();
    await expect(page.getByText(/Total: 0\.5021 ETH/)).toBeVisible();

    await page.getByRole("button", { name: "Confirmar pedido" }).click();

    await expect(
      page.getByRole("heading", { name: "Pedido confirmado" }),
    ).toBeVisible();
    await expect(page.getByText(/Total: 0\.5021 ETH/)).toBeVisible();
    await expect(page.getByText(/Transação: 0x/)).toBeVisible();

    expect(await getCartItemCount(page)).toBe(0);
  });

  test("pagamento recusado (cenário MSW) preserva o carrinho", async ({
    page,
  }) => {
    await login(page);
    await addGenesisToCart(page);
    await setScenario(page, "payment_refused");

    await page.goto("/checkout");
    await expect(
      page.getByRole("heading", { name: "Finalizar compra" }),
    ).toBeVisible();
    await expect(page.getByText(/Total:/)).toBeVisible();

    await page.getByRole("button", { name: "Confirmar pedido" }).click();

    await expect(
      page.getByRole("heading", { name: "Pagamento recusado" }),
    ).toBeVisible();

    expect(await getCartItemCount(page)).toBeGreaterThan(0);
  });

  test("idempotência: mesma chave reusa o pedido e payload diferente gera 409", async ({
    page,
  }) => {
    await login(page);
    await addGenesisToCart(page);
    await setScenario(page, "payment_refused");

    const result = await page.evaluate(async () => {
      const token = localStorage.getItem("marketplace-auth-token");
      const sessionId = localStorage.getItem("marketplace-session-id");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "X-Session-Id": sessionId ?? "",
      };

      const quoteOne = await fetch("/api/quote", {
        method: "POST",
        headers,
        body: JSON.stringify({ networkId: "ethereum" }),
      }).then((response) => response.json());

      const key = crypto.randomUUID();

      const first = await fetch("/api/orders", {
        method: "POST",
        headers: { ...headers, "Idempotency-Key": key },
        body: JSON.stringify({ quoteId: quoteOne.id }),
      }).then((response) => response.json());

      const secondResponse = await fetch("/api/orders", {
        method: "POST",
        headers: { ...headers, "Idempotency-Key": key },
        body: JSON.stringify({ quoteId: quoteOne.id }),
      });
      const second = await secondResponse.json();

      const quoteTwo = await fetch("/api/quote", {
        method: "POST",
        headers,
        body: JSON.stringify({ networkId: "ethereum" }),
      }).then((response) => response.json());

      const conflictResponse = await fetch("/api/orders", {
        method: "POST",
        headers: { ...headers, "Idempotency-Key": key },
        body: JSON.stringify({ quoteId: quoteTwo.id }),
      });

      return {
        firstId: first.id as string,
        secondId: second.id as string,
        secondStatus: secondResponse.status,
        conflictStatus: conflictResponse.status,
      };
    });

    expect(result.firstId).toBeTruthy();
    expect(result.secondId).toBe(result.firstId);
    expect(result.secondStatus).toBe(200);
    expect(result.conflictStatus).toBe(409);
  });
});
