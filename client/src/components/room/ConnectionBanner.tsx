import { useSocket } from "../../hooks/useSocket";
import { useRoom } from "../../hooks/useRoom";
import DelayedReveal from "../ui/DelayedReveal";

const SHOW_AFTER_MS = 1000;

function ConnectionBanner() {
    const { isConnected } = useSocket();
    const { current } = useRoom();

    const connectionLost = !isConnected && current !== null;

    return (
        <div
            role="status"
            aria-live="polite"
            className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))]"
        >
            {connectionLost && (
                <DelayedReveal delayMs={SHOW_AFTER_MS}>
                    <p className="flex items-center gap-2 rounded-lg border-2 border-ink bg-surface px-3 py-1 text-xs shadow-brutal-sm motion-safe:animate-rise">
                        <span
                            aria-hidden="true"
                            className="h-2 w-2 shrink-0 rounded-full border border-ink bg-danger motion-safe:animate-pulse"
                        />
                        Connection lost. Reconnecting…
                    </p>
                </DelayedReveal>
            )}
        </div>
    );
}

export default ConnectionBanner;