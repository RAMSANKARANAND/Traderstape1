import { getPublishedNewsPosts, getLatestTapeView, getLatestPublishedMorningBrief, getTrendingCategories } from "@/lib/db-raw";
import { getMarketQuotes } from "@/lib/market/service";
import { formatPrice, formatPercent, getTopMovers } from "@/lib/market/utils";
import { generateAiContent } from "@/lib/ai/service";
import { getKvNamespace } from "@/lib/rate-limit";
import type { MorningBriefContext } from "@/lib/ai/types";
import type { MarketQuote } from "@/lib/market/types";
import { SectionTitle, Badge, NewsCard, Button } from "@/components/ui";
import { MarketCard } from "@/components/the-tape/MarketCard";
import { MorningMarketBriefCard } from "@/components/ai/MorningMarketBriefCard";
import { LiveMarketTicker } from "@/components/markets/LiveTicker";
import { useMarketTicker } from "@/hooks/useMarketTicker";
import Link from "next/link";
import NewsletterSignup from "@/components/home/NewsletterSignup";

import React from "react";

type MorningBriefData = {
  sentiment: string;
  confidence: number;
  focusPoints: readonly string[];
  globalOverview: {
    us: string;
    europe: string;
    asia: string;
  };
  riskEvents: ReadonlyArray<{
    level: "High" | "Medium" | "Low";
    title: string;
    description: string;
  }>;
  summary: string;
} | null;

export const dynamic = "force-dynamic";

const MARKET_FOCUS = [
  "Nifty consolidates near 24,200 ahead of weekly expiry",
  "Banking index underperforms; IT stocks show resilience",
  "USD/INR holds 83.40 as RBI maintains status quo",
];

function formatDate(date: Date | null): string {
  if (!date) return "";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(date));
}

