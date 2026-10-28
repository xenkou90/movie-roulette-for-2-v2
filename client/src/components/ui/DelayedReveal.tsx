import { useEffect, useState, type ReactNode } from "react";

interface DelayedRevealProps {
  delayMs: number;
  fallback?: ReactNode;
  children: ReactNode;
}

function DelayedReveal({
  delayMs,
  fallback = null,
  children,
}: DelayedRevealProps) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setRevealed(true), delayMs);
    return () => clearTimeout(timeout);
  }, [delayMs]);

  return <>{revealed ? children : fallback}</>;
}

export default DelayedReveal;
