import { Outlet, useNavigate, useSearch } from "@tanstack/react-router";

import { AuthModal, type AuthMode } from "@/features/auth/components/auth-modal";
import { parseAuthMode } from "./auth-search";

export function RootLayout() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { auth?: unknown };
  const mode = parseAuthMode(search.auth);
  const open = mode !== undefined;

  function closeModal() {
    void navigate({
      to: "/",
      search: (previous) => ({
        ...previous,
        page: previous.page ?? 1,
        auth: undefined,
      }),
    });
  }

  function changeMode(next: AuthMode) {
    void navigate({
      to: "/",
      search: (previous) => ({
        ...previous,
        page: previous.page ?? 1,
        auth: next,
      }),
    });
  }

  return (
    <>
      <div inert={open ? true : undefined}>
        <Outlet />
      </div>
      {open && (
        <AuthModal mode={mode} onClose={closeModal} onModeChange={changeMode} />
      )}
    </>
  );
}