export default async function HomePage() {
  let newsPosts: Awaited<ReturnType<typeof getPublishedNewsPosts>> = [];
  let latestTapeView: Awaited<ReturnType<typeof getLatestTapeView>> = null;
  let marketQuotes: Awaited<ReturnType<typeof getMarketQuotes>> = [];
  let trendingCategories: { category: "STOCKS" | "CRYPTO" | "FOREX" | "GEOPOLITICAL"; count: number }[] = [];

  try {
    const [posts, tape, quotes] = await Promise.all([
      getPublishedNewsPosts({ take: 8 }),
      getLatestTapeView(),
      getMarketQuotes(),
    ]);
    newsPosts = posts ?? [];
    latestTapeView = tape;
    marketQuotes = quotes ?? [];
  } catch (error) {
    console.error("Failed to fetch homepage data, using fallbacks:", error);
  }

  try {
    const trending = await getTrendingCategories(48);
    trendingCategories = trending ?? [];
  } catch (error) {
    console.error("Failed to fetch trending categories:", error);
  }

  const breakingPost = newsPosts.find((p) => p.isBreaking) ?? null;
  const featuredPost = newsPosts.find((p) => p.isFeatured && p.id !== breakingPost?.id) ?? null;

  const heroIds = [breakingPost?.id, featuredPost?.id].filter(Boolean) as string[];
  const latestNews = heroIds.length
    ? newsPosts.filter((p) => !heroIds.includes(p.id))
    : newsPosts;

  // Prepare context for AI morning brief generation
  const morningBriefContext: MorningBriefContext = {
    marketSentiment: "Neutral", // Default, will be overridden by AI
    marketPulse: "Mixed", // Default, will be overridden by AI
    marketQuotes: marketQuotes.map(q => ({
      symbol: q.symbol,
      name: q.symbol, // Using symbol as name since we don't have separate name field
      price: String(q.price),
      changePercent: String(q.change).replace('%', ''), // Remove % sign
      direction: q.direction === "up" ? "up" : "down",
    })),
    latestNews: newsPosts.map(p => ({
      title: p.title,
      category: p.category,
      summary: p.summary,
      publishedAt: p.publishedAt ? p.publishedAt.toISOString() : undefined
    })),
    latestTapeViews: latestTapeView ? [{
      title: latestTapeView.title,
      category: latestTapeView.category,
      instrument: latestTapeView.instrument,
      bias: latestTapeView.bias,
      todayView: latestTapeView.todayView,
      keyLevelsToWatch: null,
      riskFactors: null,
    }] : []
  };

// Generate AI-powered morning brief with KV caching
   let aiMorningBriefResult: Awaited<ReturnType<typeof generateAiContent>> = { success: false, mode: "mock", message: "AI unavailable", data: undefined };
   try {
     const CACHE_KEY = "ai-morning-brief-cache";
     const kv = await getKvNamespace();
     
     if (kv) {
       const cached = await kv.get(CACHE_KEY);
       if (cached) {
         console.log("[MORNING BRIEF CACHE] HIT");
         aiMorningBriefResult = JSON.parse(cached);
       } else {
         console.log("[MORNING BRIEF CACHE] MISS");
         aiMorningBriefResult = await generateAiContent({
           action: "generate-morning-brief",
           briefContext: morningBriefContext,
         });
         // Cache for 1 hour (3600 seconds)
         await kv.put(CACHE_KEY, JSON.stringify(aiMorningBriefResult), { expirationTtl: 3600 });
       }
     } else {
       // Fallback if KV unavailable: generate live (existing behavior)
       console.log("[MORNING BRIEF CACHE] KV unavailable, generating live");
       aiMorningBriefResult = await generateAiContent({
         action: "generate-morning-brief",
         briefContext: morningBriefContext,
       });
     }
   } catch (error) {
     console.error("AI morning brief generation failed:", error);
   }

  // Parse the AI response into the format expected by MorningMarketBriefCard
  let morningBrief: MorningBriefData = null;
  if (aiMorningBriefResult.success && aiMorningBriefResult.data?.content) {
    try {
      morningBrief = parseAIResponseToMorningBrief(String(aiMorningBriefResult.data.content));
    } catch (e) {
      console.error("Failed to parse AI response:", e);
    }
  }

  // Fallback to DB-based brief if AI generation fails
  let fallbackBrief: MorningBriefData = null;
  if (!morningBrief) {
    try {
      const dbBrief = await getLatestPublishedMorningBrief();
      if (dbBrief) {
        fallbackBrief = {
          sentiment: dbBrief.sentiment,
          confidence: dbBrief.confidence,
          focusPoints: dbBrief.focusPoints as readonly string[],
          globalOverview: {
            us: dbBrief.globalUs,
            europe: dbBrief.globalEurope,
            asia: dbBrief.globalAsia,
          },
          riskEvents: dbBrief.riskEvents as ReadonlyArray<{ level: "High" | "Medium" | "Low"; title: string; description: string }>,
          summary: dbBrief.summary,
        };
      }
    } catch (error) {
      console.error("Failed to fetch fallback morning brief:", error);
    }
  }
  const finalMorningBrief = morningBrief || fallbackBrief;

const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "TradersTape",
    description: "Market-watching site covering stock F&O levels, forex levels, and geopolitical trading news for educational purposes.",
    url: "https://traderstape.com",
  };

   // Filter market quotes for the Market Snapshot card
   const snapshotSymbols = [
     "^NSEI", "^NSEBANK", "^BSESN", "^INDIAVIX", "RELIANCE.NS",
     "GC=F", "SI=F", "CL=F", "EURUSD=X", "GBPUSD=X", "USDJPY=X",
   ];
   const snapshot = marketQuotes.filter((q) => snapshotSymbols.includes(q.symbol));

   const getSnapshotLabel = (symbol: string): string => {
     const labels: Record<string, string> = {
       "^NSEI": "NIFTY 50", "^NSEBANK": "BANK NIFTY", "^BSESN": "SENSEX",
       "^INDIAVIX": "INDIA VIX", "RELIANCE.NS": "RELIANCE",
       "GC=F": "GOLD", "SI=F": "SILVER", "CL=F": "CRUDE",
       "EURUSD=X": "EUR/USD", "GBPUSD=X": "GBP/USD", "USDJPY=X": "USD/JPY",
     };
     return labels[symbol] || symbol.replace(/^\^/, "").replace(".NS", "");
   };

   const indices = snapshot.filter((q) => ["^NSEI", "^NSEBANK", "^BSESN", "^INDIAVIX", "RELIANCE.NS"].includes(q.symbol));
   const commodities = snapshot.filter((q) => ["GC=F", "SI=F", "CL=F", "EURUSD=X", "GBPUSD=X", "USDJPY=X"].includes(q.symbol));

