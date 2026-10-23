import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import axios from "axios";
import { CheckCircle2 } from "lucide-react";

import { useSignup } from "../hooks/use-signup";
import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

export function SignupForm() {
  const signup = useSignup();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    signup.mutate(
      { name, email, password },
      { onSuccess: () => setSuccess(true) },
    );
  }

  const errorMessage = axios.isAxiosError(signup.error)
    ? signup.error.response?.data?.message
    : "Não foi possível realizar o cadastro.";

  if (success) {
    return (
      <div className="space-y-4 py-2 text-center" role="status">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-primary/15 text-primary">
          <CheckCircle2 className="size-6" aria-hidden />
        </span>
        <h3 className="m-0 text-lg font-semibold text-foreground">
          Cadastro realizado!
        </h3>
        <p className="text-sm text-muted-foreground">
          Sua conta foi criada. Agora faça login para continuar.
        </p>
        <Link
          to="/login"
          className={cn(
            buttonVariants({ size: "lg" }),
            "h-11 w-full text-sm",
          )}
        >
          Ir para o login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Crie seu perfil de colecionador e conecte uma carteira quando quiser.
      </p>

      <Input
        aria-label="Nome completo"
        placeholder="Nome de usuário"
        value={name}
        onChange={(event) => setName(event.target.value)}
        required
        minLength={2}
        autoComplete="name"
      />

      <Input
        type="email"
        aria-label="E-mail"
        placeholder="Digite seu e-mail"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
        autoComplete="email"
      />

      <Input
        type="password"
        aria-label="Senha"
        placeholder="Senha"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
        minLength={8}
        autoComplete="new-password"
      />

      {signup.isError && (
        <p role="alert" className="text-sm text-destructive">
          {typeof errorMessage === "string"
            ? errorMessage
            : "Não foi possível realizar o cadastro."}
        </p>
      )}

      <button
        type="submit"
        disabled={signup.isPending}
        className={cn(buttonVariants({ size: "lg" }), "h-11 w-full text-sm")}
      >
        {signup.isPending ? "Criando conta..." : "Criar conta"}
      </button>
    </form>
  );
}
