import  {
    useEffect,
    useId,
    useRef,
    type MouseEvent,
    type ReactNode,
    type SyntheticEvent,
} from "react";
import Button from "./Button";

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
    const dialogRef = useRef<HTMLDialogElement>(null);
    const titleId = useId();
    const bodyId = useId();

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
        onCancel();
    }

    function handleBackdropClick(event: MouseEvent<HTMLDialogElement>) {
        if (event.target === event.currentTarget) {
            onCancel();
        }
    }

    return (
        <dialog
            ref={dialogRef}
            aria-labelledby={titleId}
            aria-describedby={bodyId}
            onCancel={handleCancel}
            onClick={handleBackdropClick}
            className="m-auto w-[calc(100%-2rem)] max-w-sm border-0 bg-transparent p-0 backdrop:bg-ink/40 backdrop:backdrop-blur-sm"
        >
            <div className="rounded-2xl border-3 border-ink bg-surface p-6 text-center shadow-brutal-lg">
                <h2 id={titleId} className="font-heading text-2xl uppercase">
                    {title}
                </h2>

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
            </div>
        </dialog>
    );
}

export default ConfirmDialog;