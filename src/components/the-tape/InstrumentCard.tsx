import React from "react";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";

interface InstrumentCardProps {
  name: string;
  price: string;
  high: string;
  low: string;
  pivot: string;
  resistance: { r1: string; r2: string; r3: string };
  support: { s1: string; s2: string; s3: string };
  trend: "Bullish" | "Bearish" | "Neutral";
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
    <Card className="flex flex-col h-full group">
      <div className="flex justify-between items-start mb-6">
        <span className="font-black uppercase tracking-tighter text-xl">{name}</span>
        <Badge variant={trend === "Bullish" ? "up" : trend === "Bearish" ? "down" : "flat"}>
          {trend}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-ink/50">Price</span>
          <span className="text-2xl font-black tracking-tighter">{price}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-ink/50">Pivot</span>
          <span className="text-2xl font-black tracking-tighter">{pivot}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-ink/50">High</span>
          <span className="text-lg font-bold">{high}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-ink/50">Low</span>
          <span className="text-lg font-bold">{low}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6 p-3 bg-bg-featured brutal-border">
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-black block mb-1 text-accent-bullish">Resistance</span>
          <div className="text-xs font-bold flex justify-between"><span>R1:</span> <span>{resistance.r1}</span></div>
          <div className="text-xs font-bold flex justify-between"><span>R2:</span> <span>{resistance.r2}</span></div>
          <div className="text-xs font-bold flex justify-between"><span>R3:</span> <span>{resistance.r3}</span></div>
        </div>
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-black block mb-1 text-accent-bearish">Support</span>
          <div className="text-xs font-bold flex justify-between"><span>S1:</span> <span>{support.s1}</span></div>
          <div className="text-xs font-bold flex justify-between"><span>S2:</span> <span>{support.s2}</span></div>
          <div className="text-xs font-bold flex justify-between"><span>S3:</span> <span>{support.s3}</span></div>
        </div>
      </div>

      <div className="mt-auto">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] uppercase font-black text-ink">AI Insight</span>
          <span className="text-[8px] bg-ink text-white px-1 brutal-border">AI</span>
        </div>
        <p className="text-xs font-medium leading-relaxed text-ink/80 italic">
          "{aiInsight}"
        </p>
      </div>
    </Card>
  );
}