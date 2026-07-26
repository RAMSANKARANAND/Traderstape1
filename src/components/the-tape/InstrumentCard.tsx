import React from "react";
import { StatusBadge } from "./StatusBadge";

interface Level {
  label: string;
  value: string;
}

interface InstrumentCardProps {
  name: string;
  price: string;
  high: string;
  low: string;
  pivot: string;
  resistance: { r1: string; r2: string; r3: string };
  support: { s1: string; s2: string; s3: string };
  trend: "bullish" | "bearish" | "neutral";
  aiInsight: string;
  className?: string;
}

export function InstrumentCard({
  name,
  price,
  high,
  low,
  pivot,
  resistance,
  support,
  trend,
  aiInsight,
  className = "",
}: InstrumentCardProps) {
  return (
    <div
      className={`brutal-card p-5 card-lift cursor-default ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 brutal-border-b border-b-3 border-ink">
        <h3 className="font-black text-base uppercase tracking-wide">{name}</h3>
        <StatusBadge variant={trend} />
      </div>

      {/* Price */}
      <div className="mb-4">
        <p className="text-3xl font-black font-mono tracking-tight">{price}</p>
        <div className="flex gap-4 mt-1 text-xs font-bold font-mono">
          <span className="text-accent-teal">H: {high}</span>
          <span className="text-accent-coral">L: {low}</span>
        </div>
      </div>

      {/* Pivot */}
      <div className="mb-3 pb-3 brutal-border-b border-b-3 border-ink">
        <span className="text-[10px] font-black uppercase tracking-wider opacity-50">Pivot</span>
        <p className="font-black font-mono text-sm">{pivot}</p>
      </div>

      {/* Resistance & Support */}
      <div className="grid grid-cols-2 gap-3 mb-3 pb-3 brutal-border-b border-b-3 border-ink">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-accent-teal">Resistance</span>
          <div className="mt-1 space-y-0.5">
            <LevelRow label="R1" value={resistance.r1} />
            <LevelRow label="R2" value={resistance.r2} />
            <LevelRow label="R3" value={resistance.r3} />
          </div>
        </div>
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-accent-coral">Support</span>
          <div className="mt-1 space-y-0.5">
            <LevelRow label="S1" value={support.s1} />
            <LevelRow label="S2" value={support.s2} />
            <LevelRow label="S3" value={support.s3} />
          </div>
        </div>
      </div>

      {/* AI Insight */}
      <div className="bg-accent-blue/10 brutal-border p-3 border-accent-blue">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-accent-blue">AI Insight</span>
          <StatusBadge variant="ai" />
        </div>
        <p className="text-xs font-bold opacity-80 leading-relaxed">{aiInsight}</p>
      </div>
    </div>
  );
}

function LevelRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-black uppercase opacity-50">{label}</span>
      <span className="text-xs font-black font-mono">{value}</span>
    </div>
  );
}