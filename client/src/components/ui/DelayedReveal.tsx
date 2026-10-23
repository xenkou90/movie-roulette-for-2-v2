import { useEffect, useState, type ReactNode } from "react";

interface DelayedRevealProps {
    delayMs: number;
    children: ReactNode;
}

function DelayedReveal({ delayMs, children }: DelayedRevealProps) {
    const [revealed, setRevealed] = useState(false);

    useEffect(() => {
        const timeout = setTimeout(() => setRevealed(true), delayMs);
        return () => clearTimeout(timeout);
    }, [delayMs]);

    return revealed ? <>{children}</> : null;
}

export default DelayedReveal;