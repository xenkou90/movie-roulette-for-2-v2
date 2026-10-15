import type { ButtonHTMLAttributes, ReactNode } from "react";
import { buttonClasses, type ButtonSize, type ButtonVariant } from "./buttonStyles";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    pending?: boolean;
    children: ReactNode;
}

function Button({
    variant = "primary",
    size = "md",
    pending = false,
    children,
    className = "",
    type = "button",
    onClick,
    ...rest
}: ButtonProps) {
    return (
        <button
            type={type}
            aria-disabled={pending ? true : undefined}
            onClick={pending ? (event) => event.preventDefault() : onClick}
            className={`${buttonClasses(variant, size)} ${className}`}
            {...rest}
        >
            {children}
        </button>
    );
}

export default Button;