import type { ReactNode } from "react";

interface ScreenProps {
    children: ReactNode;
    className?: string;
}

function Screen({ children, className = ""}: ScreenProps) {
    return (
        <main
            className={`
                flex min-h-dvh flex-col items-center justify-center gap-6
                px-4 py-8
                pb-[calc(2rem+env(safe-area-inset-bottom))]
                ${className}
            `}
        >
            {children}
        </main>
    );
}

export default Screen;