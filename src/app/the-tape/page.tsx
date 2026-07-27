import React from "react";
import { StatusBadge } from "@/components/the-tape/StatusBadge";
import { SectionHeader } from "@/components/the-tape/SectionHeader";
import { MarketCard } from "@/components/the-tape/MarketCard";
import { InstrumentCard } from "@/components/the-tape/InstrumentCard";
import { TapeCard } from "@/components/the-tape/FeedCard";
import { InsightCard } from "@/components/the-tape/InsightCard";

export default function TheTapePage() {
  const liveMarkets = [
    { name: "NIFTY 50", price: "24,323.45", change: "+1.24%", trend: "up" as const },
    { name: "BANK NIFTY", price: "52,104.10", change: "-0.45%", trend: "down" as const },
    { name: "SENSEX", price: "75,643.20", change: "+0.88%", trend: "up" as const },
    { name: "INDIA VIX", price: "12.45", change: "+2.10%", trend: "down" as const },
    { name: "BTC", price: "67,432.10", change: "+4.12%", trend: "up" as const },
    { name: "ETH", price: "3,452.12", change: "+1.15%", trend: "up" as const },
    { name: "USD/INR", price: "83.42", change: "+0.05%", trend: "flat" as const },
    { name: "GOLD", price: "72,450.00", change: "-0.22%", trend: "down" as const },
  ];

  const nseInstruments = [
    {
      name: "NIFTY 50",
      price: "24,323",
      high: "24,400",
      low: "24,210",
      pivot: "24,300",
      resistance: { r1: "24,450", r2: "24,520", r3: "24,600" },
      support: { s1: "24,250", s2: "24,180", s3: "24,100" },
      trend: "Bullish" as const,
      aiInsight: "Strong momentum observed above pivot. Target R1 with tight stop loss at S1.",
    },
    {
      name: "BANK NIFTY",
      price: "52,104",
      high: "52,300",
      low: "51,900",
      pivot: "52,150",
      resistance: { r1: "52,400", r2: "52,600", r3: "52,800" },
      support: { s1: "52,000", s2: "51,800", s3: "51,600" },
      trend: "Bearish" as const,
      aiInsight: "Price struggling to cross pivot. Expect consolidation between S1 and Pivot.",
    },
  ];

  const forexInstruments = [
    {
      name: "USD/INR",
      price: "83.42",
      high: "83.50",
      low: "83.35",
      pivot: "83.40",
      resistance: { r1: "83.55", r2: "83.65", r3: "83.80" },
      support: { s1: "83.30", s2: "83.20", s3: "83.10" },
      trend: "Neutral" as const,
      aiInsight: "Range-bound movement. Watch for breakout above 83.55 for bullish continuation.",
    },
    {
      name: "EUR/USD",
      price: "1.0845",
      high: "1.0890",
      low: "1.0810",
      pivot: "1.0850",
      resistance: { r1: "1.0910", r2: "1.0950", r3: "1.1000" },
      support: { s1: "1.0820", s2: "1.0780", s3: "1.0750" },
      trend: "Bullish" as const,
      aiInsight: "Positive divergence on 1H chart. Support holding strong at 1.0820.",
    },
  ];

  const cryptoInstruments = [
    {
      name: "Bitcoin",
      price: "67,432",
      high: "68,200",
      low: "66,100",
      pivot: "67,000",
      resistance: { r1: "68,500", r2: "69,200", r3: "71,000" },
      support: { s1: "66,500", s2: "65,000", s3: "64,000" },
      trend: "Bullish" as const,
      aiInsight: "Accumulation phase ending. High probability of test towards 70k.",
    },
    {
      name: "Ethereum",
      price: "3,452",
      high: "3,510",
      low: "3,380",
      pivot: "3,420",
      resistance: { r1: "3,550", r2: "3,620", r3: "3,800" },
      support: { s1: "3,350", s2: "3,200", s3: "3,100" },
      trend: "Neutral" as const,
      aiInsight: "Following BTC lead. Watch for 3,550 breakout for aggressive longs.",
    },
  ];

  const commodities = [
    {
      name: "Gold",
      price: "72,450",
      high: "72,800",
      low: "72,100",
      pivot: "72,300",
      resistance: { r1: "72,700", r2: "73,100", r3: "73,500" },
      support: { s1: "72,000", s2: "71,600", s3: "71,200" },
      trend: "Bearish" as const,
      aiInsight: "Profit booking at highs. Support at 72,000 is critical for bulls.",
    },
    {
      name: "Silver",
      price: "84,120",
      high: "84,500",
      low: "83,800",
      pivot: "84,000",
      resistance: { r1: "84,600", r2: "85,100", r3: "85,800" },
      support: { s1: "83,700", s2: "83,200", s3: "82,500" },
      trend: "Neutral" as const,
      aiInsight: "Correlated with Gold. Expect volatility around US CPI data.",
    },
  ];

  const globalMarkets = [
    {
      name: "S&P 500",
      price: "5,432",
      high: "5,450",
      low: "5,410",
      pivot: "5,420",
      resistance: { r1: "5,460", r2: "5,480", r3: "5,500" },
      support: { s1: "5,400", s2: "5,380", s3: "5,350" },
      trend: "Bullish" as const,
      aiInsight: "Tech heavy rally continuing. Overbought conditions on daily RSI.",
    },
    {
      name: "NASDAQ",
      price: "17,843",
      high: "17,900",
      low: "17,750",
      pivot: "17,800",
      resistance: { r1: "17,950", r2: "18,100", r3: "18,300" },
      support: { s1: "17,700", s2: "17,500", s3: "17,300" },
      trend: "Bullish" as const,
      aiInsight: "AI narrative driving prices. Strong support at 17,700.",
    },
  ];

  const newsFeed = [
    { category: "Macro", headline: "Federal Reserve hints at potential rate cuts in Q4", time: "10m ago" },
    { category: "NSE", headline: "Nifty faces resistance at 24,500; Option chain shows heavy calls", time: "25m ago" },
    { category: "Crypto", headline: "Institutional inflows into BTC ETFs reach record highs", time: "1h ago" },
    { category: "Forex", headline: "USD/INR breaks key resistance, eyes 83.60", time: "2h ago" },
    { category: "Commodities", headline: "Gold prices dip as dollar strengthens", time: "3h ago" },
  ];

  return (
    <div className="min-h-screen bg-bg-main text-ink p-4 md:p-8 lg:p-12">
      {/* Page Header */}
      <header className="mb-16 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
               <h1 className="text-4xl sm:text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none">
                 The Tape
               </h1>
              <StatusBadge label="LIVE" variant="live" />
            </div>
            <p className="text-xl md:text-2xl font-bold text-ink/60 uppercase tracking-wide">
              Real-time Market Intelligence
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-black text-ink/40 block mb-1">Last Updated</span>
            <span className="font-mono font-bold text-lg">2026-07-27 17:42:10 UTC</span>
          </div>
        </div>
        <div className="h-4 bg-ink brutal-border w-full" />
      </header>

      <div className="space-y-24">
        {/* Section 1: Tape Live */}
        <section>
          <SectionHeader 
            title="📡 Tape Live" 
            description="A real-time snapshot of today's major financial markets." 
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {liveMarkets.map((m) => (
              <MarketCard key={m.name} {...m} />
            ))}
          </div>
        </section>

        {/* Section 2: NSE */}
        <section>
          <SectionHeader title="NSE Intelligence" description="Detailed technical levels for Indian benchmarks." />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {nseInstruments.map((i) => (
              <InstrumentCard key={i.name} {...i} />
            ))}
          </div>
        </section>

        {/* Section 3: Forex */}
        <section>
          <SectionHeader title="Forex Tape" description="Global currency pair dynamics and pivot levels." />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {forexInstruments.map((i) => (
              <InstrumentCard key={i.name} {...i} />
            ))}
          </div>
        </section>

        {/* Section 4: Crypto */}
        <section>
          <SectionHeader title="Crypto Intelligence" description="Digital asset momentum and AI-driven insights." />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {cryptoInstruments.map((i) => (
              <InstrumentCard key={i.name} {...i} />
            ))}
          </div>
        </section>

        {/* Section 5: Commodities */}
        <section>
          <SectionHeader title="Commodities Tape" description="Hard assets and energy market snapshots." />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {commodities.map((i) => (
              <InstrumentCard key={i.name} {...i} />
            ))}
          </div>
        </section>

        {/* Section 6: Global Markets */}
        <section>
          <SectionHeader title="Global Markets" description="Key indices from the world's leading exchanges." />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {globalMarkets.map((i) => (
              <InstrumentCard key={i.name} {...i} />
            ))}
          </div>
        </section>

        {/* Section 7: Tape Feed */}
        <section>
          <SectionHeader title="Tape Feed" description="Curated high-impact headlines affecting market sentiment." />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {newsFeed.map((news, idx) => (
              <TapeCard key={idx}>
                <div className="p-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-black uppercase bg-bg-featured px-2 py-1 brutal-border">
                      {news.category}
                    </span>
                    <span className="text-[10px] font-bold text-ink/40">{news.time}</span>
                  </div>
                  <h4 className="font-black text-lg leading-tight hover:underline cursor-pointer">
                    {news.headline}
                  </h4>
                </div>
              </TapeCard>
            ))}
          </div>
        </section>

        {/* Section 8: Tape Insight */}
        <section className="pb-20">
          <InsightCard 
            title="Tape Insight" 
            content="AI-generated market commentary will appear here once live data is connected. Currently analyzing cross-asset correlations between Nifty 50 and US Treasury yields." 
          />
        </section>
      </div>
    </div>
  );
}