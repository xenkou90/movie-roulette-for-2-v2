export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

const variantStyles: Record<ButtonVariant, string> = {
    primary: "bg-brand-pink text-surface",
    secondary: "bg-surface text-ink",
    ghost: "bg-transparent text-ink border-transparent shadow-none",
};

const sizeStyles: Record<ButtonSize, string> = {
    sm: "min-h-11 px-3 py-2 text-sm",
    md: "min-h-11 px-6 py-3 text-lg",
    lg: "min-h-14 px-6 py-4 text-xl",
};

const baseStyles =
    "inline-flex items-center justify-center " +
    "font-heading uppercase tracking-wide " +
    "border-3 border-ink rounded-xl shadow-brutal " +
    "transition-transform duration-75 " +
    "active:translate-x-[3px] active:translate-y-[3px] active:shadow-none " +
    "disabled:opacity-50 disabled:pointer-events-none " +
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";

export function buttonClasses(variant: ButtonVariant, size: ButtonSize): string {
    return `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]}`;
}