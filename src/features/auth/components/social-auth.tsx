import { useState } from "react";

import { FacebookIcon, GoogleIcon } from "@/components/icons/social-icons";

const PROVIDERS = [
  { name: "Google", Icon: GoogleIcon },
  { name: "Facebook", Icon: FacebookIcon },
] as const;

export function SocialAuth() {
  const [requested, setRequested] = useState<string | null>(null);

  return (
    <div className="mt-6">
      <div className="relative flex items-center justify-center">
        <span
          aria-hidden
          className="absolute -inset-x-6 top-1/2 h-px bg-border sm:-inset-x-20"
        />
        <span className="relative bg-card px-3 text-[13px] text-foreground">
          Ou continue com
        </span>
      </div>

      <div className="mt-3 flex flex-col gap-3">
        {PROVIDERS.map(({ name, Icon }) => (
          <button
            key={name}
            type="button"
            onClick={() => setRequested(name)}
            className="flex h-10 w-full items-center justify-center gap-3 rounded-[4px] border border-border bg-card text-[13px] text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground focus-visible:border-primary focus-visible:outline-none"
          >
            <Icon className="size-5" />
            Continuar com {name}
          </button>
        ))}
      </div>

      {requested && (
        <p
          role="status"
          className="mt-3 text-center text-[13px] text-muted-foreground"
        >
          Entrar com {requested} estará disponível em breve.
        </p>
      )}
    </div>
  );
}
