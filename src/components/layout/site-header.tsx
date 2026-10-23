import { Link } from "@tanstack/react-router";
import { Search, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export interface NavItem {
  label: string;
  href: string;
}

const defaultNavItems: NavItem[] = [
  { label: "Início", href: "/" },
  { label: "Mercado", href: "/#mercado" },
  { label: "Criadores", href: "/#criadores" },
  { label: "Aprenda", href: "/#aprenda" },
];

export interface SiteHeaderProps {
  navItems?: NavItem[];
  cartCount?: number;
  isAuthenticated?: boolean;
  userName?: string;
  onLogout?: () => void;
  onSearch?: () => void;
  className?: string;
}

export function SiteHeader({
  navItems = defaultNavItems,
  cartCount = 0,
  isAuthenticated = false,
  userName,
  onLogout,
  onSearch,
  className,
}: SiteHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70",
        className,
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link
            to="/"
            search={{ page: 1 }}
            className="flex items-center gap-2 text-foreground"
            aria-label="Kurio — página inicial"
          >
            <span
              aria-hidden
              className="grid size-7 place-items-center rounded-lg bg-primary text-sm font-bold text-primary-foreground"
            >
              k
            </span>
            <span className="text-lg font-semibold tracking-tight">kurio</span>
          </Link>

          <nav aria-label="Principal" className="hidden md:block">
            <ul className="flex items-center gap-6 text-sm">
              {navItems.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="text-muted-foreground transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={onSearch}
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
              cartCount > 0
                ? `Carrinho, ${cartCount} itens`
                : "Carrinho, vazio"
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
                )}
              >
                Sair
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className={cn(buttonVariants({ size: "lg" }), "px-5")}
            >
              Entrar
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
