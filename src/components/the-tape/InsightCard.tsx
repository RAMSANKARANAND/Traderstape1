import React from "react";
import { Card } from "../ui/Card";

interface InsightCardProps {
  title: string;
  content: string;
}

export function InsightCard({ title, content }: InsightCardProps) {
  return (
    <Card className="relative overflow-hidden bg-ink text-white brutal-border brutal-shadow">
      <div className="absolute top-0 right-0 p-4">
        <span className="text-[10px] font-black bg-accent-gold text-ink px-2 py-1 brutal-border uppercase tracking-widest">
          AI Powered
        </span>
      </div>
      <div className="relative z-10">
        <h3 className="text-2xl font-black uppercase tracking-tighter mb-4 flex items-center gap-2">
          {title}
          <span className="w-2 h-2 rounded-full bg-accent-bullish animate-pulse" />
        </h3>
        <p className="text-lg font-medium leading-relaxed text-white/80 italic">
          "{content}"
        </p>
      </div>
      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
    </Card>
  );
}