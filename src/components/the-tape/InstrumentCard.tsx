import React from "react";
import { Card } from "../ui/Card";
import { StatusBadge } from "./StatusBadge";

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
}: InstrumentCardProps) {
  return (
    <Card className="p-0 overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b-4 border-ink bg-bg-surface flex justify-between items-center">
        <h3 className="font-black uppercase tracking-tighter text-lg">{name}</h3>
        <StatusBadge status={trend} />
      </div>
      
      <div className="p-4 grid grid-cols-2 gap-4">
        <div className="col-span-2 flex justify-between items-end pb-4 border-b-2 border-ink/10">
          <span className="text-xs font-bold uppercase text-text-secondary">Current Price</span>
          <span className="text-3xl font-black tabular-nums">{price}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-text-secondary font-medium">High</span>
          <span className="font-bold tabular-nums">{high}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-text-secondary font-medium">Low</span>
          <span className="font-bold tabular-nums">{low}</span>
        </div>
        <div className="col-span-2 flex justify-between text-sm py-2 bg-accent-yellow/30 px-2">
          <span className="font-black uppercase text-xs">Pivot Point</span>
          <span className="font-black tabular-nums">{pivot}</span>
        </div>
      </div>

      <div className="px-4 py-3 grid grid-cols-2 gap-4 border-t-4 border-ink">
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase text-text-secondary block">Resistance</span>
          <div className="flex justify-between text-xs font-bold tabular-nums">
            <span>R1: {resistance.r1}</span>
            <span>R2: {resistance.r2}</span>
            <span>R3: {resistance.r3}</span>
          </div>
        </div>
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase text-text-secondary block">Support</span>
          <div className="flex justify-between text-xs font-bold tabular-nums">
            <span>S1: {support.s1}</span>
            <span>S2: {support.s2}</span>
            <span>S3: {support.s3}</span>
          </div>
        </div>
      </div>

      <div className="p-4 bg-accent-sky/30 mt-auto">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-black uppercase bg-ink text-white px-1">AI Insight</span>
        </div>
        <p className="text-xs font-medium italic text-text-secondary leading-relaxed">
          "{aiInsight}"
        </p>
      </div>
    </Card>
  );
}