const global = marketQuotes.filter((q) =>
      ["^GSPC", "^IXIC", "^DJI", "^N225", "^FTSE", "^GDAXI", "^HSI", "GOLD", "BTC"].includes(q.symbol)
    );

    const getLastUpdatedFromQuotes = (quotes: MarketQuote[]): number => {
     if (!quotes || quotes.length === 0) return Date.now();
     return Math.max(...quotes.map(q => new Date(q.updatedAt).getTime()));
   };

   const globalLastUpdated = getLastUpdatedFromQuotes(global);
   const snapshotLastUpdated = getLastUpdatedFromQuotes(snapshot);
   const tickerLastUpdated = Math.max(globalLastUpdated, snapshotLastUpdated, Date.now());

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />

      {/* ───────────────────────── Live Market Ticker ───────────────────────── */}
      <section className="max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <LiveMarketTicker items={marketQuotes} />
      </section>

      {/* ───────────────────────── 1. Hero Dashboard ───────────────────────── */}
      <section className="max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2 animate-fade-in-up">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">

          {/* ── Card 1: Morning Market Brief ── */}
          {finalMorningBrief && (
            <MorningMarketBriefCard data={finalMorningBrief} />
          )}
          
{/* ── Card 2: Market Snapshot ── */}
            <div className="flex flex-col h-full bg-white border border-[#cccccc] rounded-lg shadow-sm">
              <div className="flex items-center gap-2 px-3.5 py-2.5 bg-[var(--color-surface)] border-b border-[var(--color-surface)]/20">
                <Badge variant="flat" className="bg-[var(--color-accent-500)] text-[var(--color-bg)] border-[0px] text-[10px]">LIVE</Badge>
                <span className="text-card-title font-black uppercase tracking-tight" style={{ color: 'var(--color-text)' }}>Market Snapshot</span>
              </div>
              <div className="flex flex-col flex-1">
<div className="px-3.5 py-2">
                   <h4 className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: 'var(--color-text)' }}>Indices & Equities</h4>
                   <div className="space-y-1">
{indices.map((quote) => (
                       <div key={quote.symbol} className="flex items-center justify-between border-b border-[var(--color-surface)]/20 py-1.5 last:border-0">
                         <span className="text-small font-black uppercase tracking-wide" style={{ color: 'var(--color-accent-800)' }}>{getSnapshotLabel(quote.symbol)}</span>
                         <div className="text-right">
                           <span className="text-card-title font-black tabular-nums mr-2" style={{ color: 'var(--color-text)' }}>{formatPrice(quote.price)}</span>
                           <span className={`text-small font-bold tabular-nums ${quote.changePercent >= 0 ? "ng-pill-positive" : "ng-pill-negative"}`}>
                             {quote.changePercent >= 0 ? "+" : ""}{quote.changePercent?.toFixed(2)}%
                           </span>
                         </div>
                       </div>
                     ))}
                  </div>
                </div>

<div className="px-3.5 pt-3 border-t border-[var(--color-surface)]/20">
                   <h4 className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: 'var(--color-text)' }}>Metals & Currency</h4>
                   <div className="space-y-1">
{commodities.map((quote) => (
                       <div key={quote.symbol} className="flex items-center justify-between border-b border-[var(--color-surface)]/20 py-1.5 last:border-0">
                         <span className="text-small font-black uppercase tracking-wide" style={{ color: 'var(--color-accent-800)' }}>{getSnapshotLabel(quote.symbol)}</span>
                         <div className="text-right">
                           <span className="text-card-title font-black tabular-nums mr-2" style={{ color: 'var(--color-text)' }}>{formatPrice(quote.price)}</span>
                           <span className={`text-small font-bold tabular-nums ${quote.changePercent >= 0 ? "ng-pill-positive" : "ng-pill-negative"}`}>
                             {quote.changePercent >= 0 ? "+" : ""}{quote.changePercent?.toFixed(2)}%
                           </span>
                         </div>
                       </div>
                     ))}
                  </div>
                </div>
              </div>

