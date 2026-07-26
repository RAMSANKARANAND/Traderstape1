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
  { value: "STOCKS", label: "Stocks" },
  { value: "CRYPTO", label: "Crypto" },
  { value: "FOREX", label: "Forex" },
  { value: "COMMODITIES", label: "Commodities" },
];

interface TapeViewArticle {
  id: string;
  title: string;
  category: "STOCKS" | "CRYPTO" | "FOREX" | "COMMODITIES";
  author: string;
  summary: string;
  publishedAt: string;
  readTime: string;
  isPremium: boolean;
}

const placeholderArticles: TapeViewArticle[] = [
  {
    id: "1",
    title: "NIFTY Daily View",
    category: "STOCKS",
    author: "Editorial Team",
    summary:
      "A technical look at today's NIFTY 50 price action, key support and resistance levels, and what the charts are telling us about short-term momentum.",
    publishedAt: "2026-07-26T09:30:00+05:30",
    readTime: "4 min read",
    isPremium: false,
  },
  {
    id: "2",
    title: "Bank Nifty Outlook",
    category: "STOCKS",
    author: "Editorial Team",
    summary:
      "Bank Nifty's trajectory this week, with a focus on PSU bank relative strength and the critical 51,500 resistance level.",
    publishedAt: "2026-07-25T16:00:00+05:30",
    readTime: "5 min read",
    isPremium: false,
  },
  {
    id: "3",
    title: "Gold (XAU/USD)",
    category: "COMMODITIES",
    author: "Editorial Team",
    summary:
      "Gold's breakout above $2,400 and the confluence of factors driving the precious metal higher — real yields, USD, and central bank demand.",
    publishedAt: "2026-07-25T11:15:00+05:30",
    readTime: "3 min read",
    isPremium: false,
  },
  {
    id: "4",
    title: "Silver",
    category: "COMMODITIES",
    author: "Editorial Team",
    summary:
      "Silver's outperformance versus gold and why the gold-silver ratio contraction suggests further upside for the white metal.",
    publishedAt: "2026-07-24T14:20:00+05:30",
    readTime: "3 min read",
    isPremium: false,
  },
  {
    id: "5",
    title: "Bitcoin",
    category: "CRYPTO",
    author: "Editorial Team",
    summary:
      "Bitcoin's retest of the $67K level and the on-chain metrics that distinguish this rally from the 2024 cycle.",
    publishedAt: "2026-07-24T10:00:00+05:30",
    readTime: "4 min read",
    isPremium: false,
  },
  {
    id: "6",
    title: "USD/INR",
    category: "FOREX",
    author: "Editorial Team",
    summary:
      "The rupee's narrow range-bound trade and key levels to watch as RBI likely intervenes near 83.80.",
    publishedAt: "2026-07-23T13:45:00+05:30",
    readTime: "3 min read",
    isPremium: false,
  },
  {
    id: "7",
    title: "Weekly Market Outlook",
    category: "STOCKS",
    author: "Editorial Team",
    summary:
      "A comprehensive look at the coming week: FOMC minutes, India CPI data, and the earnings calendar that matters.",
    publishedAt: "2026-07-22T18:30:00+05:30",
    readTime: "6 min read",
    isPremium: false,
  },
];

export default async function TapeViewsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;

  const filteredArticles = category
    ? placeholderArticles.filter((a) => a.category === category)
    : placeholderArticles;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SectionTitle className="mb-2">Tape Views</SectionTitle>
      <p className="text-sm font-bold opacity-60 mb-8 uppercase tracking-wide">
        Original editorial market analysis for educational purposes
      </p>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-3 mb-8">
        {categories.map((cat) => (
          <Link
            key={cat.value}
            href={cat.value ? `/tape-views?category=${cat.value}` : "/tape-views"}
            className={`px-4 py-2 font-black uppercase text-sm brutal-border transition-all duration-100 ${
              (category === cat.value || (!category && !cat.value))
                ? "bg-ink text-bg"
                : "bg-bg text-ink hover:bg-accent-yellow"
            }`}
          >
            {cat.label}
          </Link>
        ))}
      </div>

      {filteredArticles.length === 0 ? (
        <div className="text-center py-12 brutal-border brutal-shadow p-8">
          <p className="text-lg font-black uppercase">No articles found</p>
          <p className="text-sm font-bold opacity-60 mt-2">
            {category
              ? "No articles in this category yet."
              : "Check back soon for new articles."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredArticles.map((article) => (
            <Card key={article.id} accent="none" className="page-enter">
              <div className="flex items-start justify-between mb-3">
                <Badge variant="default" className="text-[10px] px-2 py-0.5">
                  {article.category}
                </Badge>
                {article.isPremium && (
                  <Badge variant="up" className="text-[10px] px-2 py-0.5">
                    PREMIUM
                  </Badge>
                )}
              </div>
              <h3 className="text-xl font-black uppercase mb-2 leading-tight">
                {article.title}
              </h3>
              <p className="text-sm font-bold opacity-70 mb-4 leading-relaxed">
                {article.summary}
              </p>
              <div className="flex items-center justify-between text-xs font-black uppercase opacity-50">
                <span>By {article.author}</span>
                <span>{article.readTime}</span>
                <span>{new Date(article.publishedAt).toLocaleDateString("en-IN")}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
