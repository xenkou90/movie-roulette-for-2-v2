import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    children: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
    primary: "bg-brand-pink text-surface",
    secondary: "bg-surface text-ink",
    ghost: "bg-transparent text-ink border-transparent shadow-none",
};

const baseStyles =
    "inline-flex items-center justify-center " +
    "min-h-11 px-6 py-3 " +
    "font-heading text-lg uppercase tracking-wide " +
    "border-3 border-ink rounded-xl shadow-brutal " +
    "transition-transform duration-75 " +
    "active:translate-x-[3px] active:translate-y-[3px] active:shadow-none " +
    "disabled:opacity-50 disabled:pointer-events-none " +
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";

function Button({
    variant = "primary",
    children,
    className= "",
    type = "button",
    ...rest
}: ButtonProps) {
    return (
        <button
            type={type}
            className={`${baseStyles} ${variantStyles[variant]} ${className}`}
            {...rest}
        >
            {children}
        </button>
    );
}

export default Button;