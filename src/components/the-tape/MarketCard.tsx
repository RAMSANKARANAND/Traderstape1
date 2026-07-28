import React from "react";
import { Card } from "../ui/Card";
import { StatusBadge } from "./StatusBadge";

interface MarketCardProps {
  name: string;
  price: string;
  change: string;
  status: "bullish" | "bearish" | "neutral";
}

export function MarketCard({ name, price, change, status }: MarketCardProps) {
  return (
    <Card className="flex flex-col justify-between h-full p-4 gap-4">
      <div className="flex justify-between items-start">
        <span className="font-black uppercase text-sm tracking-tight">{name}</span>
        <StatusBadge status={status} />
      </div>
      <div>
        <div className="text-2xl font-black tabular-nums">{price}</div>
        <div className={`text-sm font-bold ${status === 'bullish' ? 'text-accent-bullish' : status === 'bearish' ? 'text-accent-bearish' : 'text-accent-neutral'}`}>
          {change}
        </div>
      </div>
    </Card>
  );
}