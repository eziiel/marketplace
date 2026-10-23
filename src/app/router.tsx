import {
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";

import { CatalogPage } from "@/features/catalog/pages/catalog-page";
import { NftDetailsPage } from "@/features/catalog/pages/nft-details-page";
import type { NftListParams } from "@/features/catalog/types/nft";
import { CartPage } from "@/features/cart/pages/cart-page";
import { CheckoutPage } from "@/features/checkout/pages/checkout-page";
import { ConfirmationPage } from "@/features/checkout/pages/confirmation-page";
import { getAuthToken } from "@/features/auth/lib/auth-token";
import type { AuthMode } from "@/features/auth/components/auth-modal";
import { RootLayout } from "./root-layout";
import { parseAuthMode } from "./auth-search";

const CATALOG_SEARCH = {
  search: "",
  page: 1,
  sort: "price_asc" as const,
};

function requireAuth() {
  if (!getAuthToken()) {
    throw redirect({
      to: "/",
      search: { ...CATALOG_SEARCH, auth: "login" },
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
    search: typeof search.search === "string" ? search.search : "",

    page:
      typeof search.page === "number" &&
      Number.isInteger(search.page) &&
      search.page > 0
        ? search.page
        : 1,

    sort:
      search.sort === "price_asc" || search.sort === "price_desc"
        ? search.sort
        : "price_asc",
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
    throw redirect({ to: "/", search: { ...CATALOG_SEARCH, auth: "login" } });
  },
});

const signupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/signup",
  beforeLoad: () => {
    throw redirect({ to: "/", search: { ...CATALOG_SEARCH, auth: "signup" } });
  },
});

const checkoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/checkout",
  beforeLoad: requireAuth,
  component: CheckoutPage,
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
]);

export const router = createRouter({ routeTree, defaultPreload: false });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
