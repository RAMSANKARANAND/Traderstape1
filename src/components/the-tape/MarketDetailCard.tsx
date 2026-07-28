import React from "react";
import { Card } from "../ui/Card";
import { StatusBadge } from "./StatusBadge";
import type { MarketQuote } from "@/lib/market/types";
import { formatPrice, formatChange, formatPercent, formatVolume, getStaleLevel } from "@/lib/market/utils";

interface MarketDetailCardProps {
  quote: MarketQuote;
}

export function MarketDetailCard({ quote }: MarketDetailCardProps) {
  const stale = getStaleLevel(quote.updatedAt);

  return (
    <Card className="flex flex-col justify-between h-full p-4 gap-4 card-lift">
      <div className="flex justify-between items-start gap-2">
        <span className="font-black uppercase text-sm tracking-tight leading-tight">{quote.name}</span>
        <div className="flex flex-col items-end gap-1">
          <StatusBadge status={quote.direction === "up" ? "bullish" : quote.direction === "down" ? "bearish" : "neutral"} />
          {quote.marketState && (
            <span className={`text-[10px] font-black uppercase ${quote.marketState === "OPEN" ? "text-accent-bullish" : "text-accent-neutral"}`}>
              ● {quote.marketState}
            </span>
          )}
        </div>
      </div>

      <div>
        <div className="text-3xl font-black tabular-nums">{formatPrice(quote.price)}</div>
        <div className={`text-sm font-bold ${quote.direction === "up" ? "text-accent-bullish" : quote.direction === "down" ? "text-accent-bearish" : "text-accent-neutral"}`}>
          {formatChange(quote.change)} ({formatPercent(quote.changePercent)})
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
        {quote.open !== undefined && (
          <Row label="Open" value={formatPrice(quote.open)} />
        )}
        {quote.previousClose !== undefined && (
          <Row label="Prev Close" value={formatPrice(quote.previousClose)} />
        )}
        {quote.dayHigh !== undefined && (
          <Row label="High" value={formatPrice(quote.dayHigh)} />
        )}
        {quote.dayLow !== undefined && (
          <Row label="Low" value={formatPrice(quote.dayLow)} />
        )}
        {quote.volume !== undefined && (
          <Row label="Volume" value={formatVolume(quote.volume)} />
        )}
        {quote.currency && (
          <Row label="Currency" value={quote.currency} />
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-black uppercase tracking-widest text-text-secondary">
        <span>{new Date(quote.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
        <BadgeProvider provider={quote.provider} />
      </div>

      {stale !== "ok" && (
        <div className={`text-[10px] font-black uppercase ${stale === "stale" ? "text-red-600" : "text-yellow-600"}`}>
          {stale === "stale" ? "🔴 Stale" : "🟡 Delayed"}
        </div>
      )}
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-text-secondary">{label}</span>
      <span className="font-bold tabular-nums">{value}</span>
    </div>
  );
}

function BadgeProvider({ provider }: { provider: string }) {
  let variant: "default" | "up" | "down" | "flat" = "default";
  if (provider.includes("Yahoo")) variant = "default";
  else if (provider.includes("CoinGecko")) variant = "up";
  else if (provider.includes("Frankfurter")) variant = "down";
  return (
    <span className="inline-block bg-ink text-white px-1.5 py-0.5">{provider}</span>
  );
}
