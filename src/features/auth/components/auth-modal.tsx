import { Fragment, useEffect, useRef } from "react";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { LoginForm } from "./login-form";
import { SignupForm } from "./signup-form";

export type AuthMode = "login" | "signup";

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
  const panelRef = useRef<HTMLDivElement>(null);

  function firstField() {
    return panelRef.current?.querySelector<HTMLElement>(
      "input:not([disabled])",
    );
  }

  useEffect(() => {
    firstField()?.focus();
  }, [mode]);

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        aria-label={mode === "login" ? "Entrar na Kurio" : "Criar conta na Kurio"}
        initialFocus={() => firstField() ?? true}
        className="max-h-[calc(100svh-5rem)] gap-0 overflow-y-auto p-0 sm:max-w-[500px]"
      >
        <div ref={panelRef} className="px-6 pt-11 pb-16 sm:px-20">
          <Tabs
            value={mode}
            onValueChange={(value) => onModeChange(value as AuthMode)}
            className="gap-0"
          >
            <TabsList
              variant="line"
              aria-label="Acesso à conta"
              className="h-auto w-full justify-center gap-1.5 rounded-none bg-transparent p-0 text-xl font-bold"
            >
              {TABS.map((tab, index) => (
                <Fragment key={tab.value}>
                  {index > 0 && (
                    <span aria-hidden className="h-5 w-0.5 bg-primary/60" />
                  )}
                  <TabsTrigger
                    value={tab.value}
                    className="h-auto flex-none rounded-none p-0 text-xl font-bold text-foreground after:hidden hover:text-highlight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary data-active:text-highlight"
                  >
                    {tab.label}
                  </TabsTrigger>
                </Fragment>
              ))}
            </TabsList>

            <TabsContent value="login" className="mt-9">
              <LoginForm onSuccess={onClose} />
            </TabsContent>

            <TabsContent value="signup" className="mt-9">
              <SignupForm />
            </TabsContent>
          </Tabs>
        </div>

        <div aria-hidden className="h-2.5 bg-primary" />
      </DialogContent>
    </Dialog>
  );
}
