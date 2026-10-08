import type { ButtonHTMLAttributes, ReactNode } from "react";
import { buttonClasses, type ButtonSize, type ButtonVariant } from "./buttonStyles";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    children: ReactNode;
}

function Button({
    variant = "primary",
    size = "md",
    children,
    className = "",
    type = "button",
    ...rest
}: ButtonProps) {
    return (
        <button
            type={type}
            className={`${buttonClasses(variant, size)} ${className}`}
            {...rest}
        >
            {children}
        </button>
    );
}

export default Button;