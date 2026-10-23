import {
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";

import { CatalogPage } from "@/features/catalog/pages/catalog-page";
import { NftDetailsPage } from "@/features/catalog/pages/nft-details-page";
import type {
  NftListParams,
  NftNetwork,
  NftSort,
  NftTab,
} from "@/features/catalog/types/nft";
import { CartPage } from "@/features/cart/pages/cart-page";
import { CheckoutPage } from "@/features/checkout/pages/checkout-page";
import { ProfilePage } from "@/features/profile/pages/profile-page";
import { WalletsPage } from "@/features/wallets/pages/wallets-page";
import { ConfirmationPage } from "@/features/checkout/pages/confirmation-page";
import { getAuthToken } from "@/features/auth/lib/auth-token";
import type { AuthMode } from "@/features/auth/components/auth-modal";
import { RootLayout } from "./root-layout";
import { parseAuthMode } from "./auth-search";

const NETWORKS: readonly NftNetwork[] = ["ethereum", "polygon", "solana"];
const SORTS: readonly NftSort[] = ["recent", "price_asc", "price_desc"];
const TABS: readonly NftTab[] = ["all", "new", "trending"];
const DECIMAL = /^\d+(\.\d+)?$/;

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0
    ? value
    : undefined;
}

function optionalDecimal(value: unknown): string | undefined {
  return typeof value === "string" && DECIMAL.test(value) ? value : undefined;
}

function oneOf<T extends string>(
  value: unknown,
  options: readonly T[],
): T | undefined {
  return typeof value === "string" &&
    (options as readonly string[]).includes(value)
    ? (value as T)
    : undefined;
}

function requireAuth() {
  if (!getAuthToken()) {
    throw redirect({
      to: "/",
      search: { page: 1, auth: "login" },
    });
  }
}

const rootRoute = createRootRoute({
  validateSearch: (search: Record<string, unknown>): { auth?: AuthMode } => ({
    auth: parseAuthMode(search.auth),
  }),
  component: RootLayout,
});

const catalogRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",

  validateSearch: (search: Record<string, unknown>): NftListParams => ({
    search: optionalString(search.search),

    page:
      typeof search.page === "number" &&
      Number.isInteger(search.page) &&
      search.page > 0
        ? search.page
        : 1,

    sort: oneOf(search.sort, SORTS),
    collection: optionalString(search.collection),
    network: oneOf(search.network, NETWORKS),
    minPrice: optionalDecimal(search.minPrice),
    maxPrice: optionalDecimal(search.maxPrice),
    tab: oneOf(search.tab, TABS),
  }),

  component: CatalogPage,
});

const nftDetailsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/nfts/$id",
  component: NftDetailsPage,
});

const cartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/cart",
  component: CartPage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  beforeLoad: () => {
    throw redirect({ to: "/", search: { page: 1, auth: "login" } });
  },
});

const signupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/signup",
  beforeLoad: () => {
    throw redirect({ to: "/", search: { page: 1, auth: "signup" } });
  },
});

const checkoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/checkout",
  beforeLoad: requireAuth,
  component: CheckoutPage,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  beforeLoad: requireAuth,
  component: ProfilePage,
});

const walletsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile/wallets",
  beforeLoad: requireAuth,

  validateSearch: (search: Record<string, unknown>): { from?: "checkout" } => ({
    from: search.from === "checkout" ? "checkout" : undefined,
  }),

  component: WalletsPage,
});

const confirmationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/orders/$orderId",
  beforeLoad: requireAuth,
  component: ConfirmationPage,
});

const routeTree = rootRoute.addChildren([
  catalogRoute,
  nftDetailsRoute,
  cartRoute,
  loginRoute,
  signupRoute,
  checkoutRoute,
  confirmationRoute,
  profileRoute,
  walletsRoute,
]);

export const router = createRouter({ routeTree, defaultPreload: false });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
