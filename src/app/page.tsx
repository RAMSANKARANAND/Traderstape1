import React from "react";
import { getPublishedNewsPosts, getLatestTapeView } from "@/lib/db-raw";
import { getMarketQuotes } from "@/lib/market/service";
import { SectionTitle, Badge, NewsCard, Button } from "@/components/ui";
import { MarketCard } from "@/components/the-tape/MarketCard";
import Link from "next/link";
import NewsletterSignup from "@/components/home/NewsletterSignup";

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
  const [newsPosts, latestTapeView, marketQuotes] = await Promise.all([
    getPublishedNewsPosts({ take: 8 }),
    getLatestTapeView(),
    getMarketQuotes(),
  ]);

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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2 animate-fade-in-up">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

          {/* ── Card 1: AI Market Brief ── */}
          <div className="brutal-card brutal-shadow p-5 border-ink flex flex-col min-h-[220px]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Badge variant="ai" className="text-[10px]">AI</Badge>
                <h2 className="text-card-title font-black uppercase tracking-tight">Market Brief</h2>
              </div>
              <span className="text-[10px] font-black uppercase opacity-50">Confidence 78%</span>
            </div>
            <p className="text-small font-bold leading-relaxed opacity-80 mb-3 line-clamp-3">
              Indian equity markets opened mixed; Nifty near 24,200. Banking sold off, IT/pharma held up. Global cues cautious.
            </p>
            <div className="mt-auto">
              <p className="text-small font-black uppercase opacity-50 mb-1.5">Key Focus</p>
              <ul className="space-y-1">
                {MARKET_FOCUS.map((point, i) => (
                  <li key={i} className="text-small font-bold leading-tight opacity-70 flex items-start gap-1.5">
                    <span className="text-accent-coral mt-0.5 shrink-0">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-[10px] font-black uppercase opacity-40">
                Updated: {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
              </span>
              <Button variant="secondary" size="sm" href="#brief">Read Brief</Button>
            </div>
          </div>

          {/* ── Card 2: Market Snapshot ── */}
          <div className="brutal-card brutal-shadow p-5 border-ink flex flex-col min-h-[220px]">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-card-title font-black uppercase tracking-tight">Market Snapshot</h2>
              <Badge variant="flat" className="text-[10px]">Live</Badge>
            </div>
            <div className="flex-1 grid grid-cols-1 gap-2">
              {marketQuotes.slice(0, 5).map((quote) => (
                <MarketCard key={quote.symbol} quote={quote} />
              ))}
            </div>
          </div>

          {/* ── Card 3: Featured Tape View ── */}
          {latestTapeView ? (
            <Link
              href={`/tape-views/${latestTapeView.slug}`}
              className="brutal-card brutal-shadow p-5 border-ink flex flex-col min-h-[220px] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[5px_5px_0_#111] transition-all duration-100"
            >
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="default" className="text-[10px]">{latestTapeView.category}</Badge>
                <span className="text-small font-black uppercase opacity-60">{latestTapeView.instrument}</span>
                <Badge
                  variant={latestTapeView.bias === "BULLISH" ? "up" : latestTapeView.bias === "BEARISH" ? "down" : "default"}
                  className="text-[10px] ml-auto"
                >
                  {latestTapeView.bias}
                </Badge>
              </div>
              <h3 className="text-card-title font-black uppercase leading-tight mb-2 line-clamp-2">
                {latestTapeView.title}
              </h3>
              <p className="text-small font-bold leading-relaxed opacity-70 line-clamp-3 flex-1">
                {latestTapeView.todayView}
              </p>
              <div className="mt-3">
                <span className="inline-block bg-ink text-bg brutal-border px-3.5 py-1.5 font-black uppercase text-[11px] tracking-wide hover:bg-accent-coral hover:text-white transition-colors">
                  Read Analysis →
                </span>
              </div>
            </Link>
          ) : (
            <div className="brutal-card brutal-shadow p-5 border-ink flex flex-col min-h-[220px] items-center justify-center">
              <p className="text-body font-black uppercase opacity-40 text-center">No analysis available</p>
            </div>
          )}
        </div>
      </section>

      {/* ───────────────────────── 2. Featured Story ───────────────────────── */}
      {featuredPost && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <div className="flex items-center gap-3 mb-4">
            <Badge variant="flat">Featured</Badge>
            <h2 className="text-small font-black uppercase tracking-widest opacity-70">Featured Story</h2>
          </div>
          <Link
            href={`/news/${featuredPost.slug}`}
            className="group block brutal-card brutal-shadow bg-accent-yellow/10 border-accent-yellow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[5px_5px_0_#111] transition-all duration-150"
          >
            <div className="p-5 md:p-6">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge variant="default" className="text-[10px]">{featuredPost.category}</Badge>
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
        <section className="bg-accent-coral/10 border-t-[3px] border-ink border-b-[3px] border-ink">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 md:py-6 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-3">
              <Badge variant="breaking">Breaking</Badge>
              <h2 className="text-small font-black uppercase tracking-widest opacity-70">Breaking News</h2>
            </div>
            <Link
              href={`/news/${breakingPost.slug}`}
              className="block brutal-card brutal-shadow p-4 md:p-5 bg-bg border-accent-coral hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[5px_5px_0_#111] transition-all duration-100"
            >
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge variant="default" className="text-[10px]">{breakingPost.category}</Badge>
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
          </div>
        </section>
      )}

      {/* ───────────────────────── 4. Latest News ───────────────────────── */}
      {latestNews.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 section-padding">
          <div className="flex items-center justify-between mb-5">
            <SectionTitle>Latest News</SectionTitle>
            <Link href="/news" className="text-small font-black uppercase underline hover:text-accent-coral">
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
      <section className="bg-ink text-bg border-t-[3px] border-ink border-b-[3px] border-ink">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 text-center">
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
        <div className="bg-accent-pink brutal-border brutal-shadow p-5 md:p-6">
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