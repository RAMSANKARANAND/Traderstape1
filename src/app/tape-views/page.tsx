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
  { value: "NSE", label: "NSE" },
  { value: "FOREX", label: "Forex" },
  { value: "CRYPTO", label: "Crypto" },
  { value: "COMMODITIES", label: "Commodities" },
  { value: "GLOBAL_MARKETS", label: "Global Markets" },
  { value: "WEEKLY_OUTLOOK", label: "Weekly Outlook" },
  { value: "SPECIAL_REPORT", label: "Special Report" },
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

const tabVariant = (cat: typeof categories[0], active: boolean) => {
  if (active) return "ng-btn-navy";
  return "bg-white border-[1px] border-[var(--ng-border)] text-[var(--ng-navy-text)] font-black uppercase text-sm hover:border-[var(--ng-gold)] transition-all duration-100";
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
      <SectionTitle className="mb-2" style={{ color: 'var(--ng-navy-text)' }}>
        Tape Views
      </SectionTitle>

      <p className="text-sm font-bold opacity-60 mb-8 uppercase tracking-wide" style={{ color: 'var(--ng-navy-text)' }}>
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
            className={`px-4 py-2 ${tabVariant(cat, category === cat.value || (!category && !cat.value))}`}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {articles.map((article) => {
            return (
              <Link
                key={article.id}
                href={`/tape-views/${article.slug}`}
                className="block h-full"
              >
                <div className="ng-card p-5 page-enter flex flex-col h-full">
                  <div className="flex items-start justify-between mb-3">
                    <Badge variant="flat" className="ng-pill-navy text-[10px] px-2 py-0.5">
                      {categoryLabels[article.category] || article.category}
                    </Badge>

                    <Badge
                      variant="flat"
                      className={
                        article.bias === "BULLISH"
                          ? "ng-pill-positive text-[10px] px-2 py-0.5"
                          : article.bias === "BEARISH"
                          ? "ng-pill-negative text-[10px] px-2 py-0.5"
                          : "ng-pill-neutral text-[10px] px-2 py-0.5"
                      }
                    >
                      {article.bias}
                    </Badge>
                  </div>

                  <h3 className="text-xl font-black uppercase mb-2 leading-tight line-clamp-2" style={{ color: 'var(--ng-navy-text)' }}>
                    {article.title}
                  </h3>

                  <p className="text-sm font-bold opacity-70 mb-4 leading-relaxed line-clamp-3">
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