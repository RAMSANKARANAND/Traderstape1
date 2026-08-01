"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { MarketQuote } from "@/lib/market/types";

interface TickerItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  direction: "up" | "down" | "flat";
  currency?: string;
  provider: string;
  updatedAt: string;
}

interface LiveMarketTickerProps {
  items: TickerItem[];
  title?: string;
}

const FRIENDLY_NAMES: Record<string, string> = {
  "NIFTY": "NIFTY 50",
  "NSEI": "NIFTY 50",
  "^NSEI": "NIFTY 50",
  "BANKNIFTY": "BANK NIFTY",
  "NSEBANK": "BANK NIFTY",
  "BSESN": "SENSEX",
  "SENSEX": "SENSEX",
  "INDIAVIX": "INDIA VIX",
  "USDINR": "USD/INR",
  "USD/INR": "USD/INR",
  "EURUSD": "EUR/USD",
  "EUR/USD": "EUR/USD",
  "GBPUSD": "GBP/USD",
  "GBP/USD": "GBP/USD",
  "BTC": "BTC",
  "BTC-USD": "BTC",
  "ETH": "ETH",
  "ETH-USD": "ETH",
  "SOL": "SOL",
  "SOL-USD": "SOL",
  "XRP": "XRP",
  "XRP-USD": "XRP",
  "GOLD": "GOLD",
  "GC=F": "GOLD",
  "SILVER": "SILVER",
  "SI=F": "SILVER",
};

function getFriendlyName(symbol: string): string {
  const upper = symbol.toUpperCase();
  return FRIENDLY_NAMES[upper] || FRIENDLY_NAMES[upper.replace(/[^A-Z]/g, "")] || symbol;
}

function formatPrice(price: number): string {
  return price.toFixed(2);
}

function formatChange(change: number): string {
  return change >= 0 ? `+${change.toFixed(2)}` : change.toFixed(2);
}

function formatPercent(percent: number): string {
  return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
}

