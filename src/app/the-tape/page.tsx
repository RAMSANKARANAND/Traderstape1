import React from "react";
import { SectionHeader } from "@/components/the-tape/SectionHeader";
import { MarketCard } from "@/components/the-tape/MarketCard";
import { InstrumentCard } from "@/components/the-tape/InstrumentCard";
import { FeedCard } from "@/components/the-tape/FeedCard";
import { InsightCard } from "@/components/the-tape/InsightCard";
import { Badge } from "@/components/ui/Badge";

export default function TheTapePage() {
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const tapeLiveMarkets = [
    { name: "NIFTY 50", price: "24,321.45", change: "+1.24%", status: "bullish" as const },
    { name: "BANK NIFTY", price: "52,104.10", change: "-0.45%", status: "bearish" as const },
    { name: "SENSEX", price: "75,842.20", change: "+0.12%", status: "neutral" as const },
    { name: "INDIA VIX", price: "12.45", change: "-2.10%", status: "bullish" as const },
    { name: "BTC", price: "67,432.10", change: "+4.52%", status: "bullish" as const },
    { name: "ETH", price: "3,451.20", change: "+1.15%", status: "bullish" as const },
    { name: "USD/INR", price: "83.42", change: "+0.05%", status: "neutral" as const },
    { name: "GOLD", price: "72,450.00", change: "-0.88%", status: "bearish" as const },
  ];

  const nseInstruments = [
    {
      name: "Reliance Ind",
      price: "2,945.00",
      high: "2,980.00",
      low: "2,910.00",
      pivot: "2,940.00",
      resistance: { r1: "2,960", r2: "2,985", r3: "3,010" },
      support: { s1: "2,920", s2: "2,890", s3: "2,860" },
      trend: "bullish" as const,
      aiInsight: "Strong accumulation seen at 2,910 levels. Target R2 if volume persists."
    },
    {
      name: "HDFC Bank",
      price: "1,642.10",
      high: "1,655.00",
      low: "1,630.00",
      pivot: "1,640.00",
      resistance: { r1: "1,650", r2: "1,665", r3: "1,680" },
      support: { s1: "1,635", s2: "1,620", s3: "1,600" },
      trend: "neutral" as const,
      aiInsight: "Consolidating in a tight range. Breakout above 1,655 could trigger rally."
    },
  ];

  const forexInstruments = [
    {
      name: "USD/INR",
      price: "83.42",
      high: "83.50",
      low: "83.35",
      pivot: "83.40",
      resistance: { r1: "83.45", r2: "83.55", r3: "83.65" },
      support: { s1: "83.38", s2: "83.30", s3: "83.20" },
      trend: "neutral" as const,
      aiInsight: "Range-bound movement expected. Key support at 83.30."
    },
    {
      name: "EUR/USD",
      price: "1.0842",
      high: "1.0860",
      low: "1.0820",
      pivot: "1.0830",
      resistance: { r1: "1.0850", r2: "1.0870", r3: "1.0890" },
      support: { s1: "1.0825", s2: "1.0810", s3: "1.0790" },
      trend: "bearish" as const,
      aiInsight: "Downward pressure continuing. Watch for 1.0810 support."
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
      support: { s1: "66,500", s2: "65,000", s3: "63,000" },
      trend: "bullish" as const,
      aiInsight: "Strong momentum. Holding above 67k pivot is key for next leg up."
    },
    {
      name: "Ethereum",
      price: "3,451",
      high: "3,520",
      low: "3,380",
      pivot: "3,420",
      resistance: { r1: "3,480", r2: "3,550", r3: "3,620" },
      support: { s1: "3,400", s2: "3,350", s3: "3,300" },
      trend: "bullish" as const,
      aiInsight: "Following BTC lead. Resistance at 3,520 needs to break for new highs."
    },
  ];

  const commodities = [
    {
      name: "Gold",
      price: "72,450",
      high: "72,800",
      low: "72,100",
      pivot: "72,300",
      resistance: { r1: "72,600", r2: "72,900", r3: "73,500" },
      support: { s1: "72,200", s2: "71,800", s3: "71,500" },
      trend: "bearish" as const,
      aiInsight: "Profit booking at highs. Support at 72,100 is critical."
    },
    {
      name: "Crude Oil",
      price: "84.20",
      high: "85.10",
      low: "83.50",
      pivot: "84.00",
      resistance: { r1: "84.80", r2: "85.50", r3: "86.20" },
      support: { s1: "83.80", s2: "83.20", s3: "82.50" },
      trend: "neutral" as const,
      aiInsight: "Geopolitical tensions balancing supply cuts. Range 83.5-85.1."
    },
  ];

  const globalMarkets = [
    {
      name: "S&P 500",
      price: "5,432.10",
      high: "5,450.00",
      low: "5,410.00",
      pivot: "5,420.00",
      resistance: { r1: "5,440", r2: "5,460", r3: "5,480" },
      support: { s1: "5,415", s2: "5,400", s3: "5,380" },
      trend: "bullish" as const,
      aiInsight: "Tech earnings driving growth. Bullish bias remains."
    },
    {
      name: "NASDAQ",
      price: "17,842.50",
      high: "17,900.00",
      low: "17,750.00",
      pivot: "17,800.00",
      resistance: { r1: "17,880", r2: "17,950", r3: "18,100" },
      support: { s1: "17,780", s2: "17,700", s3: "17,600" },
      trend: "bullish" as const,
      aiInsight: "AI hype continuing to support levels. Watch 17,800 pivot."
    },
  ];

  const newsFeed = [
    { category: "BREAKING", headline: "RBI maintains repo rate, focus remains on inflation control", time: "2m ago" },
    { category: "FOREX", headline: "USD/INR hits 3-month high amid dollar strength", time: "15m ago" },
    { category: "CRYPTO", headline: "Ethereum ETF inflows reach record highs in weekly report", time: "1h ago" },
    { category: "GLOBAL", headline: "US Fed signals potential rate cuts in late Q3", time: "3h ago" },
    { category: "NSE", headline: "Nifty faces resistance at 24,500; support at 24,100", time: "5h ago" },
  ];

  return (
    <div className="min-h-screen bg-bg p-4 md:p-8 page-enter">
      {/* Page Header */}
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
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-text-secondary">
          <span className="w-2 h-2 bg-accent-bullish rounded-full animate-pulse" />
          Last Updated: {currentTime}
        </div>
      </header>

      <main className="max-w-7xl mx-auto space-y-16">
        {/* Section 1: Tape Live */}
        <section>
          <SectionHeader 
            title="📡 Tape Live" 
            description="A real-time snapshot of today's major financial markets." 
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {tapeLiveMarkets.map((m, i) => (
              <MarketCard key={i} {...m} />
            ))}
          </div>
        </section>

        {/* Section 2: NSE */}
        <section>
          <SectionHeader title="NSE Markets" description="Detailed analysis of Indian equity benchmarks." />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {nseInstruments.map((inst, i) => (
              <InstrumentCard key={i} {...inst} />
            ))}
          </div>
        </section>

        {/* Section 3: Forex */}
        <section>
          <SectionHeader title="Forex Desk" description="Global currency pairs and volatility tracking." />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {forexInstruments.map((inst, i) => (
              <InstrumentCard key={i} {...inst} />
            ))}
          </div>
        </section>

        {/* Section 4: Crypto */}
        <section>
          <SectionHeader title="Crypto Tape" description="Digital asset movements and on-chain sentiment." />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cryptoInstruments.map((inst, i) => (
              <InstrumentCard key={i} {...inst} />
            ))}
          </div>
        </section>

        {/* Section 5: Commodities */}
        <section>
          <SectionHeader title="Commodities" description="Hard assets and energy market intelligence." />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {commodities.map((inst, i) => (
              <InstrumentCard key={i} {...inst} />
            ))}
          </div>
        </section>

        {/* Section 6: Global Markets */}
        <section>
          <SectionHeader title="Global Markets" description="Key indices from the world's leading exchanges." />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {globalMarkets.map((inst, i) => (
              <InstrumentCard key={i} {...inst} />
            ))}
          </div>
        </section>

        {/* Section 7: Tape Feed */}
        <section>
          <SectionHeader title="Tape Feed" description="Latest high-impact headlines across all asset classes." />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {newsFeed.map((item, i) => (
              <FeedCard key={i} {...item} />
            ))}
          </div>
        </section>

        {/* Section 8: Tape Insight */}
        <section className="pb-20">
          <SectionHeader title="Tape Insight" description="AI-driven synthesis of current market conditions." />
          <InsightCard 
            title="Market Sentiment Analysis" 
            content="AI-generated market commentary will appear here once live data is connected. Currently, the tape suggests a bullish bias in equities offset by volatility in the currency markets." 
          />
        </section>
      </main>
    </div>
  );
}