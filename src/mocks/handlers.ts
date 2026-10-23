import { http, HttpResponse } from "msw";
import type { NftListResponse } from "@/features/catalog/types/nft";
import { createUser, findUserByEmail } from "./data/user-store";

import {
  findNft,
  getNft,
  listNfts,
  resetNfts,
  updateNft,
} from "./data/nft-store";
import type { CartItem } from "@/features/cart/types/cart";
import { getSessionCart, saveSessionCart } from "./data/cart-store";
import { getRequestCart } from "./utils/get-request-cart";
import { createAuthSession, deleteAuthSession } from "./data/auth-store";
import { getAuthSession } from "./data/auth-store";
import { settleOrder } from "./settle-order";
import { emitNftUpdated } from "./socket/realtime";
import { networks } from "./data/networks";
import { coupons } from "./data/coupons";
import { getRequestUser } from "./utils/get-request-user";
import { getStoredQuote, saveQuote } from "./data/quote-store";
import {
  getIdempotencyRecord,
  getOrder,
  listOrders,
  saveIdempotencyRecord,
  saveOrder,
} from "./data/order-store";
import {
  getScenario,
  isScenario,
  resetScenario,
  setScenario,
} from "./data/scenario-store";
import { add, multiply, percentage, subtract, sum } from "@/lib/money";
import type {
  CouponStatus,
  CreateQuoteInput,
  Quote,
  QuoteLineItem,
} from "@/features/checkout/types/quote";
import type {
  CreateOrderInput,
  Order,
  OrderItem,
  OrderTotals,
  Receipt,
} from "@/features/checkout/types/order";

