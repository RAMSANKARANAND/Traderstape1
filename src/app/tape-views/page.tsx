import { getPublishedTapeViews, type TapeViewCategory } from "@/lib/db-raw";
import { SectionTitle, Badge, Card } from "@/components/ui";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tape Views — Market Analysis",
  description:
    "Original editorial market analysis and technical observations from our editorial team. For educational purposes only.",
  openGraph: {
    title: "Tape Views | TradersTape",
    description:
      "Original editorial market analysis and technical observations from our editorial team.",
  },
};

const categories = [
  { value: "", label: "All" },
  { value: "NSE", label: "NSE", color: "card-sky", badge: "forex" },
  { value: "FOREX", label: "Forex", color: "card-mint", badge: "bullish" },
  { value: "CRYPTO", label: "Crypto", color: "card-gold", badge: "gold" },
  { value: "COMMODITIES", label: "Commodities", color: "card-gold", badge: "gold" },
  { value: "GLOBAL_MARKETS", label: "Global Markets", color: "card-lavender", badge: "ai" },
  { value: "WEEKLY_OUTLOOK", label: "Weekly Outlook", color: "card-coral", badge: "bearish" },
  { value: "SPECIAL_REPORT", label: "Special Report", color: "card-coral", badge: "bearish" },
];

const categoryLabels: Record<string, string> = {
  NSE: "NSE",
  FOREX: "Forex",
  CRYPTO: "Crypto",
  COMMODITIES: "Commodities",
  GLOBAL_MARKETS: "Global Markets",
  WEEKLY_OUTLOOK: "Weekly Outlook",
  SPECIAL_REPORT: "Special Report",
};

const categoryCardBg: Record<string, string> = {
  NSE: "card-sky",
  FOREX: "card-mint",
  CRYPTO: "card-gold",
  COMMODITIES: "card-gold",
  GLOBAL_MARKETS: "card-lavender",
  WEEKLY_OUTLOOK: "card-coral",
  SPECIAL_REPORT: "card-coral",
};

const categoryBadgeVariant: Record<string, string> = {
  NSE: "forex",
  FOREX: "bullish",
  CRYPTO: "gold",
  COMMODITIES: "gold",
  GLOBAL_MARKETS: "ai",
  WEEKLY_OUTLOOK: "bearish",
  SPECIAL_REPORT: "bearish",
};

const tabVariant = (cat: typeof categories[0], active: boolean) => {
  if (active) return "bg-ink text-bg brutal-border shadow-[3px_3px_0_#000]";
  if (!cat.color) return "bg-bg text-ink brutal-border shadow-[3px_3px_0_#000] hover:bg-accent-yellow";
  const colorClass = `bg-${cat.color.replace("card-", "")} text-ink brutal-border shadow-[3px_3px_0_#000]`;
  return colorClass;
};

interface TapeViewArticle {
  id: string;
  title: string;
  slug: string;
  category: string;
  instrument: string;
  bias: string;
  todayView: string;
  publishedAt: Date | null;
}

export default async function TapeViewsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;

  const tapeViews = await getPublishedTapeViews(
    category ? { category: category as TapeViewCategory } : undefined,
  );

  const articles: TapeViewArticle[] = tapeViews.map((tv) => ({
    id: tv.id,
    title: tv.title,
    slug: tv.slug,
    category: tv.category,
    instrument: tv.instrument,
    bias: tv.bias,
    todayView: tv.todayView,
    publishedAt: tv.publishedAt,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SectionTitle className="mb-2">
        Tape Views
      </SectionTitle>

      <p className="text-sm font-bold opacity-60 mb-8 uppercase tracking-wide">
        Original editorial market analysis for educational purposes
      </p>

      <div className="flex flex-wrap gap-3 mb-8">
        {categories.map((cat) => (
          <Link
            key={cat.value}
            href={
              cat.value
                ? `/tape-views?category=${cat.value}`
                : "/tape-views"
            }
            className={`px-4 py-2 font-black uppercase text-sm transition-all duration-100 ${
              tabVariant(cat, category === cat.value || (!category && !cat.value))
            }`}
          >
            {cat.label}
          </Link>
        ))}
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-12 brutal-border brutal-shadow p-8">
          <p className="text-lg font-black uppercase">
            No articles found
          </p>

          <p className="text-sm font-bold opacity-60 mt-2">
            {category
              ? "No articles in this category yet."
              : "Check back soon for new articles."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {articles.map((article) => {
            const cardBg = categoryCardBg[article.category] || "card-white";
            const badgeVariant = (categoryBadgeVariant[article.category] || "flat") as "default" | "flat" | "up" | "down" | "bullish" | "bearish" | "neutral" | "ai" | "breaking" | "forex" | "crypto" | "gold" | "live";
            return (
              <Link
                key={article.id}
                href={`/tape-views/${article.slug}`}
                className="block"
              >
                <div className={`${cardBg} brutal-shadow p-5 page-enter`}>
                <div className="flex items-start justify-between mb-3">
                  <Badge
                    variant={badgeVariant}
                    className="text-[10px] px-2 py-0.5"
                  >
                    {categoryLabels[article.category] || article.category}
                  </Badge>

                  <Badge
                    variant={
                      article.bias === "BULLISH"
                        ? "bullish"
                        : article.bias === "BEARISH"
                        ? "bearish"
                        : "neutral"
                    }
                    className="text-[10px] px-2 py-0.5"
                  >
                    {article.bias}
                  </Badge>
                </div>

                <h3 className="text-xl font-black uppercase mb-2 leading-tight">
                  {article.title}
                </h3>

                <p className="text-sm font-bold opacity-70 mb-4 leading-relaxed">
                  {article.todayView}
                </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}