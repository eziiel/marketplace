import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate, useSearch } from "@tanstack/react-router";
import { LogIn, Search, ShoppingCart, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button-variants";
import { useCartCount } from "@/features/cart/hooks/use-cart-count";

export interface NavItem {
  label: string;
  hash?: string;
}

const NAV_ACTIVE_OPTIONS = {
  exact: true,
  includeSearch: false,
  includeHash: true,
} as const;

const defaultNavItems: NavItem[] = [
  { label: "Início" },
  { label: "Mercado", hash: "catalogo" },
  { label: "Criadores", hash: "criadores" },
  { label: "Aprenda", hash: "aprenda" },
];

export interface SiteHeaderProps {
  navItems?: NavItem[];
  cartCount?: number;
  isAuthenticated?: boolean;
  userName?: string;
  activeNav?: string;
  onLogout?: () => void;
  className?: string;
}

interface KeyedState<T> {
  key: string;
  value: T;
}

export function SiteHeader({
  navItems = defaultNavItems,
  cartCount,
  isAuthenticated = false,
  userName,
  activeNav,
  onLogout,
  className,
}: SiteHeaderProps) {
  const navigate = useNavigate();
  const { hash } = useLocation();
  const search = useSearch({ strict: false }) as { search?: unknown };
  const currentSearch =
    typeof search.search === "string" ? search.search : "";

  const liveCartCount = useCartCount();
  const count = cartCount ?? liveCartCount;

  const [openState, setOpenState] = useState<KeyedState<boolean> | null>(null);
  const [termState, setTermState] = useState<KeyedState<string> | null>(null);
  const [autoFocus, setAutoFocus] = useState(false);

  const searchOpen =
    openState?.key === currentSearch
      ? openState.value
      : currentSearch.length > 0;
  const term = termState?.key === currentSearch ? termState.value : currentSearch;

  const resolvedActiveNav =
    activeNav ??
    navItems.find((item) => item.hash !== undefined && item.hash === hash)
      ?.label ??
    "Início";

  function toggleSearch() {
    setAutoFocus(!searchOpen);
    setOpenState({ key: currentSearch, value: !searchOpen });
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const value = term.trim();

    void navigate({
      to: "/",
      search: (previous) => ({
        ...previous,
        search: value.length > 0 ? value : undefined,
        page: 1,
      }),
      hash: "catalogo",
    });
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/80",
        className,
      )}
    >
      <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="grid h-[68px] grid-cols-[1fr_auto_1fr] items-center gap-4">
          <Link
            to="/"
            search={{ page: 1 }}
            className="text-sm font-bold tracking-[0.25em] text-foreground focus-visible:outline-2 focus-visible:outline-highlight"
          >
            KURIO
          </Link>

          <nav
            aria-label="Principal"
            className="hidden h-full justify-self-center md:block"
          >
            <ul className="flex h-full items-center gap-5 text-[15px] lg:gap-10">
              {navItems.map((item) => {
                const active = item.label === resolvedActiveNav;

                return (
                  <li key={item.label} className="h-full">
                    <Link
                      to="/"
                      search={{ page: 1 }}
                      hash={item.hash}
                      activeOptions={NAV_ACTIVE_OPTIONS}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "relative flex h-full items-center transition-colors focus-visible:outline-2 focus-visible:outline-highlight",
                        active
                          ? "font-medium text-highlight"
                          : "text-foreground hover:text-highlight",
                      )}
                    >
                      {item.label}
                      {active && (
                        <span
                          aria-hidden
                          className="absolute bottom-0 left-0 h-0.5 w-full bg-highlight"
                        />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center justify-self-end gap-1.5 sm:gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSearch}
              aria-label={searchOpen ? "Fechar busca" : "Abrir busca"}
              aria-expanded={searchOpen}
              aria-controls="site-search"
              className="size-9 text-foreground hover:text-highlight"
            >
              {searchOpen ? (
                <X className="size-5" aria-hidden />
              ) : (
                <Search className="size-5" aria-hidden />
              )}
            </Button>

            <Link
              to="/cart"
              aria-label={
                count > 0
                  ? `Carrinho, ${count} ${count === 1 ? "item" : "itens"}`
                  : "Carrinho, vazio"
              }
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon" }),
                "relative size-9 text-foreground hover:text-highlight",
              )}
            >
              <ShoppingCart className="size-5" aria-hidden />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                  {count > 99 ? "99+" : count}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                {userName && (
                  <Link
                    to="/profile"
                    className="hidden max-w-32 truncate text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline"
                  >
                    Olá, <span className="text-foreground">{userName}</span>
                  </Link>
                )}
                <Button
                  variant="outline"
                  size="lg"
                  onClick={onLogout}
                  className="h-9 rounded-[4px] px-3"
                >
                  Sair
                </Button>
              </div>
            ) : (
              <Link
                to="/login"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-9 gap-2 rounded-[4px] px-4 text-sm font-bold",
                )}
              >
                <LogIn className="size-4" aria-hidden />
                Entrar
              </Link>
            )}
          </div>
        </div>

        {searchOpen && (
          <form
            id="site-search"
            role="search"
            onSubmit={submitSearch}
            className="flex items-center gap-2 pb-3 md:justify-end"
          >
            <label htmlFor="site-search-input" className="sr-only">
              Buscar NFTs
            </label>
            <Input
              id="site-search-input"
              type="search"
              autoFocus={autoFocus}
              value={term}
              onChange={(event) =>
                setTermState({ key: currentSearch, value: event.target.value })
              }
              placeholder="Buscar NFTs..."
              className="h-9 bg-card px-3 focus-visible:border-highlight md:w-72"
            />
            <Button
              type="submit"
              size="lg"
              className="h-9 rounded-[4px] px-3 text-sm font-semibold"
            >
              Buscar
            </Button>
          </form>
        )}
      </div>
    </header>
  );
}