export function LiveMarketTicker({ items, title = "Live Market" }: LiveMarketTickerProps) {
  const [displayItems, setDisplayItems] = useState<TickerItem[]>(items);
  const [isPaused, setIsPaused] = useState(false);
  const animationRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [lastUpdated, setLastUpdated] = useState(Date.now());

  // Infinite scroll setup
  useEffect(() => {
    const duplicateItems = [...items, ...items];
    setDisplayItems(duplicateItems);
  }, [items]);

  // Animation frame for smooth scrolling
  useEffect(() => {
    const scroll = () => {
      if (!containerRef.current || isPaused) return;

      const container = containerRef.current;
      const scrollAmount = 0.5; // pixels per frame

      if (container.scrollLeft >= container.scrollWidth / 2) {
        container.scrollLeft = 0;
      } else {
        container.scrollLeft += scrollAmount;
      }

      animationRef.current = requestAnimationFrame(scroll);
    };

    animationRef.current = requestAnimationFrame(scroll);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPaused, items]);

  const getMarketPath = (symbol: string): string => {
    const upperSymbol = symbol.toUpperCase();
    if (upperSymbol === "NIFTY" || upperSymbol === "NSEI" || upperSymbol === "^NSEI") {
      return "/the-tape?market=india";
    } else if (upperSymbol === "BANKNIFTY" || upperSymbol === "NSEBANK") {
      return "/the-tape?market=india";
    } else if (upperSymbol === "BSESN" || upperSymbol === "SENSEX") {
      return "/the-tape?market=india";
    } else if (upperSymbol === "INDIAVIX") {
      return "/the-tape?market=indices";
    } else if (upperSymbol.includes("USDINR") || upperSymbol === "USD/INR") {
      return "/the-tape?market=forex";
    } else if (upperSymbol === "EURUSD" || upperSymbol === "EUR/USD") {
      return "/the-tape?market=forex";
    } else if (upperSymbol === "GBPUSD" || upperSymbol === "GBP/USD") {
      return "/the-tape?market=forex";
    } else if (upperSymbol === "BTC" || upperSymbol === "BTC-USD") {
      return "/the-tape?market=crypto";
    } else if (upperSymbol === "ETH" || upperSymbol === "ETH-USD") {
      return "/the-tape?market=crypto";
    } else if (upperSymbol === "SOL" || upperSymbol === "SOL-USD") {
      return "/the-tape?market=crypto";
    } else if (upperSymbol === "XRP" || upperSymbol === "XRP-USD") {
      return "/the-tape?market=crypto";
    } else if (upperSymbol === "GOLD" || upperSymbol === "GC=F") {
      return "/the-tape?market=metals";
    } else if (upperSymbol === "SILVER" || upperSymbol === "SI=F") {
      return "/the-tape?market=metals";
    } else {
      return "/the-tape";
    }
  };

  return (
    <div className="brutal-card brutal-shadow bg-bg border-ink w-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b-[2px] border-ink bg-ink/5">
        <div className="flex items-center gap-3">
          <span className="text-live font-black text-sm">LIVE ●</span>
          <h3 className="text-body font-black uppercase tracking-wide text-ink">
            {title}
          </h3>
        </div>
        <span className="text-[11px] font-black uppercase opacity-60">
          Updated {Math.floor((Date.now() - lastUpdated) / 1000)}s ago
        </span>
      </div>

      {/* Ticker Container */}
      <div
        ref={containerRef}
        className="flex gap-6 p-4 overflow-x-hidden scroll-smooth whitespace-nowrap"
        style={{ scrollBehavior: 'auto' }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {displayItems.map((item, index) => {
          const isPositive = item.direction === "up";
          const isNegative = item.direction === "down";
          const friendlyName = getFriendlyName(item.symbol);

          return (
            <Link
              key={`${item.symbol}-${index}`}
              href={getMarketPath(item.symbol)}
              className="flex-shrink-0 inline-block brutal-border bg-bg hover:bg-ink/5 transition-all duration-150 cursor-pointer group"
              onClick={(e) => {
                e.preventDefault();
                window.open(getMarketPath(item.symbol), '_self');
              }}
            >
              <div className="flex flex-col items-start gap-2 px-5 py-3 min-w-[160px]">
                {/* Symbol and Friendly Name */}
                <div className="flex-shrink-0">
                  <div className="font-black uppercase text-base tracking-tight text-ink group-hover:text-accent-coral transition-colors">
                    {item.symbol}
                  </div>
                  <div className="text-[11px] font-bold uppercase opacity-60">
                    {friendlyName}
                  </div>
                </div>

                {/* Price and Change */}
                <div className="flex-shrink-0 text-right">
                  <div className={`text-lg font-black tabular-nums leading-none mb-1 ${isPositive ? "text-bullish" : isNegative ? "text-bearish" : "text-ink"}`}>
                    {formatPrice(item.price)}
                  </div>
                  <div className={`text-sm font-bold ${isPositive ? "text-bullish" : isNegative ? "text-bearish" : "text-text-muted"}`}>
                    {formatChange(item.change)} ({formatPercent(item.changePercent)})
                  </div>
                </div>

                {/* Direction Indicator */}
                <div className="flex-shrink-0">
                  {isPositive && (
                    <div className="w-7 h-7 bg-bullish/20 border-2 border-bullish rounded flex items-center justify-center">
                      <span className="text-bullish font-black text-sm">↑</span>
                    </div>
                  )}
                  {isNegative && (
                    <div className="w-7 h-7 bg-bearish/20 border-2 border-bearish rounded flex items-center justify-center">
                      <span className="text-bearish font-black text-sm">↓</span>
                    </div>
                  )}
                  {item.direction === "flat" && (
                    <div className="w-7 h-7 bg-text-muted/20 border-2 border-text-muted rounded flex items-center justify-center">
                      <span className="text-text-muted font-black text-sm">→</span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Resume Animation on Interaction */}
      <div
        className="h-0 overflow-hidden transition-all duration-300"
        style={{ marginTop: isPaused ? '4px' : '0' }}
      >
        <div className="text-[9px] font-black uppercase opacity-40 text-center">
          Hover to pause • Touch to pause
        </div>
      </div>
    </div>
  );
}
