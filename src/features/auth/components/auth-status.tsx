import { Link } from "@tanstack/react-router";
import { useAuthMe } from "../hooks/use-auth-me";
import { useLogout } from "../hooks/use-logout";
import { getAuthToken } from "../lib/auth-token";

export function AuthStatus() {
  const { data, isPending, isError } = useAuthMe();
  const logoutMutation = useLogout();

  if (!getAuthToken()) {
    return <Link to="/login">Entrar</Link>;
  }

  if (isPending) return <p>Verificando sessão...</p>;

  if (isError || !data) {
    return <p>Sessão expirada. Entre novamente.</p>;
  }

  return (
    <div>
      <span>Olá, {data.user.name}</span>

      <button
        type="button"
        disabled={logoutMutation.isPending}
        onClick={() => logoutMutation.mutate()}
      >
        Sair
      </button>
    </div>
  );
}
