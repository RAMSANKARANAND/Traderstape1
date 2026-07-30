"use client";

import React, { useEffect, useMemo, useState } from "react";
import { SectionHeader } from "@/components/the-tape/SectionHeader";
import { MarketDetailCard } from "@/components/the-tape/MarketDetailCard";
import { MarketPulseCard } from "@/components/the-tape/MarketPulseCard";
import { FeedCard } from "@/components/the-tape/FeedCard";
import { InsightCard } from "@/components/the-tape/InsightCard";
import { Badge } from "@/components/ui/Badge";
import type { MarketQuote } from "@/lib/market/types";
import { computeMarketPulse } from "@/lib/market/pulse";
import type { MarketPulse } from "@/lib/market/pulse";

const INDIAN_INDICES = ["NIFTY 50", "BANK NIFTY", "SENSEX", "INDIA VIX"];
const FOREX = ["USD/INR", "EUR/USD", "GBP/USD", "XAU/USD", "XAG/USD"];
const CRYPTO = ["BTC", "ETH"];
const NSE_STOCKS = ["RELIANCE", "HDFC BANK", "TCS", "INFOSYS", "ICICI BANK", "SBI", "L&T", "AXIS BANK", "KOTAK BANK", "ITC"];

interface TheTapeClientProps {
  initialQuotes: MarketQuote[];
}

export function TheTapeClient({ initialQuotes }: TheTapeClientProps) {
  const [quotes, setQuotes] = useState<MarketQuote[]>(initialQuotes);
  const [countdown, setCountdown] = useState(30);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("Updating...");

  const pulse: MarketPulse = useMemo(() => computeMarketPulse(quotes), [quotes]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (!quotes.length) {
      setLastUpdated("No data yet");
      return;
    }

    const latest = quotes.reduce((a, b) => (a.updatedAt > b.updatedAt ? a : b)).updatedAt;
    const now = Date.now();
    const then = new Date(latest).getTime();
    const diffSec = Math.floor((now - then) / 1000);

    if (diffSec < 10) {
      setLastUpdated("Updated just now");
    } else if (diffSec < 60) {
      setLastUpdated(`Updated ${diffSec} seconds ago`);
    } else {
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) {
        setLastUpdated(`Updated ${diffMin} min ago`);
      } else {
        setLastUpdated(`Updated ${new Date(latest).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`);
      }
    }
  }, [quotes, mounted]);

  useEffect(() => {
    let countdownTimer: ReturnType<typeof setInterval>;
    let refreshTimer: ReturnType<typeof setInterval>;

    const tick = () => {
      setCountdown((prev) => {
        if (prev <= 1) {
          return 30;
        }
        return prev - 1;
      });
    };

    const refresh = async () => {
      setRefreshing(true);
      setError(null);
      try {
        const response = await fetch("/api/market", {
          method: "GET",
          headers: { Accept: "application/json" },
        });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const data = (await response.json()) as { success?: boolean; quotes?: MarketQuote[] };
        if (data?.success && Array.isArray(data.quotes)) {
          setQuotes(data.quotes);
        } else {
          throw new Error("Invalid response");
        }
      } catch (err) {
        console.error("The Tape: refresh failed", err);
        setError("Live update failed. Showing last known data.");
      } finally {
        setRefreshing(false);
        setCountdown(30);
      }
    };

    countdownTimer = setInterval(tick, 1000);
    refreshTimer = setInterval(refresh, 30000);

    return () => {
      clearInterval(countdownTimer);
      clearInterval(refreshTimer);
    };
  }, []);

  const getFiltered = (names: string[]) => {
    const seen = new Set<string>();
    return quotes.filter((q) => {
      if (!names.includes(q.name)) return false;
      if (seen.has(q.symbol)) return false;
      seen.add(q.symbol);
      return true;
    });
  };

  return (
    <div className="min-h-screen bg-bg p-4 md:p-8 page-enter">
      <header className="mb-12 max-w-7xl mx-auto">
        <div className="flex flex-wrap items-center gap-4 mb-2">
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">
            The Tape
          </h1>
          <Badge variant="default" className="bg-red-600 text-white animate-pulse">
            LIVE
          </Badge>
        </div>
        <p className="text-xl md:text-2xl font-medium text-text-secondary mb-6">
          Real-time Market Intelligence
        </p>
        <div className="flex flex-wrap items-center gap-3 text-xs font-black uppercase tracking-widest text-text-secondary">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-accent-bullish rounded-full animate-pulse" />
            Market Open
          </span>
          <span className="opacity-40">|</span>
          <span>{lastUpdated}</span>
        </div>
      </header>

      {error && (
        <div className="max-w-7xl mx-auto mb-6">
          <div className="bg-red-100 border-4 border-ink text-red-900 px-4 py-2 text-xs font-black uppercase">
            {error}
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto space-y-16">
        {/* Market Pulse */}
        <section>
          <MarketPulseCard pulse={pulse} />
        </section>

        {/* Section 1: Tape Live */}
        <section>
          <SectionHeader title="📡 Tape Live" description="A real-time snapshot of today's major financial markets." />
          <div className="space-y-8">
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-text-secondary mb-3">Indian Indices</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {getFiltered(INDIAN_INDICES).map((q) => (
                  <MarketDetailCard key={q.symbol} quote={q} />
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-text-secondary mb-3">Forex & Metals</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {getFiltered(FOREX).map((q) => (
                  <MarketDetailCard key={q.symbol} quote={q} />
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-text-secondary mb-3">Crypto</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {getFiltered(CRYPTO).map((q) => (
                  <MarketDetailCard key={q.symbol} quote={q} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Top NSE Stocks */}
        <section>
          <SectionHeader title="Top NSE Stocks" description="Live prices for major listed equities." />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {getFiltered(NSE_STOCKS).map((q) => (
              <MarketDetailCard key={q.symbol} quote={q} />
            ))}
          </div>
        </section>

        {/* Section 3: Tape Feed */}
        <section>
          <SectionHeader title="Tape Feed" description="Latest high-impact headlines across all asset classes." />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[
              { category: "BREAKING", headline: "RBI maintains repo rate, focus remains on inflation control", time: "2m ago" },
              { category: "FOREX", headline: "USD/INR hits 3-month high amid dollar strength", time: "15m ago" },
              { category: "CRYPTO", headline: "Ethereum ETF inflows reach record highs in weekly report", time: "1h ago" },
              { category: "GLOBAL", headline: "US Fed signals potential rate cuts in late Q3", time: "3h ago" },
              { category: "NSE", headline: "Nifty faces resistance at 24,500; support at 24,100", time: "5h ago" },
            ].map((item, i) => (
              <FeedCard key={i} {...item} />
            ))}
          </div>
        </section>

        {/* Section 4: Tape Insight */}
        <section className="pb-20">
          <SectionHeader title="Tape Insight" description="AI-driven synthesis of current market conditions." />
          <InsightCard
            title="Market Sentiment Analysis"
            content="AI-generated market commentary will appear here once live data is connected. Currently, the tape suggests a bullish bias in equities offset by volatility in the currency markets."
          />
        </section>
      </main>

      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 mt-8">
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-black uppercase tracking-widest text-text-secondary">
          <span>
            {refreshing ? "Refreshing now..." : `Refreshing in ${countdown}s`}
          </span>
          <span>© {new Date().getFullYear()} TradersTape</span>
        </div>
      </footer>
    </div>
  );
}