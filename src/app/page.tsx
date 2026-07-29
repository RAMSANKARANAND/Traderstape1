import React from "react";
import { getPublishedNewsPosts, getLatestTapeView } from "@/lib/db-raw";
import { SectionTitle, Badge, NewsCard } from "@/components/ui";
import Link from "next/link";
import NewsletterSignup from "@/components/home/NewsletterSignup";

export const dynamic = "force-dynamic";

/* ───────────────────────── Placeholder ticker data ───────────────────────── */
const TICKER_ITEMS = [
  { symbol: "NIFTY", price: "24,180.50", dir: "up" as const },
  { symbol: "BANKNIFTY", price: "52,340.10", dir: "down" as const },
  { symbol: "USD/INR", price: "83.42", dir: "flat" as const },
  { symbol: "BTC", price: "$67,250", dir: "up" as const },
  { symbol: "GOLD", price: "₹72,300", dir: "up" as const },
  { symbol: "SENSEX", price: "79,450.20", dir: "down" as const },
  { symbol: "ETH", price: "$3,510", dir: "flat" as const },
  { symbol: "INDIA VIX", price: "13.85", dir: "down" as const },
];

const dirColor: Record<"up" | "down" | "flat", string> = {
  up: "text-[#2E8B57]",
  down: "text-[#D94B45]",
  flat: "text-[#6B7280]",
};
const dirArrow: Record<"up" | "down" | "flat", string> = {
  up: "▲",
  down: "▼",
  flat: "•",
};

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
  const [newsPosts, latestTapeView] = await Promise.all([
    getPublishedNewsPosts({ take: 8 }),
    getLatestTapeView(),
  ]);

  // Partition news by editorial flags (deterministic, single query).
  const breakingPost = newsPosts.find((p) => p.isBreaking) ?? null;
  const featuredPost = newsPosts.find((p) => p.isFeatured && p.id !== breakingPost?.id) ?? null;

  const heroIds = [breakingPost?.id, featuredPost?.id].filter(Boolean) as string[];
  const latestNews = heroIds.length
    ? newsPosts.filter((p) => !heroIds.includes(p.id))
    : newsPosts;

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "TradersTape",
    description: "Market-watching site covering stock F&O levels, forex levels, and geopolitical trading news for educational purposes.",
    url: "https://traderstape.com",
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />

       {/* ───────────────────────── 1. Live Market Ticker ───────────────────────── */}
       <div className="relative bg-[#111317] text-white brutal-border-b border-b-[4px] border-black overflow-hidden py-1.5">
          {/* Subtle Financial Grid Texture */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-[0.03]" 
            style={{ 
              backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`, 
              backgroundSize: '40px 40px' 
            }} 
          />
          
          <div className="relative flex ticker-track whitespace-nowrap items-center">
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
              <React.Fragment key={`${item.symbol}-${i}`}>
                <div className="inline-flex items-center gap-3 mx-5">
                  <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                    {item.symbol}
                  </span>
                  <span className="text-sm font-bold text-white tabular-nums">
                    {item.price}
                  </span>
                  <span className={`text-xs font-bold flex items-center gap-1 ${dirColor[item.dir]}`}>
                    {dirArrow[item.dir]} 
                    {item.dir === 'up' ? '+' : ''}{Math.abs(parseFloat(item.price.replace(/[^0-9.-]+/g, ""))).toFixed(2)}%
                  </span>
                </div>
                {/* Vertical Separator */}
                <div className="h-4 w-[1px] bg-[#2A2A2A]" />
              </React.Fragment>
            ))}
          </div>
        </div>

      {/* ───────────────────────── 2. Breaking News Hero ───────────────────────── */}
      {breakingPost && (
        <section className="bg-accent-coral/10 brutal-border-b border-b-3 border-ink">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
            <div className="flex items-center gap-3 mb-5">
              <Badge variant="down">Breaking</Badge>
              <h2 className="text-sm font-black uppercase tracking-widest opacity-70">
                Breaking News
              </h2>
            </div>
            <Link
              href={`/news/${breakingPost.slug}`}
              className="block brutal-card brutal-shadow p-6 md:p-10 bg-bg border-accent-coral hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[6px_6px_0_#111] transition-all duration-100"
            >
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <Badge variant="default">{breakingPost.category}</Badge>
                <span className="text-xs font-bold uppercase opacity-60 ml-auto">
                  {formatDate(breakingPost.publishedAt)}
                </span>
              </div>
              <h3 className="text-2xl md:text-4xl font-black uppercase leading-tight mb-3">
                {breakingPost.title}
              </h3>
              <p className="text-sm md:text-base font-bold opacity-80 leading-relaxed max-w-3xl mb-4">
                {breakingPost.summary}
              </p>
              <span className="text-xs font-black uppercase opacity-60 hover:opacity-100 transition-opacity">
                Read full story →
              </span>
            </Link>
          </div>
        </section>
      )}

      {/* ───────────────────────── 3. Featured Story ───────────────────────── */}
      {featuredPost && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <div className="flex items-center gap-3 mb-5">
            <Badge variant="flat">Featured</Badge>
            <h2 className="text-sm font-black uppercase tracking-widest opacity-70">
              Featured Story
            </h2>
          </div>
          <Link
            href={`/news/${featuredPost.slug}`}
            className="block brutal-card brutal-shadow p-6 md:p-10 bg-accent-yellow/20 border-accent-yellow hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[6px_6px_0_#111] transition-all duration-100"
          >
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Badge variant="default">{featuredPost.category}</Badge>
              <span className="text-xs font-bold uppercase opacity-60 ml-auto">
                {formatDate(featuredPost.publishedAt)}
              </span>
            </div>
            <h3 className="text-2xl md:text-3xl font-black uppercase leading-tight mb-3">
              {featuredPost.title}
            </h3>
            <p className="text-sm md:text-base font-bold opacity-80 leading-relaxed max-w-3xl mb-4">
              {featuredPost.summary}
            </p>
            <span className="text-xs font-black uppercase opacity-60 hover:opacity-100 transition-opacity">
              Read full story →
            </span>
          </Link>
        </section>
      )}

      {/* ───────────────────────── 4. Latest Tape View ───────────────────────── */}
      {latestTapeView && (
        <section className="bg-accent-blue brutal-border-t border-t-3 border-ink brutal-border-b border-b-3 border-ink py-10 md:py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-5">
              <SectionTitle>Latest Tape View</SectionTitle>
              <Link
                href="/tape-views"
                className="text-sm font-black uppercase underline hover:text-accent-coral"
              >
                All Views →
              </Link>
            </div>
            <Link
              href={`/tape-views/${latestTapeView.slug}`}
              className="block brutal-card brutal-shadow p-6 md:p-10 bg-bg hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[6px_6px_0_#111] transition-all duration-100"
            >
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <Badge variant="default">{latestTapeView.category}</Badge>
                <span className="text-sm font-black uppercase">{latestTapeView.instrument}</span>
                <Badge
                  variant={
                    latestTapeView.bias === "BULLISH"
                      ? "up"
                      : latestTapeView.bias === "BEARISH"
                      ? "flat"
                      : "default"
                  }
                >
                  {latestTapeView.bias}
                </Badge>
                <span className="text-xs font-bold uppercase opacity-60 ml-auto">
                  {formatDate(latestTapeView.publishedAt)}
                </span>
              </div>
              <h3 className="text-2xl md:text-3xl font-black uppercase leading-tight mb-3">
                {latestTapeView.title}
              </h3>
              <p className="text-sm md:text-base font-bold opacity-80 leading-relaxed max-w-3xl mb-5 line-clamp-3">
                {latestTapeView.todayView}
              </p>
              <span className="inline-block bg-ink text-bg brutal-border px-5 py-2.5 font-black uppercase text-xs tracking-wide hover:bg-accent-coral hover:text-white transition-colors">
                Read Analysis →
              </span>
            </Link>
          </div>
        </section>
      )}

      {/* ───────────────────────── 5. Latest News ───────────────────────── */}
      {latestNews.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <div className="flex items-center justify-between mb-8">
            <SectionTitle>Latest News</SectionTitle>
            <Link href="/news" className="text-sm font-black uppercase underline hover:text-accent-coral">
              All News →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

      {/* ───────────────────────── 6. The Tape CTA ───────────────────────── */}
      <section className="bg-ink text-bg brutal-border-t border-t-3 border-ink brutal-border-b border-b-3 border-ink py-14 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-black uppercase leading-tight mb-4">
            Enter <span className="text-accent-coral">The Tape</span>
          </h2>
          <p className="text-base md:text-lg font-bold max-w-2xl mx-auto mb-8 opacity-80">
            Real-time market intelligence across NSE, forex, crypto, commodities, and global markets.
            One dashboard. Total clarity.
          </p>
          <Link
            href="/the-tape"
            className="inline-block bg-accent-coral text-white brutal-border brutal-shadow px-8 py-3.5 font-black uppercase tracking-wide hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[4px_4px_0_#fff] transition-all duration-100"
          >
            🚀 Launch The Tape
          </Link>
        </div>
      </section>

       {/* ───────────────────────── 7. Newsletter ───────────────────────── */}
       <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
         <NewsletterSignup />
       </section>

      {/* ───────────────────────── 8. Educational Disclaimer ───────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
        <div className="bg-accent-pink brutal-border brutal-shadow p-6 md:p-8">
          <h3 className="text-xl md:text-2xl font-black uppercase mb-3">⚠ Educational Disclaimer</h3>
          <p className="text-sm md:text-base font-bold leading-relaxed">
            TradersTape is for educational purposes only. Nothing on this site is financial advice.
            Always conduct your own research and consult with a licensed financial advisor before
            making investment decisions. Trading involves substantial risk of loss.
          </p>
        </div>
      </section>
    </div>
  );
}