import type { ReactNode } from "react";

interface CardProps {
    children: ReactNode;
    className?: string;
}

function Card({ children, className = "" }: CardProps) {
    return (
        <div
            className={`w-full max-w-sm bg-surface border-3 border-ink rounded-2xl shadow-brutal-lg p-6 ${className}`}
        >
            {children}
        </div>
    );
}

export default Card;