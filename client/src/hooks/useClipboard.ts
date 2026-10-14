import { useCallback, useEffect, useState } from "react";

const FEEDBACK_MS = 2000;

interface CopyResult<Key extends string> {
    key: Key;
    ok: boolean;
}

async function writeToClipboard(text: string): Promise<boolean> {
    if (!("clipboard" in navigator)) {
        return false;
    }

    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        return false;
    }
}

export function useClipboard<Key extends string>() {
    const [result, setResult] = useState<CopyResult<Key> | null>(null);

    useEffect(() => {
        if (result === null) return;

        const timeout = setTimeout(() => setResult(null), FEEDBACK_MS);
        return () => clearTimeout(timeout);
    }, [result]);

    const copy = useCallback(async (text: string, key: Key): Promise<boolean> => {
        const ok = await writeToClipboard(text);
        setResult({ key, ok });
        return ok;
    }, []);

    return { result, copy };
}