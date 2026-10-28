import {
  useEffect,
  useId,
  useRef,
  type MouseEvent,
  type ReactNode,
  type SyntheticEvent,
} from "react";
import Button from "./Button";

interface DialogProps {
  open: boolean;
  title: string;
  onClose: () => void;
  showCloseButton?: boolean;
  describedBy?: string;
  className?: string;
  children: ReactNode;
}

function Dialog({
  open,
  title,
  onClose,
  showCloseButton = false,
  describedBy,
  className = "",
  children,
}: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog === null) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  function handleCancel(event: SyntheticEvent<HTMLDialogElement>) {
    event.preventDefault();
    onClose();
  }

  function handleBackdropClick(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={describedBy}
      onCancel={handleCancel}
      onClick={handleBackdropClick}
      className="m-auto w-[calc(100%-2rem)] max-w-sm border-0 bg-transparent p-0 backdrop:bg-ink/40 backdrop:backdrop-blur-sm"
    >
      <div
        className={`max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-2xl border-3 border-ink bg-surface p-6 shadow-brutal-lg ${className}`}
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id={titleId} className="flex-1 font-heading text-2xl uppercase">
            {title}
          </h2>
          {showCloseButton && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
          )}
        </div>

        {children}
      </div>
    </dialog>
  );
}

export default Dialog;
