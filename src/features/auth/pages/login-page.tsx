import { useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useLogin } from "../hooks/use-login";

export function LoginPage() {
  const navigate = useNavigate();
  const loginMutation = useLogin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
    <main>
      <h1>Entrar no Kurio</h1>

      <form onSubmit={handleSubmit}>
        <label htmlFor="email">E-mail</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <label htmlFor="password">Senha</label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        <button type="submit" disabled={loginMutation.isPending}>
          {loginMutation.isPending ? "Entrando..." : "Entrar"}
        </button>

        {loginMutation.isError && (
          <p role="alert">
            Não foi possível entrar. Verifique suas credenciais.
          </p>
        )}
      </form>
    </main>
  );
}
