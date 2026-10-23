import { Fragment, useEffect, useRef, type MouseEvent } from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import { LoginForm } from "./login-form";
import { SignupForm } from "./signup-form";

export type AuthMode = "login" | "signup";

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),[tabindex]:not([tabindex="-1"])';

const TABS: { value: AuthMode; label: string }[] = [
  { value: "login", label: "Entrar" },
  { value: "signup", label: "Criar conta" },
];

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
    const field =
      node?.querySelector<HTMLElement>("input:not([disabled])") ??
      node?.querySelector<HTMLElement>(FOCUSABLE);
    field?.focus();
  }, [mode]);

  function handleOverlayClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

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
        className="relative w-full max-w-[500px] overflow-hidden bg-card shadow-2xl shadow-black/50"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="absolute top-2 right-2 grid size-6 place-items-center text-primary transition-colors hover:text-highlight focus-visible:outline-2 focus-visible:outline-primary"
        >
          <X className="size-4" aria-hidden />
        </button>

        <div className="px-6 pt-11 pb-16 sm:px-20">
          <div
            role="tablist"
            aria-label="Acesso à conta"
            className="flex items-center justify-center gap-1.5 text-xl font-bold"
          >
            {TABS.map((tab, index) => {
              const active = tab.value === mode;
              return (
                <Fragment key={tab.value}>
                  {index > 0 && (
                    <span aria-hidden className="h-5 w-0.5 bg-primary/60" />
                  )}
                  <button
                    type="button"
                    role="tab"
                    aria-selected={active}
                    tabIndex={active ? 0 : -1}
                    onClick={() => onModeChange(tab.value)}
                    className={cn(
                      "transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary",
                      active
                        ? "text-highlight"
                        : "text-foreground hover:text-highlight",
                    )}
                  >
                    {tab.label}
                  </button>
                </Fragment>
              );
            })}
          </div>

          <div className="mt-9">
            {mode === "login" ? <LoginForm onSuccess={onClose} /> : <SignupForm />}
          </div>
        </div>

        <div aria-hidden className="h-2.5 bg-primary" />
      </div>
    </div>
  );
}