export const handlers = [
  http.get("/api/nfts", ({ request }) => {
    const url = new URL(request.url);

    const search = url.searchParams.get("search")?.toLowerCase();
    const sort = url.searchParams.get("sort");
    const pageParam = Number(url.searchParams.get("page") ?? 1);

    const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;

    const pageSize = 10;

    let filteredNfts = listNfts();

    if (search) {
      filteredNfts = filteredNfts.filter((nft) =>
        nft.name.toLowerCase().includes(search),
      );
    }

    if (sort === "price_asc") {
      filteredNfts.sort((a, b) => Number(a.price) - Number(b.price));
    }

    if (sort === "price_desc") {
      filteredNfts.sort((a, b) => Number(b.price) - Number(a.price));
    }

    const total = filteredNfts.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;

    const response: NftListResponse = {
      items: filteredNfts.slice(start, start + pageSize),
      page,
      total,
      totalPages,
    };

    return HttpResponse.json(response);
  }),
  http.get("/api/nfts/:id", ({ params }) => {
    const { id } = params;

    const nft = getNft(String(id));

    if (!nft) {
      return HttpResponse.json(
        { message: "NFT não encontrado" },
        { status: 404 },
      );
    }

    return HttpResponse.json(nft);
  }),
  http.get("/api/cart", ({ request }) => {
    const result = getRequestCart(request);

    if (!result.ok) {
      return result.response;
    }

    return HttpResponse.json(result.cart);
  }),
  http.post("/api/cart/items", async ({ request }) => {
    const result = getRequestCart(request);

    if (!result.ok) {
      return result.response;
    }

    const { sessionId, cart } = result;

    const body = (await request.json()) as Partial<CartItem>;

    const { nftId, edition, quantity } = body;

    if (
      typeof nftId !== "string" ||
      typeof edition !== "string" ||
      !Number.isSafeInteger(quantity) ||
      (quantity ?? 0) <= 0
    ) {
      return HttpResponse.json(
        { message: "Dados do item inválidos" },
        { status: 400 },
      );
    }

    const nft = findNft(nftId, edition);

    if (!nft) {
      return HttpResponse.json(
        { message: "NFT ou edição não encontrada" },
        { status: 404 },
      );
    }

    const existingItem = cart.items.find(
      (item) => item.nftId === nftId && item.edition === edition,
    );

    const requestedQuantity = (existingItem?.quantity ?? 0) + quantity!;

    if (requestedQuantity > nft.available) {
      return HttpResponse.json(
        { message: "Quantidade indisponível em estoque" },
        { status: 409 },
      );
    }

    if (existingItem) {
      existingItem.quantity = requestedQuantity;
    } else {
      cart.items.push({
        nftId,
        edition,
        quantity: quantity!,
      });
    }
    saveSessionCart(sessionId, cart);
    return HttpResponse.json(cart, { status: 200 });
  }),
  http.patch("/api/cart/items/:nftId", async ({ params, request }) => {
    const result = getRequestCart(request);

    if (!result.ok) {
      return result.response;
    }

    const { sessionId, cart } = result;
    const { nftId } = params;
    const body = (await request.json()) as {
      edition?: string;
      quantity?: number;
    };

    const { edition, quantity } = body;

    if (
      typeof edition !== "string" ||
      !Number.isSafeInteger(quantity) ||
      quantity === undefined ||
      quantity < 1
    ) {
      return HttpResponse.json(
        { message: "Quantidade ou edição inválida" },
        { status: 400 },
      );
    }

    const nft = findNft(String(nftId), edition);

    if (!nft) {
      return HttpResponse.json(
        { message: "NFT ou edição não encontrada" },
        { status: 404 },
      );
    }

    const cartItem = cart.items.find(
      (item) => item.nftId === nftId && item.edition === edition,
    );

    if (!cartItem) {
      return HttpResponse.json(
        { message: "Item não encontrado no carrinho" },
        { status: 404 },
      );
    }

    if (quantity > nft.available) {
      return HttpResponse.json(
        { message: "Quantidade indisponível em estoque" },
        { status: 409 },
      );
    }

    cartItem.quantity = quantity;
    saveSessionCart(sessionId, cart);
    return HttpResponse.json(cart);
  }),
  http.delete("/api/cart/items/:nftId", ({ params, request }) => {
    const result = getRequestCart(request);

    if (!result.ok) {
      return result.response;
    }

    const { sessionId, cart } = result;
    const { nftId } = params;
    const edition = new URL(request.url).searchParams.get("edition");

    if (!edition) {
      return HttpResponse.json(
        { message: "Edição obrigatória" },
        { status: 400 },
      );
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.nftId === nftId && item.edition === edition,
    );

    if (itemIndex === -1) {
      return HttpResponse.json(
        { message: "Item não encontrado no carrinho" },
        { status: 404 },
      );
    }

    cart.items.splice(itemIndex, 1);
    saveSessionCart(sessionId, cart);
    return HttpResponse.json(cart);
  }),
  http.post("/api/auth/login", async ({ request }) => {
    const body: unknown = await request.json();

    if (
      typeof body !== "object" ||
      body === null ||
      !("email" in body) ||
      !("password" in body) ||
      typeof body.email !== "string" ||
      typeof body.password !== "string"
    ) {
      return HttpResponse.json(
        { message: "E-mail e senha são obrigatórios" },
        { status: 400 },
      );
    }

    const email = body.email.trim();
    const password = body.password;

    if (!email || !password) {
      return HttpResponse.json(
        { message: "E-mail e senha são obrigatórios" },
        { status: 400 },
      );
    }

    const account = findUserByEmail(email);

    if (!account || account.password !== password) {
      return HttpResponse.json(
        { message: "Credenciais inválidas" },
        { status: 401 },
      );
    }

    if (!account) {
      return HttpResponse.json(
        { message: "Credenciais inválidas" },
        { status: 401 },
      );
    }

    const session = createAuthSession(account.user);

    return HttpResponse.json(session, { status: 200 });
  }),
  http.get("/api/auth/me", ({ request }) => {
    const authorization = request.headers.get("Authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return HttpResponse.json(
        { message: "Token de autenticação ausente" },
        { status: 401 },
      );
    }

    const token = authorization.slice("Bearer ".length).trim();

    if (!token) {
      return HttpResponse.json(
        { message: "Token de autenticação inválido" },
        { status: 401 },
      );
    }

    const session = getAuthSession(token);

    if (!session) {
      return HttpResponse.json(
        { message: "Sessão inválida ou expirada" },
        { status: 401 },
      );
    }

    return HttpResponse.json({
      user: session.user,
      expiresAt: session.expiresAt,
    });
  }),
  http.post("/api/auth/logout", ({ request }) => {
    const authorization = request.headers.get("Authorization");
    const token = authorization?.replace(/^Bearer\s+/, "").trim();

    if (!token || !getAuthSession(token)) {
      return HttpResponse.json({ message: "Sessão inválida" }, { status: 401 });
    }

    deleteAuthSession(token);

    return HttpResponse.json({ success: true });
  }),
  http.get("/api/networks", () => {
    return HttpResponse.json(
      networks.map((network) => ({
        id: network.id,
        label: network.label,
        fee: network.fee,
      })),
    );
  }),
  http.post("/api/quote", async ({ request }) => {
    const auth = getRequestUser(request);

    if (!auth.ok) {
      return auth.response;
    }

    const body = (await request
      .json()
      .catch(() => null)) as CreateQuoteInput | null;

    const network = networks.find((item) => item.id === body?.networkId);

    if (!network) {
      return HttpResponse.json({ message: "Rede inválida" }, { status: 400 });
    }

    const couponCode = body?.couponCode?.trim() || null;
    const cart = getSessionCart(`user:${auth.user.id}`);

    if (cart.items.length === 0) {
      return HttpResponse.json({ message: "Carrinho vazio" }, { status: 400 });
    }

    const items: QuoteLineItem[] = [];

    for (const cartItem of cart.items) {
      const nft = findNft(cartItem.nftId, cartItem.edition);

      if (!nft) {
        return HttpResponse.json(
          { message: "Item do carrinho não encontrado" },
          { status: 409 },
        );
      }

      items.push({
        nftId: nft.id,
        edition: nft.edition,
        name: nft.name,
        unitPrice: nft.price,
        quantity: cartItem.quantity,
        lineTotal: multiply(nft.price, cartItem.quantity),
        available: nft.available,
        availabilityOk: cartItem.quantity <= nft.available,
      });
    }

    const subtotal = sum(items.map((item) => item.lineTotal));

    let couponStatus: CouponStatus = "none";
    let discount = "0";

    if (couponCode) {
      const coupon = coupons.find(
        (item) => item.code.toLowerCase() === couponCode.toLowerCase(),
      );

      if (!coupon) {
        couponStatus = "invalid";
      } else if (coupon.expired) {
        couponStatus = "expired";
      } else {
        couponStatus = "applied";
        discount = percentage(subtotal, coupon.percentOff);
      }
    }

    const total = add(subtract(subtotal, discount), network.fee);

    const quote: Quote = {
      id: crypto.randomUUID(),
      currency: "ETH",
      items,
      subtotal,
      discount,
      networkId: network.id,
      networkFee: network.fee,
      total,
      couponCode,
      couponStatus,
      hasAvailabilityIssue: items.some((item) => !item.availabilityOk),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    };

    saveQuote(auth.user.id, quote);

    return HttpResponse.json(quote, { status: 200 });
  }),
  http.post("/api/orders", async ({ request }) => {
    const auth = getRequestUser(request);

    if (!auth.ok) {
      return auth.response;
    }

    const idempotencyKey = request.headers.get("Idempotency-Key")?.trim();

    if (!idempotencyKey) {
      return HttpResponse.json(
        { message: "Idempotency-Key obrigatória" },
        { status: 400 },
      );
    }

    const body = (await request
      .json()
      .catch(() => null)) as CreateOrderInput | null;
    const quoteId = body?.quoteId;

    if (typeof quoteId !== "string" || quoteId.length === 0) {
      return HttpResponse.json(
        { message: "quoteId obrigatório" },
        { status: 400 },
      );
    }

    const requestHash = quoteId;
    const existing = getIdempotencyRecord(auth.user.id, idempotencyKey);

    if (existing) {
      if (existing.requestHash !== requestHash) {
        return HttpResponse.json(
          { message: "Idempotency-Key já utilizada com outro conteúdo" },
          { status: 409 },
        );
      }

      const existingOrder = getOrder(auth.user.id, existing.orderId);

      if (existingOrder) {
        return HttpResponse.json(existingOrder, { status: 200 });
      }
    }

    const stored = getStoredQuote(quoteId);

    if (!stored || stored.userId !== auth.user.id) {
      return HttpResponse.json(
        { message: "Cotação não encontrada" },
        { status: 404 },
      );
    }

    if (new Date(stored.quote.expiresAt).getTime() <= Date.now()) {
      return HttpResponse.json(
        { message: "Cotação expirada, refaça a cotação" },
        { status: 409 },
      );
    }

    const scenario = getScenario();

    if (scenario === "price_changed" || scenario === "stock_changed") {
      for (const line of stored.quote.items) {
        const nft = findNft(line.nftId, line.edition);

        if (!nft) {
          continue;
        }

        const patch =
          scenario === "price_changed"
            ? { price: add(line.unitPrice, "0.1"), version: nft.version + 1 }
            : {
                available: Math.max(0, line.quantity - 1),
                version: nft.version + 1,
              };

        const updated = updateNft(line.nftId, patch);

        if (updated) {
          emitNftUpdated({
            id: updated.id,
            version: updated.version,
            price: updated.price,
            available: updated.available,
          });
        }
      }
    }

    for (const line of stored.quote.items) {
      const nft = findNft(line.nftId, line.edition);

      if (!nft) {
        return HttpResponse.json(
          { message: "Item indisponível" },
          { status: 409 },
        );
      }

      if (nft.price !== line.unitPrice) {
        return HttpResponse.json(
          { message: "Preço alterado, refaça a cotação" },
          { status: 409 },
        );
      }

      if (line.quantity > nft.available) {
        return HttpResponse.json(
          { message: "Estoque insuficiente" },
          { status: 409 },
        );
      }
    }

    const now = new Date().toISOString();

    const orderItems: OrderItem[] = stored.quote.items.map((line) => ({
      nftId: line.nftId,
      edition: line.edition,
      name: line.name,
      unitPrice: line.unitPrice,
      quantity: line.quantity,
      lineTotal: line.lineTotal,
    }));

    const totals: OrderTotals = {
      subtotal: stored.quote.subtotal,
      discount: stored.quote.discount,
      networkFee: stored.quote.networkFee,
      total: stored.quote.total,
      currency: "ETH",
    };

    const order: Order = {
      id: crypto.randomUUID(),
      status: "pending",
      version: 1,
      items: orderItems,
      totals,
      networkId: stored.quote.networkId,
      couponCode:
        stored.quote.couponStatus === "applied"
          ? stored.quote.couponCode
          : null,
      createdAt: now,
      confirmedAt: null,
      transactionHash: null,
      explorerUrl: null,
      refusalReason: null,
    };

    saveOrder(auth.user.id, order);
    saveIdempotencyRecord(auth.user.id, idempotencyKey, {
      orderId: order.id,
      requestHash,
    });

    const userId = auth.user.id;
    const orderId = order.id;

    setTimeout(() => {
      settleOrder(userId, orderId);
    }, 400);

    if (scenario === "timeout") {
      return HttpResponse.json(
        { message: "Tempo limite da transação excedido", orderId: order.id },
        { status: 504 },
      );
    }

    return HttpResponse.json(order, { status: 201 });
  }),
  http.get("/api/orders", ({ request }) => {
    const auth = getRequestUser(request);

    if (!auth.ok) {
      return auth.response;
    }

    return HttpResponse.json(listOrders(auth.user.id));
  }),
  http.get("/api/orders/:id", ({ params, request }) => {
    const auth = getRequestUser(request);

    if (!auth.ok) {
      return auth.response;
    }

    const order = getOrder(auth.user.id, String(params.id));

    if (!order) {
      return HttpResponse.json(
        { message: "Pedido não encontrado" },
        { status: 404 },
      );
    }

    return HttpResponse.json(order);
  }),
  http.get("/api/orders/:id/receipt", ({ params, request }) => {
    const auth = getRequestUser(request);

    if (!auth.ok) {
      return auth.response;
    }

    const order = getOrder(auth.user.id, String(params.id));

    if (!order) {
      return HttpResponse.json(
        { message: "Recibo não encontrado" },
        { status: 404 },
      );
    }

    const receipt: Receipt = {
      orderId: order.id,
      status: order.status,
      items: order.items,
      totals: order.totals,
      networkId: order.networkId,
      transactionHash: order.transactionHash,
      explorerUrl: order.explorerUrl,
      confirmedAt: order.confirmedAt,
    };

    return HttpResponse.json(receipt);
  }),
  http.post("/api/test/reset", () => {
    localStorage.removeItem("marketplace-carts");
    localStorage.removeItem("marketplace-orders");
    localStorage.removeItem("marketplace-quotes");
    resetNfts();
    resetScenario();

    return HttpResponse.json({ ok: true, scenario: getScenario() });
  }),
  http.get("/api/test/scenario", () => {
    return HttpResponse.json({ scenario: getScenario() });
  }),
  http.post("/api/test/scenario", async ({ request }) => {
    const body = (await request.json().catch(() => null)) as {
      scenario?: unknown;
    } | null;

    if (!isScenario(body?.scenario)) {
      return HttpResponse.json(
        { message: "Cenário inválido" },
        { status: 400 },
      );
    }

    setScenario(body.scenario);

    return HttpResponse.json({ ok: true, scenario: body.scenario });
  }),
  http.post("/api/test/nft-updated", async ({ request }) => {
    const body = (await request.json().catch(() => null)) as {
      id?: string;
      version?: number;
      price?: string;
      available?: number;
    } | null;

    if (
      typeof body?.id !== "string" ||
      typeof body.version !== "number" ||
      !Number.isInteger(body.version)
    ) {
      return HttpResponse.json(
        { message: "Payload inválido" },
        { status: 400 },
      );
    }

    const current = getNft(body.id);

    if (!current) {
      return HttpResponse.json(
        { message: "NFT não encontrado" },
        { status: 404 },
      );
    }

    const price = body.price ?? current.price;
    const available = body.available ?? current.available;

    if (body.version > current.version) {
      updateNft(body.id, { price, available, version: body.version });
    }

    emitNftUpdated({ id: body.id, version: body.version, price, available });

    return HttpResponse.json({ ok: true });
  }),
  http.post("/api/auth/signup", async ({ request }) => {
    const body: unknown = await request.json();

    if (
      typeof body !== "object" ||
      body === null ||
      !("name" in body) ||
      !("email" in body) ||
      !("password" in body) ||
      typeof body.name !== "string" ||
      typeof body.email !== "string" ||
      typeof body.password !== "string"
    ) {
      return HttpResponse.json(
        { message: "Nome, e-mail e senha são obrigatórios" },
        { status: 400 },
      );
    }

    const name = body.name.trim();
    const email = body.email.trim().toLowerCase();
    const password = body.password;

    if (name.length < 2) {
      return HttpResponse.json(
        { message: "O nome deve ter pelo menos 2 caracteres" },
        { status: 400 },
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return HttpResponse.json(
        { message: "Informe um e-mail válido" },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return HttpResponse.json(
        { message: "A senha deve ter pelo menos 8 caracteres" },
        { status: 400 },
      );
    }

    try {
      const account = createUser(name, email, password);

      return HttpResponse.json(account.user, {
        status: 201,
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "Este e-mail já está cadastrado"
      ) {
        return HttpResponse.json({ message: error.message }, { status: 409 });
      }

      return HttpResponse.json(
        { message: "Não foi possível realizar o cadastro" },
        { status: 500 },
      );
    }
  }),
];
