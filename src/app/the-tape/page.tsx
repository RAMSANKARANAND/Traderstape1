import React from "react";
import { SectionHeader } from "@/components/the-tape/SectionHeader";
import { StatusBadge } from "@/components/the-tape/StatusBadge";
import { MarketCard } from "@/components/the-tape/MarketCard";
import { InstrumentCard } from "@/components/the-tape/InstrumentCard";
import { FeedCard } from "@/components/the-tape/FeedCard";
import { InsightCard } from "@/components/the-tape/InsightCard";

export const metadata = {
  title: "The Tape — Market Intelligence",
  description:
    "Real-time market intelligence dashboard. Track NSE, forex, crypto, commodities, and global markets in one place.",
};

export default function TheTapePage() {
  return (
    <div className="page-enter">
      {/* ── Page Header ── */}
      <section className="bg-accent-pink brutal-border-b border-b-3 border-ink">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl md:text-6xl font-black uppercase leading-tight">
              The Tape
            </h1>
            <StatusBadge variant="live" />
          </div>
          <p className="text-lg md:text-xl font-bold max-w-2xl mb-4">
            Real-time Market Intelligence
          </p>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider opacity-60">
            <span>Last Updated</span>
            <span className="font-mono">26 Jul 2026, 22:00 IST</span>
          </div>
        </div>
      </section>

      {/* ── SECTION 1: Tape Live ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <SectionHeader
          title="📡 Tape Live"
          description="A real-time snapshot of today's major financial markets."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MarketCard name="NIFTY 50" price="24,861.15" change="+142.35 (+0.58%)" trend="bullish" />
          <MarketCard name="BANK NIFTY" price="51,234.60" change="+312.80 (+0.61%)" trend="bullish" />
          <MarketCard name="SENSEX" price="81,455.40" change="+198.20 (+0.24%)" trend="bullish" />
          <MarketCard name="INDIA VIX" price="12.45" change="-0.82 (-6.18%)" trend="bearish" />
          <MarketCard name="BTC" price="$67,432" change="+1,245 (+1.88%)" trend="bullish" />
          <MarketCard name="ETH" price="$3,456" change="-23 (-0.66%)" trend="bearish" />
          <MarketCard name="USD/INR" price="83.72" change="+0.08 (+0.10%)" trend="neutral" />
          <MarketCard name="GOLD" price="$2,398" change="+14.50 (+0.61%)" trend="bullish" />
        </div>
      </section>

      {/* ── SECTION 2: NSE ── */}
      <section className="bg-accent-yellow/30 brutal-border-t border-t-3 border-ink brutal-border-b border-b-3 border-ink py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title="NSE" description="Key levels and technical insights for Nifty 50 and Bank Nifty." />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InstrumentCard
              name="NIFTY 50"
              price="24,861.15"
              high="24,912.30"
              low="24,718.45"
              pivot="24,815.38"
              resistance={{ r1: "24,912.30", r2: "24,963.45", r3: "25,058.22" }}
              support={{ s1: "24,718.45", s2: "24,667.30", s3: "24,572.53" }}
              trend="bullish"
              aiInsight="Nifty holding above 24,800 with strong momentum. Key resistance at 24,950. A breakout above could trigger short covering."
            />
            <InstrumentCard
              name="BANK NIFTY"
              price="51,234.60"
              high="51,412.80"
              low="50,921.15"
              pivot="51,166.98"
              resistance={{ r1: "51,412.80", r2: "51,591.00", r3: "51,904.45" }}
              support={{ s1: "50,921.15", s2: "50,742.95", s3: "50,429.50" }}
              trend="bullish"
              aiInsight="Bank Nifty recovering from support at 50,900. Private banks leading the rally. Watch 51,500 for further upside."
            />
          </div>
        </div>
      </section>

      {/* ── SECTION 3: Forex ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <SectionHeader title="Forex" description="Major currency pairs and their current market levels." />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MarketCard name="USD/INR" price="83.72" change="+0.08 (+0.10%)" trend="neutral" />
          <MarketCard name="EUR/USD" price="1.0842" change="-0.0012 (-0.11%)" trend="bearish" />
          <MarketCard name="GBP/USD" price="1.2915" change="+0.0038 (+0.29%)" trend="bullish" />
          <MarketCard name="USD/JPY" price="153.84" change="+0.42 (+0.27%)" trend="bullish" />
        </div>
      </section>

      {/* ── SECTION 4: Crypto ── */}
      <section className="bg-accent-pink brutal-border-t border-t-3 border-ink brutal-border-b border-b-3 border-ink py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title="Crypto" description="Cryptocurrency market snapshot with real-time prices." />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MarketCard name="Bitcoin" price="$67,432" change="+1,245 (+1.88%)" trend="bullish" />
            <MarketCard name="Ethereum" price="$3,456" change="-23 (-0.66%)" trend="bearish" />
            <MarketCard name="Solana" price="$148.23" change="+5.67 (+3.98%)" trend="bullish" />
            <MarketCard name="XRP" price="$0.6124" change="+0.0089 (+1.47%)" trend="bullish" />
          </div>
        </div>
      </section>

      {/* ── SECTION 5: Commodities ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <SectionHeader title="Commodities" description="Precious metals, energy, and commodity prices." />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MarketCard name="Gold" price="$2,398.50" change="+14.50 (+0.61%)" trend="bullish" />
          <MarketCard name="Silver" price="$29.45" change="+0.32 (+1.10%)" trend="bullish" />
          <MarketCard name="Crude Oil" price="$78.32" change="-1.15 (-1.45%)" trend="bearish" />
          <MarketCard name="Natural Gas" price="$2.14" change="+0.06 (+2.88%)" trend="bullish" />
        </div>
      </section>

      {/* ── SECTION 6: Global Markets ── */}
      <section className="bg-accent-blue/10 brutal-border-t border-t-3 border-ink brutal-border-b border-b-3 border-ink py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title="Global Markets" description="Major global indices performance snapshot." />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <MarketCard name="S&P 500" price="5,634.20" change="+23.45 (+0.42%)" trend="bullish" />
            <MarketCard name="NASDAQ" price="18,245.60" change="+89.30 (+0.49%)" trend="bullish" />
            <MarketCard name="Dow Jones" price="41,128.50" change="-15.20 (-0.04%)" trend="neutral" />
            <MarketCard name="FTSE 100" price="8,234.70" change="+34.50 (+0.42%)" trend="bullish" />
            <MarketCard name="Nikkei" price="39,812.40" change="-124.60 (-0.31%)" trend="bearish" />
            <MarketCard name="Hang Seng" price="17,234.80" change="+98.40 (+0.57%)" trend="bullish" />
          </div>
        </div>
      </section>

      {/* ── SECTION 7: Tape Feed ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <SectionHeader
          title="Tape Feed"
          description="Curated market-moving headlines and breaking news."
        />
        <div className="space-y-3">
          <FeedCard
            category="Market"
            headline="Nifty hits fresh all-time high above 24,900 driven by IT and banking stocks"
            time="2 min ago"
          />
          <FeedCard
            category="Earnings"
            headline="TCS reports 8.2% QoQ profit beat; board announces ₹42 interim dividend"
            time="14 min ago"
          />
          <FeedCard
            category="Macro"
            headline="India CPI inflation cools to 4.12% in June, below RBI target range"
            time="28 min ago"
          />
          <FeedCard
            category="Geopolitics"
            headline="US Treasury yields dip as Fed signals potential rate cut in September"
            time="45 min ago"
          />
          <FeedCard
            category="Crypto"
            headline="Bitcoin ETF inflows surge $342M in a single day — highest since March"
            time="1 hr ago"
          />
          <FeedCard
            category="Forex"
            headline="Rupee trades in narrow range as RBI likely intervenes at 83.80 level"
            time="1 hr ago"
          />
          <FeedCard
            category="Market"
            headline="Gold prices extend rally on weak US dollar and geopolitical tensions"
            time="2 hr ago"
          />
          <FeedCard
            category="Earnings"
            headline="Reliance Industries Q1 net profit rises 7.3% YoY, retail segment shines"
            time="2 hr ago"
          />
        </div>
      </section>

      {/* ── SECTION 8: Tape Insight ── */}
      <section className="bg-ink/5 brutal-border-t border-t-3 border-ink py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <InsightCard
            title="Tape Insight"
            body="AI-generated market commentary will appear here once live data is connected. This dashboard is designed to provide real-time technical analysis, trend detection, and actionable market insights across NSE, forex, crypto, commodities, and global indices. Stay tuned for the full intelligence feed."
          />
        </div>
      </section>
    </div>
  );
}