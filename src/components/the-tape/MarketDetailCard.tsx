import React from "react";
import { StatusBadge } from "./StatusBadge";
import type { MarketQuote } from "@/lib/market/types";
import { formatPrice, formatChange, formatPercent, formatVolume, getStaleLevel, formatTimestamp } from "@/lib/market/utils";

interface MarketDetailCardProps {
  quote: MarketQuote;
}

export function MarketDetailCard({ quote }: MarketDetailCardProps) {
  const stale = getStaleLevel(quote.updatedAt);
  const changeColor = quote.changePercent >= 0 ? "var(--ng-positive)" : "var(--ng-negative)";

  return (
    <div className="bg-white border border-[#cccccc] rounded-lg shadow-sm p-4 flex flex-col justify-between h-full gap-4">
      <div className="flex justify-between items-start gap-2">
        <span className="font-black uppercase text-sm tracking-tight leading-tight" style={{ color: 'var(--ng-navy-text)' }}>{quote.name}</span>
        <div className="flex flex-col items-end gap-1">
          <StatusBadge status={quote.direction === "up" ? "bullish" : quote.direction === "down" ? "bearish" : "neutral"} />
          {quote.marketState && (
<span className={`${quote.marketState === "LIVE" ? "bg-[var(--color-accent-500)] text-[var(--color-bg)] px-2 py-1 rounded text-xs font-bold uppercase" : "ng-pill-navy"}`}>
              ● {quote.marketState}
            </span>
          )}
        </div>
      </div>

      <div>
        <div className="text-3xl font-black tabular-nums" style={{ color: 'var(--ng-navy-text)' }}>{quote.symbol === 'INRUSD' ? formatPrice(quote.price, 4) : formatPrice(quote.price)}</div>
        <div className="text-sm font-bold" style={{ color: 'var(--ng-navy-text)' }}>
          {quote.symbol === 'INRUSD' ? formatChange(quote.change, 4) : formatChange(quote.change)} ({formatPercent(quote.changePercent)})
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
        <span>{formatTimestamp(quote.updatedAt)}</span>
        <BadgeProvider provider={quote.provider} />
      </div>

      {stale !== "ok" && (
        <div className={`text-[10px] font-black uppercase ${stale === "stale" ? "text-red-600" : "text-yellow-600"}`}>
          {stale === "stale" ? "🔴 Stale" : "🟡 Delayed"}
        </div>
      )}
    </div>
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
  return (
    <span className="inline-block px-3 py-2 text-xs font-bold rounded-full bg-[var(--color-neutral-100)] text-[var(--color-neutral-700)]">
      {provider}
    </span>
  );
}
