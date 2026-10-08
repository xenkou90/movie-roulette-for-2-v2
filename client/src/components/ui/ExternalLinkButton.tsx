import type { AnchorHTMLAttributes, ReactNode } from "react";
import { buttonClasses, type ButtonSize, type ButtonVariant } from "./buttonStyles";

interface ExternalLinkButtonProps
    extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "target" | "rel"> {
        href: string;
        variant?: ButtonVariant;
        size?: ButtonSize;
        children: ReactNode;
    }

function ExternalLinkButton({
    href,
    variant = "secondary",
    size = "md",
    children,
    className = "",
    ...rest
}: ExternalLinkButtonProps) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={`${buttonClasses(variant, size)} ${className}`}
            {...rest}
        >
            {children}
            <span aria-hidden="true">&nbsp;↗</span>
            <span className="sr-only"> (opens in a new tab)</span>
        </a>
    );
}

export default ExternalLinkButton;