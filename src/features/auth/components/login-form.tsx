import { useState, type FormEvent } from "react";
import { Eye, EyeOff, TriangleAlert } from "lucide-react";

import { useLogin } from "../hooks/use-login";
import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

export function LoginForm({ onSuccess }: { onSuccess?: () => void }) {
  const loginMutation = useLogin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    loginMutation.mutate(
      { email, password },
      {
        onSuccess: () => onSuccess?.(),
      },
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Entre para gerenciar sua carteira, coleção e perfil de criador.
      </p>

      <div className="space-y-1.5">
        <Input
          type="email"
          aria-label="E-mail"
          autoComplete="email"
          required
          placeholder="contato@email.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            aria-label="Senha"
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
  );
}
