import { test, expect, type Page } from "@playwright/test";

async function waitForRealtime(page: Page) {
  await page.waitForFunction(
    () =>
      (window as unknown as { __realtimeReady?: boolean }).__realtimeReady ===
      true,
    undefined,
    { timeout: 10000 },
  );
}

async function prepare(page: Page) {
  await page.goto("/");
  await waitForRealtime(page);
  await page.evaluate(async () => {
    await fetch("/api/test/reset", { method: "POST" });
  });
}

test.describe("Cenários de simulação", () => {
  test.beforeEach(async ({ page }) => {
    await prepare(page);
  });

  test("payment_refused: pedido é recusado e o carrinho é preservado", async ({
    page,
  }) => {
    const result = await page.evaluate(async () => {
      const sessionId =
        localStorage.getItem("marketplace-session-id") ?? "scenario-session";

      const token = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "ana@example.com",
          password: "Teste@123",
        }),
      })
        .then((response) => response.json())
        .then((session) => session.token as string);

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "X-Session-Id": sessionId,
      };

      const walletId = await fetch("/api/wallets", {
        method: "POST",
        headers,
        body: JSON.stringify({
          kind: "primary",
          displayName: "Ana Silva",
          walletNickname: "Carteira principal",
          networkId: "ethereum",
          profileName: "Ana Colecionadora",
          address: "0x1234567890abcdef1234567890abcdef12345678",
          secondaryAddress: "",
          walletType: "metamask",
          referralCode: "KURIO-2026",
          email: "ana@example.com",
          ensName: "ana-silva",
          ensDomain: ".eth",
        }),
      })
        .then((response) => response.json())
        .then((data) => data.wallet.id as string);

      await fetch("/api/test/scenario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario: "payment_refused" }),
      });

      await fetch("/api/cart/items", {
        method: "POST",
        headers,
        body: JSON.stringify({ nftId: "1", edition: "Genesis", quantity: 1 }),
      });

      const quote = await fetch("/api/quote", {
        method: "POST",
        headers,
        body: JSON.stringify({ networkId: "ethereum" }),
      }).then((response) => response.json());

      const order = await fetch("/api/orders", {
        method: "POST",
        headers: { ...headers, "Idempotency-Key": crypto.randomUUID() },
        body: JSON.stringify({ quoteId: quote.id, walletId }),
      }).then((response) => response.json());

      let status = order.status as string;
      for (let attempt = 0; attempt < 40 && status === "pending"; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        status = await fetch(`/api/orders/${order.id}`, { headers })
          .then((response) => response.json())
          .then((current) => current.status as string);
      }

      const cart = await fetch("/api/cart", { headers }).then((response) =>
        response.json(),
      );

      return { status, cartItems: cart.items.length as number };
    });

    expect(result.status).toBe("refused");
    expect(result.cartItems).toBeGreaterThan(0);
  });

  test("price_changed: divergência de preço entre cotação e pedido retorna 409", async ({
    page,
  }) => {
    const result = await page.evaluate(async () => {
      const sessionId =
        localStorage.getItem("marketplace-session-id") ?? "scenario-session";

      const token = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "ana@example.com",
          password: "Teste@123",
        }),
      })
        .then((response) => response.json())
        .then((session) => session.token as string);

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "X-Session-Id": sessionId,
      };

      const walletId = await fetch("/api/wallets", {
        method: "POST",
        headers,
        body: JSON.stringify({
          kind: "primary",
          displayName: "Ana Silva",
          walletNickname: "Carteira principal",
          networkId: "ethereum",
          profileName: "Ana Colecionadora",
          address: "0x1234567890abcdef1234567890abcdef12345678",
          secondaryAddress: "",
          walletType: "metamask",
          referralCode: "KURIO-2026",
          email: "ana@example.com",
          ensName: "ana-silva",
          ensDomain: ".eth",
        }),
      })
        .then((response) => response.json())
        .then((data) => data.wallet.id as string);

      await fetch("/api/cart/items", {
        method: "POST",
        headers,
        body: JSON.stringify({ nftId: "1", edition: "Genesis", quantity: 1 }),
      });

      const quote = await fetch("/api/quote", {
        method: "POST",
        headers,
        body: JSON.stringify({ networkId: "ethereum" }),
      }).then((response) => response.json());

      await fetch("/api/test/scenario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario: "price_changed" }),
      });

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { ...headers, "Idempotency-Key": crypto.randomUUID() },
        body: JSON.stringify({ quoteId: quote.id, walletId }),
      });
      const body = await response.json();

      const cart = await fetch("/api/cart", { headers }).then((result) =>
        result.json(),
      );

      return {
        status: response.status,
        message: body.message as string,
        cartItems: cart.items.length as number,
      };
    });

    expect(result.status).toBe(409);
    expect(result.message).toContain("Preço alterado");
    expect(result.cartItems).toBeGreaterThan(0);
  });

  test("stock_changed: divergência de estoque entre cotação e pedido retorna 409", async ({
    page,
  }) => {
    const result = await page.evaluate(async () => {
      const sessionId =
        localStorage.getItem("marketplace-session-id") ?? "scenario-session";

      const token = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "ana@example.com",
          password: "Teste@123",
        }),
      })
        .then((response) => response.json())
        .then((session) => session.token as string);

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "X-Session-Id": sessionId,
      };

      const walletId = await fetch("/api/wallets", {
        method: "POST",
        headers,
        body: JSON.stringify({
          kind: "primary",
          displayName: "Ana Silva",
          walletNickname: "Carteira principal",
          networkId: "ethereum",
          profileName: "Ana Colecionadora",
          address: "0x1234567890abcdef1234567890abcdef12345678",
          secondaryAddress: "",
          walletType: "metamask",
          referralCode: "KURIO-2026",
          email: "ana@example.com",
          ensName: "ana-silva",
          ensDomain: ".eth",
        }),
      })
        .then((response) => response.json())
        .then((data) => data.wallet.id as string);

      await fetch("/api/cart/items", {
        method: "POST",
        headers,
        body: JSON.stringify({ nftId: "1", edition: "Genesis", quantity: 1 }),
      });

      const quote = await fetch("/api/quote", {
        method: "POST",
        headers,
        body: JSON.stringify({ networkId: "ethereum" }),
      }).then((response) => response.json());

      await fetch("/api/test/scenario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario: "stock_changed" }),
      });

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { ...headers, "Idempotency-Key": crypto.randomUUID() },
        body: JSON.stringify({ quoteId: quote.id, walletId }),
      });
      const body = await response.json();

      const cart = await fetch("/api/cart", { headers }).then((result) =>
        result.json(),
      );

      return {
        status: response.status,
        message: body.message as string,
        cartItems: cart.items.length as number,
      };
    });

    expect(result.status).toBe(409);
    expect(result.message).toContain("Estoque insuficiente");
    expect(result.cartItems).toBeGreaterThan(0);
  });

  test("timeout: retry com a mesma chave não duplica o pedido", async ({
    page,
  }) => {
    const result = await page.evaluate(async () => {
      const sessionId =
        localStorage.getItem("marketplace-session-id") ?? "scenario-session";

      const token = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "ana@example.com",
          password: "Teste@123",
        }),
      })
        .then((response) => response.json())
        .then((session) => session.token as string);

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "X-Session-Id": sessionId,
      };

      const walletId = await fetch("/api/wallets", {
        method: "POST",
        headers,
        body: JSON.stringify({
          kind: "primary",
          displayName: "Ana Silva",
          walletNickname: "Carteira principal",
          networkId: "ethereum",
          profileName: "Ana Colecionadora",
          address: "0x1234567890abcdef1234567890abcdef12345678",
          secondaryAddress: "",
          walletType: "metamask",
          referralCode: "KURIO-2026",
          email: "ana@example.com",
          ensName: "ana-silva",
          ensDomain: ".eth",
        }),
      })
        .then((response) => response.json())
        .then((data) => data.wallet.id as string);

      await fetch("/api/cart/items", {
        method: "POST",
        headers,
        body: JSON.stringify({ nftId: "1", edition: "Genesis", quantity: 1 }),
      });

      const quote = await fetch("/api/quote", {
        method: "POST",
        headers,
        body: JSON.stringify({ networkId: "ethereum" }),
      }).then((response) => response.json());

      await fetch("/api/test/scenario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario: "timeout" }),
      });

      const key = crypto.randomUUID();

      const firstResponse = await fetch("/api/orders", {
        method: "POST",
        headers: { ...headers, "Idempotency-Key": key },
        body: JSON.stringify({ quoteId: quote.id, walletId }),
      });
      const firstBody = await firstResponse.json();

      const secondResponse = await fetch("/api/orders", {
        method: "POST",
        headers: { ...headers, "Idempotency-Key": key },
        body: JSON.stringify({ quoteId: quote.id, walletId }),
      });
      const secondBody = await secondResponse.json();

      const orders = await fetch("/api/orders", { headers }).then((response) =>
        response.json(),
      );

      return {
        firstStatus: firstResponse.status,
        firstOrderId: firstBody.orderId as string,
        secondStatus: secondResponse.status,
        secondOrderId: secondBody.id as string,
        orderCount: orders.length as number,
      };
    });

    expect(result.firstStatus).toBe(504);
    expect(result.firstOrderId).toBeTruthy();
    expect(result.secondStatus).toBe(200);
    expect(result.secondOrderId).toBe(result.firstOrderId);
    expect(result.orderCount).toBe(1);
  });

  test("isolamento: um usuário não acessa o pedido de outro", async ({
    page,
  }) => {
    const result = await page.evaluate(async () => {
      const sessionId =
        localStorage.getItem("marketplace-session-id") ?? "scenario-session";

      async function login(email: string, password: string) {
        return fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        })
          .then((response) => response.json())
          .then((session) => session.token as string);
      }

      const tokenA = await login("ana@example.com", "Teste@123");
      const tokenB = await login("bruno@example.com", "Teste@456");

      const headersA: Record<string, string> = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenA}`,
        "X-Session-Id": sessionId,
      };
      const headersB: Record<string, string> = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenB}`,
        "X-Session-Id": sessionId,
      };

      const walletId = await fetch("/api/wallets", {
        method: "POST",
        headers: headersA,
        body: JSON.stringify({
          kind: "primary",
          displayName: "Ana Silva",
          walletNickname: "Carteira principal",
          networkId: "ethereum",
          profileName: "Ana Colecionadora",
          address: "0x1234567890abcdef1234567890abcdef12345678",
          secondaryAddress: "",
          walletType: "metamask",
          referralCode: "KURIO-2026",
          email: "ana@example.com",
          ensName: "ana-silva",
          ensDomain: ".eth",
        }),
      })
        .then((response) => response.json())
        .then((data) => data.wallet.id as string);

      await fetch("/api/cart/items", {
        method: "POST",
        headers: headersA,
        body: JSON.stringify({ nftId: "1", edition: "Genesis", quantity: 1 }),
      });

      const quote = await fetch("/api/quote", {
        method: "POST",
        headers: headersA,
        body: JSON.stringify({ networkId: "ethereum" }),
      }).then((response) => response.json());

      const order = await fetch("/api/orders", {
        method: "POST",
        headers: { ...headersA, "Idempotency-Key": crypto.randomUUID() },
        body: JSON.stringify({ quoteId: quote.id, walletId }),
      }).then((response) => response.json());

      const ownerStatus = await fetch(`/api/orders/${order.id}`, {
        headers: headersA,
      }).then((response) => response.status);

      const otherStatus = await fetch(`/api/orders/${order.id}`, {
        headers: headersB,
      }).then((response) => response.status);

      return {
        orderId: order.id as string,
        ownerStatus,
        otherStatus,
      };
    });

    expect(result.orderId).toBeTruthy();
    expect(result.ownerStatus).toBe(200);
    expect(result.otherStatus).toBe(404);
  });
});
