import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ className = "", type = "button", ...props }: ButtonProps) {
  return (
    <button
      className={[
        "inline-flex h-10 items-center justify-center rounded-md bg-(--accent) px-4",
        "text-sm font-medium text-(--accent-foreground)",
        "transition hover:brightness-95 focus-visible:outline focus-visible:outline-2",
        "focus-visible:outline-offset-2 focus-visible:outline-(--accent)",
        className,
      ].join(" ")}
      type={type}
      {...props}
    />
  );
}
