import { useId, type ReactNode } from "react";
import Button from "./Button";
import Dialog from "./Dialog";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  children: ReactNode;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const bodyId = useId();

  return (
    <Dialog
      open={open}
      title={title}
      onClose={onCancel}
      describedBy={bodyId}
      className="text-center"
    >
      <div id={bodyId} className="mt-3 text-sm">
        {children}
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <Button className="w-full" onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button variant="secondary" className="w-full" onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Dialog>
  );
}

export default ConfirmDialog;
