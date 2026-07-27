import React from "react";

interface StatusBadgeProps {
  label: string;
  variant?: "live" | "delayed" | "closed";
}

const variantStyles = {
  live: "bg-accent-bullish text-white",
  delayed: "bg-accent-gold text-ink",
  closed: "bg-accent-neutral text-white",
};

export function StatusBadge({ label, variant = "live" }: StatusBadgeProps) {
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 brutal-border font-black uppercase text-[10px] tracking-widest ${variantStyles[variant]} animate-pulse`}>
      <span className="w-2 h-2 rounded-full bg-white animate-ping" />
      {label}
    </div>
  );
}