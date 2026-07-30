import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  href?: string;
}

export function Button({ variant = "primary", size = "md", href, className = "", children, ...props }: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 font-bold uppercase tracking-wide transition-all duration-150 btn-press";

  const variants = {
    primary: "bg-accent-mint text-ink border-[3px] border-ink shadow-[4px_4px_0_#1F1F1F] hover:shadow-[5px_5px_0_#1F1F1F] hover:translate-x-[-1px] hover:translate-y-[-1px] active:shadow-[2px_2px_0_#1F1F1F] active:translate-x-[2px] active:translate-y-[2px]",
    secondary:
      "bg-white text-ink border-[3px] border-ink shadow-[4px_4px_0_#1F1F1F] hover:shadow-[5px_5px_0_#1F1F1F] hover:translate-x-[-1px] hover:translate-y-[-1px] active:shadow-[2px_2px_0_#1F1F1F] active:translate-x-[2px] active:translate-y-[2px]",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`;

  if (href) {
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}