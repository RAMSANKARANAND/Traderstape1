import React from "react";
import { Card } from "../ui/Card";
import { StatusBadge } from "./StatusBadge";
import type { MarketQuote } from "@/lib/market/types";
import { formatPrice, formatChange, formatPercent, getStaleLevel } from "@/lib/market/utils";

interface MarketCardProps {
  quote: MarketQuote;
}

export function MarketCard({ quote }: MarketCardProps) {
  const stale = getStaleLevel(quote.updatedAt);

  return (
    <Card className="flex flex-col justify-between h-full p-4 gap-4">
      <div className="flex justify-between items-start">
        <span className="font-black uppercase text-sm tracking-tight">{quote.name}</span>
        <StatusBadge status={quote.direction === "up" ? "bullish" : quote.direction === "down" ? "bearish" : "neutral"} />
      </div>
      <div>
        <div className="text-2xl font-black tabular-nums">{formatPrice(quote.price)}</div>
        <div className={`text-sm font-bold ${quote.direction === "up" ? "text-accent-bullish" : quote.direction === "down" ? "text-accent-bearish" : "text-accent-neutral"}`}>
          {formatChange(quote.change)} ({formatPercent(quote.changePercent)})
        </div>
        {stale !== "ok" && (
          <div className={`text-xs font-black uppercase mt-1 ${stale === "stale" ? "text-red-600" : "text-yellow-600"}`}>
            {stale === "stale" ? "🔴 Stale" : "🟡 Delayed"}
          </div>
        )}
      </div>
    </Card>
  );
}
