"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { MarketQuote } from "@/lib/market/types";

export function LiveMarketTicker({ items, initialLastUpdated }: { items: MarketQuote[]; initialLastUpdated?: number }) {
  const [displayItems, setDisplayItems] = useState<MarketQuote[]>(items);
  const [isPaused, setIsPaused] = useState(false);
  const animationRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [lastUpdated, setLastUpdated] = useState(() => initialLastUpdated ?? Date.now());

  // Infinite scroll setup - duplicate items for seamless loop
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

  // Add global styles to hide scrollbar
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .hide-scrollbar::-webkit-scrollbar {
        display: none;
      }
      .hide-scrollbar {
        scrollbar-width: none;
        -ms-overflow-style: none;
      }
    `;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const getFriendlyName = (symbol: string): string => {
    const upper = symbol.toUpperCase();
    // Simple mapping for common symbols
    const friendlyNames: Record<string, string> = {
      "NIFTY": "NIFTY 50",
      "NSEI": "NIFTY 50",
      "^NSEI": "NIFTY 50",
      "BANKNIFTY": "BANK NIFTY",
      "NSEBANK": "BANK NIFTY",
      "BSESN": "SENSEX",
      "SENSEX": "SENSEX",
      "INDIAVIX": "INDIA VIX",
      "USDINR": "USD/INR",
      "EURUSD": "EUR/USD",
      "GBPUSD": "GBP/USD",
      "BTC": "BTC",
      "ETH": "ETH",
      "SOL": "SOL",
      "XRP": "XRP",
      "GOLD": "GOLD",
      "SILVER": "SILVER",
    };
    return friendlyNames[upper] || symbol;
  };

  const formatPrice = (price: number): string => {
    return price.toFixed(2);
  };

  const getMarketPath = (symbol: string): string => {
    // Simplified routing based on symbol type
    if (symbol.includes("NSE") || symbol.includes("NIFTY") || symbol.includes("SENSEX") || symbol === "^NSEI") {
      return "/the-tape?market=indices";
    } else if (symbol.includes("USD") || symbol.includes("EUR") || symbol.includes("GBP")) {
      return "/the-tape?market=forex";
    } else if (symbol.includes("BTC") || symbol.includes("ETH") || symbol.includes("SOL") || symbol.includes("XRP")) {
      return "/the-tape?market=crypto";
    } else if (symbol.includes("GOLD") || symbol.includes("SILVER")) {
      return "/the-tape?market=metals";
    } else {
      return "/the-tape";
    }
  };

  return (
    <div className="ng-card">
      {/* Header with LIVE indicator and timestamp */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-ink bg-ink/5">
        <div className="flex items-center gap-2">
          <span className="ng-pill-navy">LIVE</span>
          <h3 className="text-small font-black uppercase text-ink">Market</h3>
        </div>
        <span className="text-[10px] font-black uppercase text-ink/60">
          Updated {Math.floor((Date.now() - lastUpdated) / 1000)}s ago
        </span>
      </div>

      {/* Ticker Container */}
      <div
        ref={containerRef}
        className="flex gap-4 px-4 py-4 overflow-x-auto scroll-smooth whitespace-nowrap cursor-default hide-scrollbar"
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
            <div
              key={`${item.symbol}-${index}`}
              className="flex items-center gap-3 px-3 py-1 border-r-[1.5px] border-ink last:border-r-0"
            >
              {/* Symbol */}
              <span className="text-small font-bold uppercase tabular-nums" style={{ color: 'var(--ng-navy-text)' }}>
                {item.symbol.replace(/^\^/, "").replace(".NS", "")}
              </span>

              {/* Price */}
              <span className="text-small font-bold tabular-nums" style={{ color: 'var(--ng-navy-text)' }}>
                {formatPrice(item.price)}
              </span>

              {/* Change Percentage with color */}
              <span className={`text-small font-bold tabular-nums ${isPositive ? "ng-pill-positive" : isNegative ? "ng-pill-negative" : "text-ink/60"}`}>
                {isPositive ? "+" : ""}{item.changePercent?.toFixed(2)}%
              </span>

              {/* Directional arrow */}
              <span className="text-[10px] font-black">
                {isPositive ? "↑" : isNegative ? "↓" : "→"}
              </span>

              {/* Separator dot */}
              <span className="text-ink/20">·</span>
            </div>
          );
        })}
      </div>

      {/* Resume Animation Indicator */}
      <div
        className="h-0 overflow-hidden transition-all duration-300"
        style={{ marginTop: isPaused ? '4px' : '0' }}
      >
        <div className="text-[9px] font-black uppercase text-ink/40 text-center">
          Hover to pause • Touch to pause
        </div>
      </div>
    </div>
  );
}