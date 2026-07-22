import { prisma } from "@/lib/prisma";
import { Card, Panel, SectionTitle, Badge, NewsCard } from "@/components/ui";
import Link from "next/link";

export default async function HomePage() {
  const [marketLevels, newsPosts] = await Promise.all([
    prisma.marketLevel.findMany({
      where: { isPublished: true },
      orderBy: { updatedAt: "desc" },
      take: 8,
    }),
    prisma.newsPost.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: "desc" },
      take: 4,
      include: { author: { select: { name: true } } },
    }),
  ]);

  const stocks = marketLevels.filter((l) => l.assetType === "STOCK_FNO");
  const forex = marketLevels.filter((l) => l.assetType === "FOREX");

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

      {/* Hero Section */}
      <section className="bg-accent-pink brutal-border-b border-b-3 border-ink">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <h1 className="text-4xl md:text-6xl font-black uppercase leading-tight mb-6">
            Watch the Markets.<br />
            <span className="text-accent-coral">Stay Informed.</span>
          </h1>
          <p className="text-lg md:text-xl font-bold max-w-2xl mb-8">
            Real-time stock F&O levels, forex rates, and geopolitical trading news — all in one place.
            For educational purposes only.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/stocks"
              className="inline-block bg-accent-coral text-white brutal-border brutal-shadow px-8 py-3.5 font-black uppercase tracking-wide hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[4px_4px_0_#111] transition-all duration-100"
            >
              View Stock Levels
            </Link>
            <Link
              href="/news"
              className="inline-block bg-bg text-ink brutal-border brutal-shadow px-8 py-3.5 font-black uppercase tracking-wide hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[4px_4px_0_#111] transition-all duration-100"
            >
              Latest News
            </Link>
          </div>
        </div>
      </section>

      {/* Live Ticker Strip */}
      <div className="bg-ink text-bg brutal-border-b border-b-3 border-ink overflow-hidden py-3">
        <div className="flex ticker-track whitespace-nowrap">
          {[...marketLevels, ...marketLevels].map((level, i) => (
            <span key={`${level.id}-${i}`} className="inline-flex items-center gap-2 mx-6 text-sm font-black uppercase">
              {level.symbol}
              <span className={level.direction === "UP" ? "text-accent-teal" : level.direction === "DOWN" ? "text-accent-coral" : "text-accent-yellow"}>
                {level.level}
              </span>
              <span className={level.direction === "UP" ? "text-accent-teal" : level.direction === "DOWN" ? "text-accent-coral" : "text-accent-yellow"}>
                {level.direction === "UP" ? "▲" : level.direction === "DOWN" ? "▼" : "◆"}
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* Market Snapshots */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <SectionTitle className="mb-8">Market Snapshots</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Stocks Panel */}
          <Panel accent="yellow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-black uppercase">Stocks & F&O</h3>
              <Link href="/stocks" className="text-sm font-black uppercase underline hover:text-accent-coral">
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {stocks.map((level) => (
                <div key={level.id} className="flex items-center justify-between brutal-border p-3 bg-bg">
                  <span className="font-black uppercase">{level.symbol}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-bold">{level.level}</span>
                    <Badge variant={level.direction.toLowerCase() as "up" | "down" | "flat"}>
                      {level.direction === "UP" ? "▲ BULL" : level.direction === "DOWN" ? "▼ BEAR" : "◆ FLAT"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          {/* Forex Panel */}
          <Panel accent="teal">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-black uppercase">Forex</h3>
              <Link href="/forex" className="text-sm font-black uppercase underline hover:text-accent-coral">
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {forex.map((level) => (
                <div key={level.id} className="flex items-center justify-between brutal-border p-3 bg-bg">
                  <span className="font-black uppercase">{level.symbol}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-bold">{level.level}</span>
                    <Badge variant={level.direction.toLowerCase() as "up" | "down" | "flat"}>
                      {level.direction === "UP" ? "▲ BULL" : level.direction === "DOWN" ? "▼ BEAR" : "◆ FLAT"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </section>

      {/* Latest News */}
      <section className="bg-accent-blue brutal-border-t border-t-3 border-ink brutal-border-b border-b-3 border-ink py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <SectionTitle>Latest News</SectionTitle>
            <Link href="/news" className="text-sm font-black uppercase underline hover:text-accent-coral">
              All News →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {newsPosts.map((post) => (
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
        </div>
      </section>

      {/* About Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <SectionTitle className="mb-6">About TradersTape</SectionTitle>
            <p className="text-lg font-bold mb-4">
              TradersTape is your go-to source for market levels, forex rates, and trading news — 
              built for educational purposes only.
            </p>
            <p className="font-bold opacity-80 mb-6">
              We track key support and resistance levels across stock F&O, forex, and crypto markets,
              alongside curated geopolitical news that moves markets. Our content is designed to help
              you understand market dynamics — not to provide financial advice.
            </p>
            <Link
              href="/about"
              className="inline-block bg-ink text-bg brutal-border brutal-shadow px-6 py-3 font-black uppercase tracking-wide hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[4px_4px_0_#111] transition-all duration-100"
            >
              Learn More
            </Link>
          </div>
          <div className="bg-accent-pink brutal-border brutal-shadow p-8">
            <h3 className="text-2xl font-black uppercase mb-4">⚠ Disclaimer</h3>
            <p className="font-bold">
              TradersTape is for educational purposes only. Nothing on this site is financial advice.
              Always conduct your own research and consult with a licensed financial advisor before
              making investment decisions. Trading involves substantial risk of loss.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}