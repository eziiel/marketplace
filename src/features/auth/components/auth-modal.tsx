import { useEffect, useRef, type MouseEvent } from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import { LoginForm } from "./login-form";
import { SignupForm } from "./signup-form";

export type AuthMode = "login" | "signup";

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),[tabindex]:not([tabindex="-1"])';

interface AuthModalProps {
  mode: AuthMode;
  onClose: () => void;
  onModeChange: (mode: AuthMode) => void;
}

export function AuthModal({ mode, onClose, onModeChange }: AuthModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const body = document.body;
    const previousOverflow = body.style.overflow;
    body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key !== "Tab") return;

      const node = dialogRef.current;
      if (!node) return;

      const focusables = Array.from(
        node.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).filter((element) => element.offsetParent !== null);

      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, []);

  useEffect(() => {
    const node = dialogRef.current;
    const field = node?.querySelector<HTMLElement>(
      'input:not([disabled]),a[href],button:not([disabled])',
    );
    field?.focus();
  }, [mode]);

  function handleOverlayClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  const tabs: { value: AuthMode; label: string }[] = [
    { value: "login", label: "Entrar" },
    { value: "signup", label: "Criar conta" },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 px-4 py-10 backdrop-blur-sm sm:items-center"
      onClick={handleOverlayClick}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={mode === "login" ? "Entrar na Kurio" : "Criar conta na Kurio"}
        className="relative w-full max-w-md rounded-2xl border border-border bg-popover p-6 shadow-2xl shadow-black/50"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="absolute top-4 right-4 grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary"
        >
          <X className="size-4" aria-hidden />
        </button>

        <div
          role="tablist"
          aria-label="Acesso à conta"
          className="mb-4 flex items-center gap-5 pr-8 text-lg"
        >
          {tabs.map((tab) => {
            const active = tab.value === mode;
            return (
              <button
                key={tab.value}
                type="button"
                role="tab"
                aria-selected={active}
                tabIndex={active ? 0 : -1}
                onClick={() => onModeChange(tab.value)}
                className={cn(
                  "relative pb-1 font-semibold transition-colors",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {tab.label}
                {active && (
                  <span
                    aria-hidden
                    className="absolute -bottom-0.5 left-0 h-0.5 w-full rounded-full bg-primary"
                  />
                )}
              </button>
            );
          })}
        </div>

        {mode === "login" ? <LoginForm onSuccess={onClose} /> : <SignupForm />}
      </div>
    </div>
  );
}
