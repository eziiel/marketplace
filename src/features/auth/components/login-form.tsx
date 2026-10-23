import { useState, type FormEvent } from "react";
import { TriangleAlert } from "lucide-react";

import { useLogin } from "../hooks/use-login";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "./password-input";
import { SocialAuth } from "./social-auth";

export function LoginForm({ onSuccess }: { onSuccess?: () => void }) {
  const loginMutation = useLogin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [recoveryRequested, setRecoveryRequested] = useState(false);

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
    <>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <p className="mb-2 text-center text-[13px] leading-[18px] text-foreground">
          Entre para gerenciar sua carteira, coleção e perfil de criador.
        </p>

        <Input
          type="email"
          aria-label="E-mail"
          autoComplete="email"
          required
          placeholder="contato@email.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <PasswordInput
          aria-label="Senha"
          autoComplete="current-password"
          required
          placeholder="••••••••"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        <div className="flex flex-col items-end gap-1">
          <button
            type="button"
            onClick={() => setRecoveryRequested(true)}
            className="text-[13px] text-highlight transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Esqueceu a senha?
          </button>
          {recoveryRequested && (
            <p role="status" className="text-[13px] text-muted-foreground">
              A recuperação de senha estará disponível em breve.
            </p>
          )}
        </div>

        {loginMutation.isError && (
          <p
            role="alert"
            className="flex items-center gap-2 rounded-[4px] border border-destructive/30 bg-destructive/10 px-3 py-2 text-[13px] text-destructive"
          >
            <TriangleAlert className="size-4 shrink-0" aria-hidden />
            Não foi possível entrar. Verifique suas credenciais.
          </p>
        )}

        <Button
          type="submit"
          size="lg"
          disabled={loginMutation.isPending}
          className="mt-3 h-11 w-full rounded-[4px] text-[15px] font-bold"
        >
          {loginMutation.isPending ? "Entrando..." : "Entrar"}
        </Button>
      </form>

      <SocialAuth />
    </>
  );
}
