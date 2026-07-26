import React from "react";
import { StatusBadge } from "./StatusBadge";

interface InsightCardProps {
  title: string;
  body: string;
  className?: string;
}

export function InsightCard({ title, body, className = "" }: InsightCardProps) {
  return (
    <div
      className={`brutal-card p-6 card-lift cursor-default bg-accent-blue/5 border-accent-blue ${className}`}
    >
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-xl font-black uppercase tracking-wide">{title}</h3>
        <StatusBadge variant="ai" />
      </div>
      <div className="flex items-start gap-4">
        <div className="w-8 h-8 brutal-border border-2 border-ink bg-accent-blue flex items-center justify-center shrink-0">
          <span className="text-bg font-black text-xs">AI</span>
        </div>
        <p className="text-sm font-bold leading-relaxed opacity-80">{body}</p>
      </div>
    </div>
  );
}