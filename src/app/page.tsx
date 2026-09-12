import React from "react";
import { getPublishedNewsPosts, getLatestTapeView, getLatestPublishedMorningBrief, getTrendingCategories } from "@/lib/db-raw";
import { getMarketQuotes } from "@/lib/market/service";
import { formatPrice, formatPercent, getTopMovers } from "@/lib/market/utils";
import { generateAiContent } from "@/lib/ai/service";
import { getKvNamespace } from "@/lib/rate-limit";
import type { MorningBriefContext } from "@/lib/ai/types";
import { SectionTitle, Badge, NewsCard, Button } from "@/components/ui";
import { MarketCard } from "@/components/the-tape/MarketCard";
import { MorningMarketBriefCard } from "@/components/ai/MorningMarketBriefCard";
import { LiveMarketTicker } from "@/components/markets/LiveTicker";
import { useMarketTicker } from "@/hooks/useMarketTicker";
import Link from "next/link";
import NewsletterSignup from "@/components/home/NewsletterSignup";

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

  // Filter market quotes for Indian indices and global indices
  const indian = marketQuotes.filter((q) =>
    ["^NSEI", "^NSEBANK", "^BSESN", "^INDIAVIX", "RELIANCE.NS"].includes(q.symbol)
  );
  const global = marketQuotes.filter((q) =>
    ["^GSPC", "^IXIC", "^DJI", "^N225", "^FTSE", "^GDAXI", "^HSI", "GOLD", "BTC"].includes(q.symbol)
  );

  console.log("[HOME PAGE] latestTapeView:", JSON.stringify(latestTapeView));
  console.log("[HOME PAGE] global quotes:", global.map(q => q.symbol));

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
           <div className="ng-card p-5 flex flex-col gap-0 h-full">
             <div className="flex items-center justify-between mb-3">
               <Badge variant="live" className="ng-pill-navy text-[10px]">LIVE</Badge>
               <h3 className="text-card-title font-black uppercase tracking-tight ml-auto">Market Snapshot</h3>
             </div>
             {indian.slice(0, 5).map((quote) => (
               <div key={quote.symbol} className="flex items-center justify-between border-b border-ink/10 py-2 last:border-0">
                 <span className="text-small font-black uppercase opacity-60 tracking-wide" style={{ color: 'var(--ng-navy-text)' }}>{quote.symbol.replace(/^\^/, "").replace(".NS", "")}</span>
                 <div className="text-right">
                   <span className="text-card-title font-black tabular-nums mr-2" style={{ color: 'var(--ng-navy-text)' }}>{formatPrice(quote.price)}</span>
                   <span className={`text-small font-bold tabular-nums ${quote.change >= 0 ? "ng-pill-positive" : "ng-pill-negative"}`}>
                     {quote.change >= 0 ? "+" : ""}{quote.changePercent?.toFixed(2)}%
                   </span>
                 </div>
               </div>
             ))}
           </div>

          {/* ── Card 3: Featured Tape View ── */}
          {latestTapeView ? (
            <Link
              href={`/tape-views/${latestTapeView.slug}`}
              className="ng-card overflow-hidden flex flex-col min-h-[220px] h-full hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[5px_5px_0_#111] transition-all duration-100"
            >
              {/* Navy header strip with badges */}
              <div className="flex items-center gap-2 px-3.5 py-2.5" style={{ background: 'var(--ng-navy)' }}>
                <Badge variant="flat" className="ng-pill-gold text-[10px]">{latestTapeView.category}</Badge>
                <span className="text-small font-black uppercase opacity-60" style={{ color: 'var(--ng-gold-on-navy)' }}>{latestTapeView.instrument}</span>
                <Badge
                  variant={latestTapeView.bias === "BULLISH" ? "bullish" : latestTapeView.bias === "BEARISH" ? "bearish" : "neutral"}
                  className={latestTapeView.bias === "BULLISH" ? "ng-pill-positive"
                                  : latestTapeView.bias === "BEARISH" ? "ng-pill-negative"
                                  : "ng-pill-neutral"}
                >
                  {latestTapeView.bias}
                </Badge>
              </div>

              {/* White body content */}
              <div className="p-3.5 flex flex-col flex-1">
                <div className="mb-3">
                  <div className="grid grid-cols-2 gap-2">
                    {global.map((quote) => (
                      <div key={quote.symbol} className="flex items-center justify-between">
                        <span className="text-[11px] font-black uppercase truncate pr-2" style={{ color: 'var(--ng-navy-text)' }}>
                          {quote.symbol.replace(/^\^/, "")}
                        </span>
                        <span className="text-[11px] font-black tabular-nums" style={{ color: 'var(--ng-navy-text)' }}>
                          {formatPrice(quote.price)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <h3 className="text-card-title font-black uppercase leading-tight mb-2 line-clamp-2" style={{ color: 'var(--ng-navy-text)' }}>
                  {latestTapeView.title}
                </h3>
                <p className="text-small font-bold leading-relaxed line-clamp-3 flex-1" style={{ color: 'var(--text-muted)' }}>
                  {latestTapeView.todayView}
                </p>
                <div className="mt-3">
                  <span className="inline-block ng-btn-gold text-bg px-3.5 py-1.5 font-black uppercase text-[11px] tracking-wide hover:bg-accent-coral hover:text-white transition-colors">
                    Read Analysis →
                  </span>
                </div>
              </div>
            </Link>
          ) : (
            <div className="card-white p-5 flex flex-col min-h-[120px] items-center justify-center">
              <p className="text-body font-black uppercase opacity-40 text-center">No analysis available</p>
            </div>
          )}
        </div>
      </section>

      {/* ───────────────────────── 2. Top Gainers/Losers widget ───────────────────────── */}
      <section className="max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 animate-fade-in-up">
        <div className="flex flex-col md:flex-row gap-4 md:gap-8">
          <div className="flex-1 ng-card p-4 md:p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--ng-positive)' }}>▲ TOP 5 GAINERS</span>
            </div>
            <div className="space-y-2">
              {getTopMovers(marketQuotes, 5).gainers.length > 0 ? (
                getTopMovers(marketQuotes, 5).gainers.map((quote) => (
                  <div key={quote.symbol} className="flex items-center justify-between px-2 py-1.5 text-sm font-bold">
                    <span className="uppercase" style={{ color: 'var(--ng-navy-text)' }}>{quote.name || quote.symbol}</span>
                    <span className="ng-pill-positive">{formatPercent(quote.changePercent)}</span>
                  </div>
                ))
              ) : (
                <p className="text-body font-black uppercase opacity-40 text-center py-4">No gainers data</p>
              )}
            </div>
          </div>
          <div className="flex-1 ng-card p-4 md:p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--ng-negative)' }}>▼ TOP 5 LOSERS</span>
            </div>
            <div className="space-y-2">
              {getTopMovers(marketQuotes, 5).losers.length > 0 ? (
                getTopMovers(marketQuotes, 5).losers.map((quote) => (
                  <div key={quote.symbol} className="flex items-center justify-between px-2 py-1.5 text-sm font-bold">
                    <span className="uppercase" style={{ color: 'var(--ng-navy-text)' }}>{quote.name || quote.symbol}</span>
                    <span className="ng-pill-negative">{formatPercent(quote.changePercent)}</span>
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

      {/* Market Breadth strip */}
      <section className="max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-2 animate-fade-in-up">
        <div className="ng-card p-3 md:p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-6">
            <div className="flex flex-wrap items-center gap-3 font-black text-sm">
              <span style={{ color: 'var(--ng-positive)' }}>{marketQuotes.filter(q => q.direction === "up").length} Advancing</span>
              <span className="text-ink/40">/</span>
              <span style={{ color: 'var(--ng-negative)' }}>{marketQuotes.filter(q => q.direction === "down").length} Declining</span>
              <span className="text-ink/40">/</span>
              <span style={{ color: 'var(--ng-navy-text)' }}>{marketQuotes.filter(q => q.direction === "flat").length} Unchanged</span>
            </div>
            <div className="w-full md:w-1/2 h-2 bg-ink/10 rounded-full overflow-hidden">
              {(() => {
                const advancing = marketQuotes.filter(q => q.direction === "up").length;
                const declining = marketQuotes.filter(q => q.direction === "down").length;
                const total = advancing + declining;
                const advancingPct = total > 0 ? (advancing / total) * 100 : 0;
                return (
                  <div className="h-full flex">
                    <div style={{ background: 'var(--ng-positive)', width: `${advancingPct}%` }} />
                    <div style={{ background: 'var(--ng-negative)', width: `${100 - advancingPct}%` }} />
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────────── Trending Topics ───────────────────────── */}
      {trendingCategories.length > 0 && (
        <section className="max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-2 animate-fade-in-up">
          <div className="ng-card p-3 md:p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-6">
              <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--ng-navy-text)' }}>Trending</span>
              <div className="flex flex-wrap items-center gap-2">
                {trendingCategories.slice(0, 4).map((item, i) => (
                  <Badge key={item.category} variant="flat" className={i % 2 === 0 ? "ng-pill-gold" : "ng-pill-navy"}>
                    {item.category} ({item.count})
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

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
            <Link href="/news" className="text-small font-black uppercase hover:text-accent-coral">
              All News →
            </Link>
          </div>
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${finalMorningBrief ? "lg:grid-cols-3" : "lg:grid-cols-2"}`}>
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
      <section className="bg-ink text-bg border-t-[3px] border-ink border-b-[3px] border-ink">
        <div className="max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 text-center">
          <h2 className="text-display font-black uppercase leading-tight mb-2">
            Enter <span className="text-accent-coral">The Tape</span>
          </h2>
          <p className="text-body font-bold max-w-2xl mx-auto mb-5 opacity-80">
            Real-time market intelligence across NSE, forex, crypto, commodities, and global markets.
          </p>
          <Link
            href="/the-tape"
            className="inline-block bg-accent-coral text-white brutal-border brutal-shadow px-6 py-3 font-black uppercase text-small tracking-wide hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0_#fff] transition-all duration-150"
          >
            🚀 Launch The Tape
          </Link>
        </div>
      </section>

      {/* ───────────────────────── 6. Newsletter ───────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 section-padding">
        <NewsletterSignup />
      </section>

      {/* ───────────────────────── 7. Educational Disclaimer ───────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="card-coral brutal-border brutal-shadow p-5 md:p-6">
          <h3 className="text-heading font-black uppercase mb-2">⚠ Educational Disclaimer</h3>
          <p className="text-body font-bold leading-relaxed">
            TradersTape is for educational purposes only. Nothing on this site is financial advice.
            Always conduct your own research and consult with a licensed financial advisor before
            making investment decisions. Trading involves substantial risk of loss.
          </p>
        </div>
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