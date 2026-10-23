import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import axios from "axios";

import { useSignup } from "../hooks/use-signup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SignupPage() {
  const signup = useSignup();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await signup.mutateAsync({ name, email, password });
      setSuccess(true);
    } catch {
      // O erro é apresentado a partir do estado da mutation.
    }
  }

  const errorMessage = axios.isAxiosError(signup.error)
    ? signup.error.response?.data?.message
    : "Não foi possível realizar o cadastro.";

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <Link
          to="/"
          search={{ page: 1 }}
          className="block text-center text-3xl font-bold tracking-[0.2em] text-primary"
        >
          KURIO
        </Link>

        <section className="rounded-2xl border border-border bg-card p-6 shadow-xl sm:p-8">
          {success ? (
            <div className="space-y-5 text-center" role="status">
              <h1 className="text-2xl font-semibold">Cadastro realizado!</h1>

              <p className="text-muted-foreground">
                Sua conta foi criada. Agora faça login para continuar.
              </p>
              <Link
                to="/login"
                className="inline-flex w-full cursor-pointer items-center justify-center rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground"
              >
                Ir para o login
              </Link>
            </div>
          ) : (
            <>
              <h1 className="mb-2 text-2xl font-semibold">Criar conta</h1>

              <p className="mb-8 text-sm text-muted-foreground">
                Cadastre-se para explorar o marketplace Kurio.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="signup-name" className="text-sm">
                    Nome completo
                  </label>
                  <Input
                    id="signup-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                    minLength={2}
                    autoComplete="name"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="signup-email" className="text-sm">
                    E-mail
                  </label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="signup-password" className="text-sm">
                    Senha
                  </label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    minLength={8}
                    autoComplete="new-password"
                  />
                </div>

                {signup.isError && (
                  <p role="alert" className="text-sm text-destructive">
                    {typeof errorMessage === "string"
                      ? errorMessage
                      : "Não foi possível realizar o cadastro."}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={signup.isPending}
                  className="w-full cursor-pointer"
                >
                  {signup.isPending ? "Criando conta..." : "Criar conta"}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                Já possui conta?{" "}
                <Link
                  to="/login"
                  className="font-medium text-primary hover:underline"
                >
                  Entrar
                </Link>
              </p>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
