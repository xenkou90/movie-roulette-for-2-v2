import { useId, type InputHTMLAttributes } from "react";

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "id"> {
  label: string;
  error?: string;
  hint?: string;
}

function Input({ label, error, hint, className = "", ...rest }: InputProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  const describedBy =
    [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ") ||
    undefined;

  return (
    <div className="flex w-full flex-col gap-1">
      <label
        htmlFor={id}
        className="font-body text-xs uppercase tracking-widest opacity-70"
      >
        {label}
      </label>

      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`
          min-h-11 w-full rounded-xl border-3 border-ink bg-white px-4 py-3
          font-body text-ink
          outline-none
          focus-visible:shadow-brutal-sm
          disabled:opacity-50
          ${error ? "border-danger" : ""}
          ${className}
        `}
        {...rest}
      />

      {hint && !error && (
        <p id={hintId} className="font-body text-xs opacity-60">
          {hint}
        </p>
      )}

      {error && (
        <p id={errorId} role="alert" className="font-body text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export default Input;