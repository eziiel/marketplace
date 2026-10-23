import { useEffect, useRef, type MouseEvent, type ReactNode } from "react";
import { X } from "lucide-react";

interface CatalogFiltersDrawerProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function CatalogFiltersDrawer({
  open,
  onClose,
  children,
}: CatalogFiltersDrawerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  function handleBackdropClick(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={handleBackdropClick}
      aria-label="Filtros do catálogo"
      className="fixed inset-y-0 left-0 m-0 h-dvh max-h-none w-[320px] max-w-[88vw] flex-col bg-background p-0 text-foreground backdrop:bg-black/70 open:flex"
    >
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2 className="m-0 text-base font-bold text-foreground">Filtros</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar filtros"
          className="grid size-8 place-items-center rounded-[4px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-highlight"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">{children}</div>
    </dialog>
  );
}
