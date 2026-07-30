import React from "react";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Sparkline } from "./Sparkline";
import type { MarketQuote } from "@/lib/market/types";
import { formatPrice, formatChange, formatPercent, getStaleLevel } from "@/lib/market/utils";

interface MarketCardProps {
  quote: MarketQuote;
  aiInsight?: string;
}

export function MarketCard({ quote, aiInsight }: MarketCardProps) {
  const stale = getStaleLevel(quote.updatedAt);
  const isPositive = quote.direction === "up";
  const isNegative = quote.direction === "down";
  const isOpen = quote.marketState === "OPEN";

  return (
    <Card className="flex flex-col h-full p-4 gap-3 card-lift">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="font-black uppercase text-sm tracking-tight">{quote.name}</div>
          <div className="text-[11px] font-bold uppercase opacity-60">{quote.symbol}</div>
        </div>
        <Badge variant={isOpen ? "bullish" : "neutral"}>{isOpen ? "Open" : "Closed"}</Badge>
      </div>

      {/* Price + Change */}
      <div>
        <div className="text-2xl font-black tabular-nums leading-none mb-1">
          {formatPrice(quote.price)}
        </div>
        <div className={`text-sm font-bold ${isPositive ? "text-bull" : isNegative ? "text-bear" : "text-text-muted"}`}>
          {formatChange(quote.change)} ({formatPercent(quote.changePercent)})
        </div>
      </div>

      {/* Sparkline */}
      <Sparkline direction={quote.direction} />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2 text-[11px] font-bold">
        {quote.open != null && (
          <div className="flex justify-between">
            <span className="opacity-60">Open</span>
            <span className="tabular-nums">{formatPrice(quote.open)}</span>
          </div>
        )}
        {quote.previousClose != null && (
          <div className="flex justify-between">
            <span className="opacity-60">Prev</span>
            <span className="tabular-nums">{formatPrice(quote.previousClose)}</span>
          </div>
        )}
        {quote.dayHigh != null && (
          <div className="flex justify-between">
            <span className="opacity-60">High</span>
            <span className="tabular-nums">{formatPrice(quote.dayHigh)}</span>
          </div>
        )}
        {quote.dayLow != null && (
          <div className="flex justify-between">
            <span className="opacity-60">Low</span>
            <span className="tabular-nums">{formatPrice(quote.dayLow)}</span>
          </div>
        )}
        {quote.currency && (
          <div className="flex justify-between col-span-2">
            <span className="opacity-60">Currency</span>
            <span>{quote.currency}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-2 border-t-[2px] border-ink/10">
        <span className="text-[10px] font-black uppercase opacity-50">
          Updated: {new Date(quote.updatedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
        </span>
        {stale !== "ok" && (
          <span className={`text-[10px] font-black uppercase ${stale === "stale" ? "text-bear" : "text-gold"}`}>
            {stale === "stale" ? "Stale" : "Delayed"}
          </span>
        )}
      </div>

      {/* AI Insight */}
      {aiInsight && (
        <div className="bg-accent-lavender/20 border-2 border-ink p-2.5">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="ai" className="text-[9px]">AI</Badge>
            <span className="text-[10px] font-black uppercase opacity-70">Insight</span>
          </div>
          <p className="text-[11px] font-bold leading-relaxed opacity-80">{aiInsight}</p>
        </div>
      )}
    </Card>
  );
}