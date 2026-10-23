import { useEffect } from "react";
import { Outlet, useNavigate, useSearch } from "@tanstack/react-router";

import { onSessionExpired } from "@/lib/session-expiry";

import { AuthModal, type AuthMode } from "@/features/auth/components/auth-modal";
import { parseAuthMode } from "./auth-search";

export function RootLayout() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { auth?: unknown };
  const mode = parseAuthMode(search.auth);
  const open = mode !== undefined;

  useEffect(() => {
    return onSessionExpired(() => {
      void navigate({ to: "/", search: { page: 1, auth: "login" } });
    });
  }, [navigate]);

  function closeModal() {
    void navigate({
      to: ".",
      search: (previous) => ({ ...previous, auth: undefined }),
    });
  }

  function changeMode(next: AuthMode) {
    void navigate({
      to: ".",
      search: (previous) => ({ ...previous, auth: next }),
    });
  }

  return (
    <>
      <Outlet />
      {open && (
        <AuthModal mode={mode} onClose={closeModal} onModeChange={changeMode} />
      )}
    </>
  );
}
