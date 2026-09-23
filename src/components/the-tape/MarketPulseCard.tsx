import React from "react";
import { Badge } from "../ui/Badge";
import type { MarketPulse } from "@/lib/market/pulse";
import { formatPrice, formatChange, formatPercent, getStaleLevel } from "@/lib/market/utils";

interface MarketPulseCardProps {
  pulse: MarketPulse;
}

export function MarketPulseCard({ pulse }: MarketPulseCardProps) {
  const sentimentColor = {
    bullish: "bg-accent-bullish text-white",
    neutral: "bg-accent-neutral text-white",
    bearish: "bg-accent-bearish text-white",
  }[pulse.sentiment ?? "neutral"];

  const trimmed = pulse.sentiment?.trim();
  const sentimentLabel = trimmed 
    ? trimmed.charAt(0).toUpperCase() + trimmed.slice(1)
    : "Unknown";

  return (
    <div className="bg-white border border-[#cccccc] rounded-lg shadow-sm p-6">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="text-lg font-black uppercase tracking-tight text-accent-700">
            Market Pulse
          </h2>
          <p className="text-xs font-bold uppercase text-accent-800">
            Rule-based market intelligence
          </p>
        </div>
<Badge 
  variant={pulse.sentiment === "bearish" ? "down" : pulse.sentiment === "bullish" ? "up" : "flat"} 
  className={ 
    pulse.sentiment === "bearish" ? "ng-pill-negative" :
    pulse.sentiment === "bullish" ? "ng-pill-positive" :
    "ng-pill-neutral"
  }
>
  {sentimentLabel || "Unknown"}
</Badge>
      </div>

      <p className="text-sm font-bold leading-relaxed mb-6 text-text">
        {pulse.focus}
      </p>

      <div className="grid grid-cols-3 gap-4 text-xs font-black uppercase tracking-widest">
        <div>
          <span className="block text-accent-800 mb-1">NSE</span>
            <span className={pulse.status.nse === "Open" ? "text-accent-bullish" : "text-accent-neutral"}>
              {pulse.status.nse}
            </span>
        </div>
<div>
  <span className="block text-accent-800 mb-1">Forex</span>
  <span className={pulse.status.forex === "Open" ? "text-accent-bullish" : "text-accent-neutral"}>
    {pulse.status.forex}
  </span>
</div>
<div>
  <span className="block text-accent-800 mb-1">Crypto</span>
  <span className={pulse.status.crypto === "Open" ? "text-accent-bullish" : "text-accent-neutral"}>
    {pulse.status.crypto}
  </span>
</div>
      </div>

      <div className="mt-4 pt-4 border-t-4 border-ink">
        <div className="grid grid-cols-2 gap-4 text-xs font-black uppercase tracking-widest">
          <div>
            <span className="block text-accent-800 mb-1">Indices</span>
            <span className="text-text">{pulse.details.indicesPositive}/{pulse.details.indicesTotal} positive</span>
          </div>
          <div>
            <span className="block text-accent-800 mb-1">Crypto</span>
            <span className="text-text">{pulse.details.cryptoPositive}/{pulse.details.cryptoTotal} positive</span>
          </div>
        </div>
      </div>
    </div>
  );
}