{/* CTA */}
               <div className="px-3.5 py-2.5 border-t border-[var(--color-surface)]/20">
                 <Link href="/the-tape" className="inline-block btn-hero-cyan px-3.5 py-1.5 font-black uppercase text-[11px] tracking-wide hover:bg-accent-600 hover:text-white transition-colors">
                   View Full Market Data →
                 </Link>
               </div>
            </div>

          {/* ── Card 3: Featured Tape View ── */}
{latestTapeView ? (
             <Link
               href={`/tape-views/${latestTapeView.slug}`}
               className="flex flex-col h-full bg-white border border-[#cccccc] rounded-lg shadow-sm"
             >
               {/* Header strip */}
               <div className="flex items-center gap-2 px-3.5 py-2.5 bg-[var(--color-surface)] border-b border-[var(--color-surface)]/20">
                 <Badge variant="flat" className="bg-[var(--color-accent-500)] text-[var(--color-bg)] border-[0px] text-[10px]">{latestTapeView.category}</Badge>
                 <span className="text-small font-bold uppercase" style={{ color: 'var(--color-text)' }}>{latestTapeView.instrument}</span>
                 <Badge
                   variant={latestTapeView.bias === "BULLISH" ? "bullish" : latestTapeView.bias === "BEARISH" ? "bearish" : "neutral"}
                   className="bg-[var(--color-accent-500)] text-[var(--color-bg)] border-[0px] text-[10px]"
                 >
                   {latestTapeView.bias}
                 </Badge>
               </div>

               {/* White body content */}
               <div className="p-3.5 flex flex-col flex-1">
                  <div className="mb-3">
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                      {global.map((quote) => (
                        <div key={quote.symbol} className="flex items-center justify-between">
                          <span className="text-[13px] font-black uppercase truncate pr-2" style={{ color: 'var(--color-accent-800)' }}>
                            {quote.symbol.replace(/^\^/, "")}
                          </span>
                          <span className="text-[13px] font-black tabular-nums" style={{ color: 'var(--color-text)' }}>
                            {formatPrice(quote.price)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <h3 className="text-card-title font-black uppercase leading-tight mb-2 line-clamp-2" style={{ color: 'var(--color-text)' }}>
                    {latestTapeView.title}
                  </h3>
                  <p className="text-small font-bold leading-relaxed line-clamp-3 flex-1" style={{ color: 'var(--color-text)' }}>
                    {latestTapeView.todayView}
                  </p>
                  <div className="mt-3">
                    <span className="inline-block btn-hero-cyan px-3.5 py-1.5 font-black uppercase text-[11px] tracking-wide hover:bg-accent-600 hover:text-white transition-colors">
                      Read Analysis →
                    </span>
                  </div>
               </div>
             </Link>
           ) : (
             <div className="flex flex-col h-full bg-white border border-[#cccccc] rounded-lg shadow-sm p-6 items-center justify-center">
               <p className="text-body font-black uppercase opacity-40 text-center" style={{ color: 'var(--color-neutral-600)' }}>
                 No analysis available
               </p>
             </div>
           )}
        </div>
      </section>

{/* ───────────────────────── 1. Sector Performance Heatmap ───────────────────────── */}
        <section className="max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 animate-fade-in-up">
          <div className="flex flex-col h-full bg-white border border-[#cccccc] rounded-lg shadow-sm">
            {/* Header */}
            <div className="flex items-center gap-2 px-3.5 py-2.5 bg-[var(--color-surface)] border-b border-[var(--color-surface)]/20">
              <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--color-text)' }}>Sector Performance</span>
            </div>
            
 {/* Sector Tiles Grid */}
             <div className="p-3.5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
               {/* Filter and map sector quotes */}
               {(() => {
                 const sectorQuotes = marketQuotes.filter(quote => 
                   [
                     "^CNXAUTO", "^CNXIT", "^CNXPHARMA", "^CNXFMCG", 
                     "^CNXMETAL", "^CNXENERGY", "^CNXREALTY", 
                     "^CNXPSE", "^CNXMEDIA"
                   ].includes(quote.symbol)
                 );
                 if (sectorQuotes.length === 0) {
                   return <p className="text-center py-4 text-[var(--color-neutral-600)]">Sector data unavailable</p>;
                 }
                 return sectorQuotes.map((quote) => {
                   const changePercent = quote.changePercent || 0;
                   
                   // Determine color intensity based on change magnitude
                   let bgColor = '', textColor = '';
                   
                   if (changePercent >= 2) {
                     // Strong gains: dark green
                     bgColor = 'bg-green-800';
                     textColor = 'text-white';
                   } else if (changePercent >= 0.5) {
                     // Moderate gains: medium green
                     bgColor = 'bg-green-500';
                     textColor = 'text-white';
                   } else if (changePercent > 0) {
                     // Slight gains: light green
                     bgColor = 'bg-green-100';
                     textColor = 'text-green-800';
                   } else if (changePercent >= -0.5) {
                     // Slight losses: light red
                     bgColor = 'bg-red-100';
                     textColor = 'text-red-800';
                   } else if (changePercent >= -2) {
                     // Moderate losses: medium red
                     bgColor = 'bg-red-500';
                     textColor = 'text-white';
                   } else {
                     // Strong losses: dark red
                     bgColor = 'bg-red-800';
                     textColor = 'text-white';
                   }
                   
                   return (
                     <div key={quote.symbol} className={`p-3 rounded-lg text-center ${bgColor} ${textColor}`}>
                       <div className="font-bold text-sm mb-1">
                         {quote.symbol.replace(/^\^CNX/, '')}
                       </div>
                       <div className="text-lg font-bold">
                         {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%
                       </div>
                     </div>
                   );
                 });
               })()}
             </div>
          </div>
        </section>

       {/* ───────────────────────── 2. Top Gainers/Losers widget ───────────────────────── */}
      <section className="max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 animate-fade-in-up">
        <div className="flex flex-col md:flex-row gap-4 md:gap-8">
<div className="flex-1 bg-white border border-gray-300 rounded-lg shadow-sm p-4 md:p-5">
             <div className="flex items-center gap-2 mb-3">
               <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--color-text)' }}>▲ TOP 5 GAINERS</span>
             </div>
             <div className="space-y-2">
               {getTopMovers(marketQuotes, 5).gainers.length > 0 ? (
                 getTopMovers(marketQuotes, 5).gainers.map((quote) => (
                   <div key={quote.symbol} className="flex items-center px-2 py-1.5 text-sm font-bold">
                     <span className="flex-1 uppercase" style={{ color: 'var(--color-accent-800)' }}>{quote.name || quote.symbol}</span>
                     <span className="w-[80px] text-right font-bold" style={{ color: 'var(--color-text)' }}>{formatPrice(quote.price)}</span>
                     <span className={`w-[60px] text-right ${quote.changePercent >= 0 ? 'ng-pill-positive' : 'ng-pill-negative'}`}>
                       {formatPercent(quote.changePercent)}
                     </span>
                   </div>
                 ))
               ) : (
                 <p className="text-body font-black uppercase opacity-40 text-center py-4">No gainers data</p>
               )}
             </div>
           </div>
<div className="flex-1 bg-white border border-gray-300 rounded-lg shadow-sm p-4 md:p-5">
             <div className="flex items-center gap-2 mb-3">
               <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--color-text)' }}>▼ TOP 5 LOSERS</span>
             </div>
             <div className="space-y-2">
               {getTopMovers(marketQuotes, 5).losers.length > 0 ? (
                 getTopMovers(marketQuotes, 5).losers.map((quote) => (
                   <div key={quote.symbol} className="flex items-center px-2 py-1.5 text-sm font-bold">
                     <span className="flex-1 uppercase" style={{ color: 'var(--color-accent-800)' }}>{quote.name || quote.symbol}</span>
                     <span className="w-[80px] text-right font-bold" style={{ color: 'var(--color-text)' }}>{formatPrice(quote.price)}</span>
                     <span className={`w-[60px] text-right ${quote.changePercent >= 0 ? 'ng-pill-positive' : 'ng-pill-negative'}`}>
                       {formatPercent(quote.changePercent)}
                     </span>
                   </div>
                 ))
               ) : (
                 <p className="text-body font-black uppercase opacity-40 text-center py-4">No losers data</p>
               )}
             </div>
           </div>
        </div>
        <div className="mt-4 text-center md:text-right">
          <Link
            href="/the-tape#movers"
            className="inline-block text-small font-black uppercase hover:underline transition-colors"
            style={{ color: 'var(--ng-navy-text)' }}
          >
            View All Movers →
          </Link>
        </div>
      </section>

{/* ───────────────────────── 2. Top Gainers/Losers widget ───────────────────────── */}

      {/* ───────────────────────── 2. Featured Story ───────────────────────── */}
      {featuredPost && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <div className="flex items-center gap-3 mb-4">
            <Badge variant="flat">Featured</Badge>
            <h2 className="text-small font-black uppercase tracking-widest opacity-70">Featured Story</h2>
          </div>
          <Link
            href={`/news/${featuredPost.slug}`}
            className="group block card-gold hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[5px_5px_0_#111] transition-all duration-150"
          >
            <div className="p-5 md:p-6">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge variant="flat" className="text-[10px]">{featuredPost.category}</Badge>
                <span className="text-small font-bold uppercase opacity-60 ml-auto">
{formatDate(featuredPost.publishedAt)}
                </span>
              </div>
              <h3 className="text-heading font-black uppercase leading-tight mb-2 group-hover:text-accent-coral transition-colors">
                {featuredPost.title}
              </h3>
              <p className="text-body font-bold opacity-80 leading-relaxed max-w-4xl mb-4">
                {featuredPost.summary}
              </p>
              <div className="flex items-center gap-3">
                <Button variant="primary" size="sm">Read Article</Button>
                <span className="text-small font-black uppercase opacity-60 group-hover:opacity-100 transition-opacity">
                  Full story →
                </span>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* ───────────────────────── 3. Breaking News ───────────────────────── */}
      {breakingPost && (
        <section className="card-coral max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 md:py-6 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-3">
            <Badge variant="breaking">Breaking</Badge>
            <h2 className="text-small font-black uppercase tracking-widest opacity-70">Breaking News</h2>
          </div>
          <Link
            href={`/news/${breakingPost.slug}`}
            className="block card-white p-4 md:p-5 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[5px_5px_0_#111] transition-all duration-100"
          >
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge variant="flat" className="text-[10px]">{breakingPost.category}</Badge>
              <span className="text-small font-bold uppercase opacity-60 ml-auto">
                {formatDate(breakingPost.publishedAt)}
              </span>
            </div>
            <h3 className="text-heading font-black uppercase leading-tight mb-1">
              {breakingPost.title}
            </h3>
            <p className="text-small font-bold opacity-80 leading-relaxed max-w-3xl">
              {breakingPost.summary}
            </p>
          </Link>
        </section>
      )}

{/* ───────────────────────── 4. Latest News ───────────────────────── */}
       {latestNews.length > 0 && (
         <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 section-padding">
           <div className="flex items-center justify-between mb-5">
             <SectionTitle>Latest News</SectionTitle>
             <Link href="/news" className="text-small font-black uppercase hover:underline transition-colors" style={{ color: 'var(--color-accent-700)' }}>
               All News →
             </Link>
           </div>
           <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch ${finalMorningBrief ? "lg:grid-cols-3" : "lg:grid-cols-2"}`}>
             {latestNews.map((post) => (
               <NewsCard
                 key={post.id}
                 title={post.title}
                 slug={post.slug}
                 category={post.category}
                 summary={post.summary}
                 publishedAt={post.publishedAt}
               />
             ))}
           </div>
         </section>
       )}

{/* ───────────────────────── 5. The Tape CTA ───────────────────────── */}
       <section className="border-t border-b border-[var(--color-surface)]">
         <div className="max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
           <div className="flex flex-col md:flex-row">
             {/* Left Panel: Light Text */}
             <div className="flex-1 bg-[var(--color-bg)] flex flex-col items-start justify-center p-6 md:p-8">
               <h1 className="mb-3 text-[28px] font-serif font-semibold text-[var(--color-text)]">
                 Enter <span className="text-[var(--color-accent-700)]">the tape</span>
               </h1>
               <p className="text-[12px] text-[var(--color-neutral-500)] max-w-sm">
                 Real-time market intelligence across NSE, forex, crypto, commodities, and global markets.
               </p>
               <Link
                 href="/the-tape"
                 className="mt-6 inline-block btn-hero-cyan px-5 py-2.5 font-black uppercase text-[11px] tracking-wide hover:bg-accent-600 hover:text-white transition-colors"
               >
                 Launch The Tape
               </Link>
             </div>
             
{/* Right Panel: Cassette Photo */}
              <div className="flex-1 bg-[url('/images/hero-cassette.jpg')] bg-contain bg-center bg-no-repeat bg-[#020608]">
              </div>
           </div>
         </div>
       </section>

      {/* ───────────────────────── 6. Newsletter ───────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 section-padding">
        <NewsletterSignup />
      </section>

      {/* ───────────────────────── 7. Educational Disclaimer ───────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="flex items-center gap-3 mb-3">
          <span className="rounded-lg p-2" style={{ background: 'var(--color-surface)', borderLeft: '4px solid var(--color-accent-700)' }}>
            <svg className="w-5 h-5 text-[var(--color-text)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path className="stroke-width-2" d="M12 19l9 9l-9 9M21 10c0 7-7 11-7 11S5 17 5 10S13 3 13 3zm-9 9c-4.3 0-7.7-2.7-9.1-6h18.2c-1.4 3.3-4.8 6-9.1 6zm9.1-12.7c-2.2 2.2-5.1 3.3-7.9 3.3s-5.7-1.1-7.9-3.3" strokeWidth={1.5} transform="translate(-1400 1200) rotate(-45)"/></svg>
          </span>
          <h3 className="text-heading font-black uppercase mb-2" style={{ color: 'var(--color-text)' }}>⚠ Educational Disclaimer</h3>
        </div>
        <p className="text-body font-bold leading-relaxed" style={{ color: 'var(--color-text)' }}>
          TradersTape is for educational purposes only. Nothing on this site is financial advice.
          Always conduct your own research and consult with a licensed financial advisor before
          making investment decisions. Trading involves substantial risk of loss.
        </p>
      </section>
    </div>
  );
}

// Helper function to parse AI response into MorningBriefData format
function parseAIResponseToMorningBrief(content: string): MorningBriefData {
  // Default return value
  const defaultResponse = {
    sentiment: "Neutral",
    confidence: 75,
    focusPoints: ["Market data unavailable"],
    globalOverview: {
      us: "Neutral",
      europe: "Neutral",
      asia: "Neutral",
    },
    riskEvents: [
      { level: "Medium" as const, title: "Data Unavailable", description: "Unable to fetch market data" }
    ],
    summary: "Market data is currently unavailable. Please check back later for updates."
  };

  try {
    // Parse the structured response from the AI
    const lines = content.split('\n').map(line => line.trim());
    
    // Initialize variables to hold parsed data
    let sentiment = "Neutral";
    let confidence = 75;
    const focusPoints: string[] = [];
    const globalOverview = { us: "Neutral", europe: "Neutral", asia: "Neutral" };
    const riskEvents: Array<{ level: "High" | "Medium" | "Low"; title: string; description: string }> = [];
    let summary = "Market data is currently unavailable. Please check back later for updates.";
    
    let currentSection = "";
    
    for (const line of lines) {
      if (!line) continue;
      
      // Detect section headers
      if (line.startsWith("MARKET SENTIMENT")) {
        currentSection = "sentiment";
        continue;
      } else if (line.startsWith("AI CONFIDENCE")) {
        currentSection = "confidence";
        continue;
      } else if (line.startsWith("TODAY'S FOCUS")) {
        currentSection = "focus";
        continue;
      } else if (line.startsWith("GLOBAL OVERVIEW")) {
        currentSection = "global";
        continue;
      } else if (line.startsWith("RISK EVENTS")) {
        currentSection = "risk";
        continue;
      } else if (line.startsWith("AI SUMMARY")) {
        currentSection = "summary";
        continue;
      }
      
      // Process content based on current section
      switch (currentSection) {
        case "sentiment":
          if (line.includes("Bullish")) sentiment = "Bullish";
          else if (line.includes("Bearish")) sentiment = "Bearish";
          else sentiment = "Neutral";
          break;
          
        case "confidence":
          const confidenceMatch = line.match(/\d+/);
          if (confidenceMatch) {
            const parsedConfidence = parseInt(confidenceMatch[0], 10);
            if (!isNaN(parsedConfidence) && parsedConfidence >= 0 && parsedConfidence <= 100) {
              confidence = parsedConfidence;
            }
          }
          break;
          
        case "focus":
          if (line.startsWith("•") || line.startsWith("-") || line.startsWith("*")) {
            const cleanLine = line.substring(1).trim();
            if (cleanLine) focusPoints.push(cleanLine);
          }
          break;
          
        case "global":
          if (line.includes("US Markets:")) {
            globalOverview.us = line.split("US Markets:")[1].trim() || "Neutral";
          } else if (line.includes("Europe:")) {
            globalOverview.europe = line.split("Europe:")[1].trim() || "Neutral";
          } else if (line.includes("Asia:")) {
            globalOverview.asia = line.split("Asia:")[1].trim() || "Neutral";
          }
          break;
          
        case "risk":
          if (line.includes("High:") || line.includes("Medium:") || line.includes("Low:")) {
            let level: "High" | "Medium" | "Low" = "Medium";
            let title = "";
            let description = "";
            
            if (line.includes("High:")) {
              level = "High";
              const parts = line.split("High:");
              if (parts.length > 1) {
                const rest = parts[1].trim();
                const descParts = rest.split(":");
                if (descParts.length > 1) {
                  title = descParts[0].trim();
                  description = descParts.slice(1).join(":").trim();
                } else {
                  title = rest;
                }
              }
            } else if (line.includes("Medium:")) {
              level = "Medium";
              const parts = line.split("Medium:");
              if (parts.length > 1) {
                const rest = parts[1].trim();
                const descParts = rest.split(":");
                if (descParts.length > 1) {
                  title = descParts[0].trim();
                  description = descParts.slice(1).join(":").trim();
                } else {
                  title = rest;
                }
              }
            } else if (line.includes("Low:")) {
              level = "Low";
              const parts = line.split("Low:");
              if (parts.length > 1) {
                const rest = parts[1].trim();
                const descParts = rest.split(":");
                if (descParts.length > 1) {
                  title = descParts[0].trim();
                  description = descParts.slice(1).join(":").trim();
                } else {
                  title = rest;
                }
              }
            }
            
            if (title) {
              const desc = description || 'No description provided';
              riskEvents.push({ level, title, description: desc });
            }
          }
          break;
          
        case "summary":
          if (line && !line.startsWith("AI SUMMARY")) {
            // Accumulate summary lines
            if (summary === "Market data is currently unavailable. Please check back later for updates.") {
              summary = line;
            } else {
              summary += " " + line;
            }
          }
          break;
      }
    }
    
    // Validate and return the parsed data
    return {
      sentiment,
      confidence,
      focusPoints: focusPoints.length > 0 ? focusPoints : ["Market data unavailable"],
      globalOverview,
      riskEvents: riskEvents.length > 0 ? riskEvents : [{ level: "Medium", title: "Data Unavailable", description: "Unable to parse risk events" }],
      summary: summary || "Market data is currently unavailable. Please check back later for updates."
    };
  } catch (error) {
    console.error("Error parsing AI response:", error);
    return defaultResponse;
  }
}