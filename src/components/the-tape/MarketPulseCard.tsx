import React from "react";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import type { MarketPulse } from "@/lib/market/pulse";

interface MarketPulseCardProps {
  pulse: MarketPulse;
}

export function MarketPulseCard({ pulse }: MarketPulseCardProps) {
  const sentimentColor = {
    bullish: "bg-accent-bullish text-white",
    neutral: "bg-accent-neutral text-white",
    bearish: "bg-accent-bearish text-white",
  }[pulse.sentiment];

  const sentimentLabel = pulse.sentiment.charAt(0).toUpperCase() + pulse.sentiment.slice(1);

  return (
    <Card className="p-6 card-lift">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="text-lg font-black uppercase tracking-tight">Market Pulse</h2>
          <p className="text-xs font-black uppercase text-text-secondary">Rule-based market intelligence</p>
        </div>
        <Badge variant="default" className={sentimentColor}>
          {sentimentLabel}
        </Badge>
      </div>

      <p className="text-sm font-bold leading-relaxed mb-6">
        {pulse.focus}
      </p>

      <div className="grid grid-cols-3 gap-4 text-xs font-black uppercase tracking-widest">
        <div>
          <span className="block text-text-secondary mb-1">NSE</span>
          <span className={pulse.status.nse === "Open" ? "text-accent-bullish" : "text-accent-neutral"}>
            {pulse.status.nse}
          </span>
        </div>
        <div>
          <span className="block text-text-secondary mb-1">Forex</span>
          <span className="text-accent-bullish">{pulse.status.forex}</span>
        </div>
        <div>
          <span className="block text-text-secondary mb-1">Crypto</span>
          <span className="text-accent-bullish">{pulse.status.crypto}</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t-4 border-ink">
        <div className="grid grid-cols-2 gap-4 text-xs font-black uppercase tracking-widest">
          <div>
            <span className="block text-text-secondary mb-1">Indices</span>
            <span>{pulse.details.indicesPositive}/{pulse.details.indicesTotal} positive</span>
          </div>
          <div>
            <span className="block text-text-secondary mb-1">Crypto</span>
            <span>{pulse.details.cryptoPositive}/{pulse.details.cryptoTotal} positive</span>
          </div>
        </div>
      </div>
    </Card>
  );
}