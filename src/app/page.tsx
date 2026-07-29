import React from "react";
import { getPublishedNewsPosts, getLatestTapeView } from "@/lib/db-raw";
import { SectionTitle, Badge, NewsCard } from "@/components/ui";
import Link from "next/link";
import NewsletterSignup from "@/components/home/NewsletterSignup";

export const dynamic = "force-dynamic";

/* ───────────────────────── Placeholder ticker data ───────────────────────── */
const MARKET_ITEMS = [
  { symbol: "NIFTY", price: "24,180.50", change: "+0.42%", dir: "up" as const },
  { symbol: "BANKNIFTY", price: "52,340.10", change: "-0.28%", dir: "down" as const },
  { symbol: "SENSEX", price: "79,450.20", change: "-0.15%", dir: "down" as const },
  { symbol: "GOLD", price: "₹72,300", change: "+0.55%", dir: "up" as const },
  { symbol: "BTC", price: "$67,250", change: "+1.82%", dir: "up" as const },
  { symbol: "ETH", price: "$3,510", change: "-0.35%", dir: "flat" as const },
  { symbol: "USD/INR", price: "83.42", change: "+0.08%", dir: "flat" as const },
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

/* ───────────────────────── Market focus points ───────────────────────── */
const MARKET_FOCUS = [
  "Nifty consolidates near 24,200 ahead of weekly expiry",
  "Banking index underperforms; IT stocks show resilience",
  "USD/INR holds 83.40 as RBI maintains status quo",
  "Gold extends gains on geopolitical uncertainty",
  "Crude oil steadies after OPEC+ output comments",
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

      {/* ───────────────────────── 1. Hero Dashboard ───────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

          {/* ── Card 1: Today's Market Brief ── */}
          <div className="brutal-card brutal-shadow p-5 border-ink flex flex-col min-h-[240px]">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-black uppercase tracking-tight">Today's Market Brief</h2>
              <Badge variant="flat" className="text-[10px]">Live</Badge>
            </div>
            <p className="text-sm font-bold leading-relaxed opacity-80 mb-3 line-clamp-3">
              Indian equity markets opened on a mixed note with the Nifty hovering near the 24,200 mark.
              Banking stocks faced selling pressure while IT and pharma sectors showed resilience.
              Global cues remain cautious ahead of key economic data releases.
            </p>
            <div className="mt-auto">
              <p className="text-[11px] font-black uppercase opacity-50 mb-2">Key Focus</p>
              <ul className="space-y-1">
                {MARKET_FOCUS.slice(0, 3).map((point, i) => (
                  <li key={i} className="text-[11px] font-bold leading-tight opacity-70 flex items-start gap-1.5">
                    <span className="text-accent-coral mt-0.5 shrink-0">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-[10px] font-black uppercase opacity-40 mt-2">
              Updated: {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>

          {/* ── Card 2: Market Snapshot ── */}
          <div className="brutal-card brutal-shadow p-5 border-ink flex flex-col min-h-[240px]">
            <h2 className="text-lg font-black uppercase tracking-tight mb-3">Market Snapshot</h2>
            <div className="flex-1 grid grid-cols-1 gap-1.5">
              {MARKET_ITEMS.map((item) => (
                <div
                  key={item.symbol}
                  className="flex items-center justify-between px-2 py-1 rounded hover:bg-black/5 transition-colors"
                >
                  <span className="text-xs font-black uppercase tracking-wide">{item.symbol}</span>
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm font-bold tabular-nums">{item.price}</span>
                    <span className={`text-[11px] font-black flex items-center gap-0.5 w-[70px] justify-end ${dirColor[item.dir]}`}>
                      <span>{dirArrow[item.dir]}</span>
                      <span>{item.change}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Card 3: Featured Tape View ── */}
          {latestTapeView ? (
            <Link
              href={`/tape-views/${latestTapeView.slug}`}
              className="brutal-card brutal-shadow p-5 border-ink flex flex-col min-h-[240px] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[5px_5px_0_#111] transition-all duration-100"
            >
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="default" className="text-[10px]">{latestTapeView.category}</Badge>
                <span className="text-[11px] font-black uppercase opacity-60">{latestTapeView.instrument}</span>
                <Badge
                  variant={latestTapeView.bias === "BULLISH" ? "up" : latestTapeView.bias === "BEARISH" ? "flat" : "default"}
                  className="text-[10px] ml-auto"
                >
                  {latestTapeView.bias}
                </Badge>
              </div>
              <h3 className="text-base font-black uppercase leading-tight mb-2 line-clamp-2">
                {latestTapeView.title}
              </h3>
              <p className="text-xs font-bold leading-relaxed opacity-70 line-clamp-3 flex-1">
                {latestTapeView.todayView}
              </p>
              <div className="mt-3">
                <span className="inline-block bg-ink text-bg brutal-border px-3.5 py-1.5 font-black uppercase text-[11px] tracking-wide hover:bg-accent-coral hover:text-white transition-colors">
                  Read Analysis →
                </span>
              </div>
            </Link>
          ) : (
            <div className="brutal-card brutal-shadow p-5 border-ink flex flex-col min-h-[240px] items-center justify-center">
              <p className="text-sm font-black uppercase opacity-40 text-center">No analysis available</p>
            </div>
          )}

        </div>
      </section>

      {/* ───────────────────────── 2. Breaking News ───────────────────────── */}
      {breakingPost && (
        <section className="bg-accent-coral/10 brutal-border-t border-t-3 border-ink brutal-border-b border-b-3 border-ink">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
            <div className="flex items-center gap-3 mb-3">
              <Badge variant="down">Breaking</Badge>
              <h2 className="text-xs font-black uppercase tracking-widest opacity-70">
                Breaking News
              </h2>
            </div>
            <Link
              href={`/news/${breakingPost.slug}`}
              className="block brutal-card brutal-shadow p-5 md:p-6 bg-bg border-accent-coral hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[5px_5px_0_#111] transition-all duration-100"
            >
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge variant="default" className="text-[10px]">{breakingPost.category}</Badge>
                <span className="text-[11px] font-bold uppercase opacity-60 ml-auto">
                  {formatDate(breakingPost.publishedAt)}
                </span>
              </div>
              <h3 className="text-xl md:text-2xl font-black uppercase leading-tight mb-2">
                {breakingPost.title}
              </h3>
              <p className="text-sm font-bold opacity-80 leading-relaxed max-w-3xl mb-3">
                {breakingPost.summary}
              </p>
              <span className="text-[11px] font-black uppercase opacity-60 hover:opacity-100 transition-opacity">
                Read full story →
              </span>
            </Link>
          </div>
        </section>
      )}

      {/* ───────────────────────── 3. Featured Story ───────────────────────── */}
      {featuredPost && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <div className="flex items-center gap-3 mb-3">
            <Badge variant="flat">Featured</Badge>
            <h2 className="text-xs font-black uppercase tracking-widest opacity-70">
              Featured Story
            </h2>
          </div>
          <Link
            href={`/news/${featuredPost.slug}`}
            className="block brutal-card brutal-shadow p-5 md:p-6 bg-accent-yellow/20 border-accent-yellow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[5px_5px_0_#111] transition-all duration-100"
          >
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge variant="default" className="text-[10px]">{featuredPost.category}</Badge>
              <span className="text-[11px] font-bold uppercase opacity-60 ml-auto">
                {formatDate(featuredPost.publishedAt)}
              </span>
            </div>
            <h3 className="text-xl md:text-2xl font-black uppercase leading-tight mb-2">
              {featuredPost.title}
            </h3>
            <p className="text-sm font-bold opacity-80 leading-relaxed max-w-3xl mb-3">
              {featuredPost.summary}
            </p>
            <span className="text-[11px] font-black uppercase opacity-60 hover:opacity-100 transition-opacity">
              Read full story →
            </span>
          </Link>
        </section>
      )}

      {/* ───────────────────────── 4. Latest News ───────────────────────── */}
      {latestNews.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <div className="flex items-center justify-between mb-5">
            <SectionTitle>Latest News</SectionTitle>
            <Link href="/news" className="text-sm font-black uppercase underline hover:text-accent-coral">
              All News →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
      <section className="bg-ink text-bg brutal-border-t border-t-3 border-ink brutal-border-b border-b-3 border-ink py-10 md:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-4xl font-black uppercase leading-tight mb-3">
            Enter <span className="text-accent-coral">The Tape</span>
          </h2>
          <p className="text-sm md:text-base font-bold max-w-2xl mx-auto mb-6 opacity-80">
            Real-time market intelligence across NSE, forex, crypto, commodities, and global markets.
            One dashboard. Total clarity.
          </p>
          <Link
            href="/the-tape"
            className="inline-block bg-accent-coral text-white brutal-border brutal-shadow px-6 py-3 font-black uppercase text-sm tracking-wide hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0_#fff] transition-all duration-100"
          >
            🚀 Launch The Tape
          </Link>
        </div>
      </section>

      {/* ───────────────────────── 6. Newsletter ───────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        <NewsletterSignup />
      </section>

      {/* ───────────────────────── 7. Educational Disclaimer ───────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="bg-accent-pink brutal-border brutal-shadow p-5 md:p-6">
          <h3 className="text-lg md:text-xl font-black uppercase mb-2">⚠ Educational Disclaimer</h3>
          <p className="text-sm font-bold leading-relaxed">
            TradersTape is for educational purposes only. Nothing on this site is financial advice.
            Always conduct your own research and consult with a licensed financial advisor before
            making investment decisions. Trading involves substantial risk of loss.
          </p>
        </div>
      </section>
    </div>
  );
}