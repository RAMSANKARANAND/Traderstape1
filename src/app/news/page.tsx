import { prisma } from "@/lib/prisma";
import { SectionTitle, Badge, NewsCard } from "@/components/ui";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trading News",
  description: "Latest trading news covering stocks, crypto, forex, and geopolitical events. For educational purposes only.",
  openGraph: {
    title: "Trading News | TradersTape",
    description: "Latest trading news covering stocks, crypto, forex, and geopolitical events.",
  },
};

interface NewsPageProps {
  searchParams: Promise<{ category?: string }>;
}

const categories = [
  { value: "", label: "All" },
  { value: "STOCKS", label: "Stocks" },
  { value: "CRYPTO", label: "Crypto" },
  { value: "FOREX", label: "Forex" },
  { value: "GEOPOLITICAL", label: "Geopolitical" },
];

export default async function NewsPage({ searchParams }: NewsPageProps) {
  const { category } = await searchParams;
  const where: Record<string, unknown> = { isPublished: true };
  if (category) {
    where.category = category;
  }

  const posts = await prisma.newsPost.findMany({
    where,
    orderBy: { publishedAt: "desc" },
    include: { author: { select: { name: true } } },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SectionTitle className="mb-2">Trading News</SectionTitle>
      <p className="text-sm font-bold opacity-60 mb-8 uppercase tracking-wide">
        Curated trading news for educational purposes
      </p>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-3 mb-8">
        {categories.map((cat) => (
          <Link
            key={cat.value}
            href={cat.value ? `/news?category=${cat.value}` : "/news"}
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

      {posts.length === 0 ? (
        <div className="text-center py-12 brutal-border brutal-shadow p-8">
          <p className="text-lg font-black uppercase">No news articles found</p>
          <p className="text-sm font-bold opacity-60 mt-2">
            {category ? "No articles in this category yet." : "Check back soon for new articles."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((post) => (
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
      )}
    </div>
  );
}