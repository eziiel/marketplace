import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { Eye, EyeOff, TriangleAlert } from "lucide-react";

import { useLogin } from "../hooks/use-login";
import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LoginPage() {
  const navigate = useNavigate();
  const loginMutation = useLogin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    loginMutation.mutate(
      { email, password },
      {
        onSuccess: () => {
          void navigate({
            to: "/",
            search: {
              search: "",
              page: 1,
              sort: "price_asc",
            },
          });
        },
      },
    );
  }

  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <Link
          to="/"
          search={{ page: 1 }}
          aria-label="Kurio — página inicial"
          className="mb-8 flex items-center justify-center gap-2"
        >
          <span
            aria-hidden
            className="grid size-8 place-items-center rounded-lg bg-primary text-base font-bold text-primary-foreground"
          >
            k
          </span>
          <span className="text-2xl font-bold tracking-[0.35em] text-foreground">
            KURIO
          </span>
        </Link>

        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
          <h1 className="m-0 text-center text-xl font-semibold text-foreground">
            Entrar no Kurio
          </h1>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Entre para gerenciar sua carteira e coleções.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="text-sm font-medium text-foreground"
              >
                E-mail
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                placeholder="contato@email.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="text-sm font-medium text-foreground"
              >
                Senha
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  className="pr-11"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={
                    showPassword ? "Ocultar caracteres" : "Mostrar caracteres"
                  }
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" aria-hidden />
                  ) : (
                    <Eye className="size-4" aria-hidden />
                  )}
                </button>
              </div>
            </div>

            {loginMutation.isError && (
              <p
                role="alert"
                className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                <TriangleAlert className="size-4 shrink-0" aria-hidden />
                Não foi possível entrar. Verifique suas credenciais.
              </p>
            )}

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className={cn(buttonVariants({ size: "lg" }), "h-11 w-full text-sm")}
            >
              {loginMutation.isPending ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
