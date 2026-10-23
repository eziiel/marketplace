import { Link, useNavigate } from "@tanstack/react-router";
import { Search, ShoppingCart, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button-variants";

export interface NavItem {
  label: string;
  href: string;
}

const defaultNavItems: NavItem[] = [
  { label: "Início", href: "/" },
  { label: "Mercado", href: "/#catalogo" },
  { label: "Criadores", href: "/#criadores" },
  { label: "Aprenda", href: "/#aprenda" },
];

export interface SiteHeaderProps {
  navItems?: NavItem[];
  cartCount?: number;
  isAuthenticated?: boolean;
  userName?: string;
  activeNav?: string;
  onLogout?: () => void;
  onSearch?: () => void;
  className?: string;
}

export function SiteHeader({
  navItems = defaultNavItems,
  cartCount = 0,
  isAuthenticated = false,
  userName,
  activeNav = "Início",
  onLogout,
  onSearch,
  className,
}: SiteHeaderProps) {
  const navigate = useNavigate();

  const handleSearch =
    onSearch ??
    (() =>
      void navigate({
        to: "/",
        search: { search: "", page: 1, sort: "price_asc" },
      }));

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b border-border bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70",
        className,
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          search={{ search: "", page: 1, sort: "price_asc" }}
          className="flex items-center gap-2 text-foreground"
          aria-label="Kurio — página inicial"
        >
          <span
            aria-hidden
            className="grid size-7 place-items-center rounded-md bg-primary text-sm font-bold text-primary-foreground"
          >
            k
          </span>
          <span className="text-lg font-semibold lowercase tracking-tight">
            kurio
          </span>
        </Link>

        <nav
          aria-label="Principal"
          className="absolute left-1/2 hidden -translate-x-1/2 md:block"
        >
          <ul className="flex items-center gap-7 text-sm">
            {navItems.map((item) => {
              const active = item.label === activeNav;
              return (
                <li key={item.label}>
                  <a
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative py-1 transition-colors",
                      active
                        ? "font-medium text-primary"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {item.label}
                    {active && (
                      <span
                        aria-hidden
                        className="absolute -bottom-0.5 left-0 h-0.5 w-full rounded-full bg-primary"
                      />
                    )}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={handleSearch}
            aria-label="Pesquisar coleções"
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "text-muted-foreground hover:text-foreground",
            )}
          >
            <Search aria-hidden />
          </button>

          <Link
            to="/cart"
            aria-label={
              cartCount > 0 ? `Carrinho, ${cartCount} itens` : "Carrinho, vazio"
            }
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "relative text-muted-foreground hover:text-foreground",
            )}
          >
            <ShoppingCart aria-hidden />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              {userName && (
                <span className="hidden max-w-32 truncate text-sm text-muted-foreground sm:inline">
                  Olá, <span className="text-foreground">{userName}</span>
                </span>
              )}
              <button
                type="button"
                onClick={onLogout}
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "h-9 px-3",
                )}
              >
                Sair
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-9 gap-1.5 px-4 font-semibold",
              )}
            >
              <User className="size-4" aria-hidden />
              Entrar
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
