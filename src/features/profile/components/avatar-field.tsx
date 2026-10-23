import { useId, useRef, useState, type ChangeEvent } from "react";
import { Smile } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AVATAR_TYPES, readAvatarFile } from "../lib/avatar";

export function AvatarField({
  value,
  error,
  onChange,
}: {
  value: string | null;
  error?: string;
  onChange: (value: string | null) => void;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) return;

    const result = await readAvatarFile(file);

    if (!result.ok) {
      setLocalError(result.message);
      return;
    }

    setLocalError(null);
    onChange(result.dataUrl);
  }

  const message = localError ?? error;

  return (
    <div className="min-w-0">
      <span className="block text-[15px] text-foreground">Avatar</span>

      <div className="mt-3 flex items-center gap-4">
        <span className="grid size-[54px] shrink-0 place-items-center overflow-hidden rounded-full bg-muted text-muted-foreground">
          {value ? (
            <img
              src={value}
              alt="Avatar atual do colecionador"
              className="size-full object-cover"
            />
          ) : (
            <Smile className="size-6" aria-hidden />
          )}
        </span>

        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={AVATAR_TYPES.join(",")}
          onChange={(event) => void handleFile(event)}
          className="sr-only"
        />

        <Button
          size="lg"
          onClick={() => inputRef.current?.click()}
          className="h-10 rounded-[4px] px-6 text-sm font-bold"
        >
          Alterar
        </Button>

        <button
          type="button"
          onClick={() => {
            setLocalError(null);
            onChange(null);
          }}
          disabled={!value}
          className="text-sm text-foreground transition-colors hover:text-highlight focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          Remover
        </button>
      </div>

      <p
        role={message ? "alert" : undefined}
        className="mt-1.5 min-h-4 text-xs text-destructive"
      >
        {message}
      </p>
    </div>
  );
}
