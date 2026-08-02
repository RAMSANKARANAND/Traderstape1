import { getPublishedNewsPosts, type NewsPostWithAuthor } from "@/lib/db-raw";
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
  { value: "STOCKS", label: "Stocks", color: "card-sky", badge: "forex" },
  { value: "CRYPTO", label: "Crypto", color: "card-gold", badge: "gold" },
  { value: "FOREX", label: "Forex", color: "card-mint", badge: "bullish" },
  { value: "GEOPOLITICAL", label: "Geopolitical", color: "card-coral", badge: "bearish" },
];

type PostWithAuthor = NewsPostWithAuthor;

function formatDate(date: Date | null): string {
  if (!date) return "";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(date));
}

const tabVariant = (cat: typeof categories[0], active: boolean) => {
  if (active) return "bg-ink text-bg brutal-border shadow-[3px_3px_0_#000]";
  if (!cat.color) return "bg-bg text-ink brutal-border shadow-[3px_3px_0_#000] hover:bg-accent-yellow";
  const colorClass = `bg-${cat.color.replace("card-", "")} text-ink brutal-border shadow-[3px_3px_0_#000]`;
  return colorClass;
};

export default async function NewsPage({ searchParams }: NewsPageProps) {
  const { category } = await searchParams;
  const where: Record<string, unknown> = { isPublished: true };
  if (category) {
    where.category = category;
  }

  const posts = await getPublishedNewsPosts(
    category ? { category: category as any } : undefined,
  );

  // Partition posts by editorial flags (deterministic, single query).
  const breakingPost = posts.find((p) => p.isBreaking) ?? null;
  const featuredPost = posts.find((p) => p.isFeatured) ?? null;

  const breakingId = breakingPost?.id;
  const featuredId = featuredPost?.id;
  const excludeIds = [breakingId, featuredId].filter(Boolean) as string[];

  const latest = excludeIds.length
    ? posts.filter((p) => !excludeIds.includes(p.id))
    : posts;

  const trending = latest.filter((p) => p.isTrending);
  const editorPicks = latest.filter((p) => p.isEditorPick);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SectionTitle className="mb-2">Trading News</SectionTitle>
      <p className="text-sm font-bold opacity-60 mb-8 uppercase tracking-wide">
        Curated trading news for educational purposes
      </p>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-3 mb-10">
        {categories.map((cat) => (
          <Link
            key={cat.value}
            href={cat.value ? `/news?category=${cat.value}` : "/news"}
            className={`px-4 py-2 font-black uppercase text-sm transition-all duration-100 ${
              tabVariant(cat, category === cat.value || (!category && !cat.value))
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
        <div className="space-y-14">
          {/* ── 1. Breaking News (Hero) ── */}
          {breakingPost && (
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="down">Breaking</Badge>
                <h2 className="text-xl font-black uppercase tracking-wide">Breaking News</h2>
              </div>
              <BreakingHero post={breakingPost} />
            </section>
          )}

          {/* ── 2. Featured Story ── */}
          {featuredPost && (
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="flat">Featured</Badge>
                <h2 className="text-xl font-black uppercase tracking-wide">Featured Story</h2>
              </div>
              <FeaturedHero post={featuredPost} />
            </section>
          )}

          {/* ── 3. Latest News ── */}
          {latest.length > 0 && (
            <section>
              <h2 className="text-xl font-black uppercase tracking-wide mb-4 brutal-border-b border-b-3 border-ink pb-2">
                Latest News
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {latest.map((post) => (
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

          {/* ── 4. Trending ── */}
          {trending.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="up">Trending</Badge>
                <h2 className="text-xl font-black uppercase tracking-wide brutal-border-b border-b-3 border-ink pb-2 flex-1">
                  Trending
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trending.map((post) => (
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

          {/* ── 5. Editor's Picks ── */}
          {editorPicks.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="default">Editor's Picks</Badge>
                <h2 className="text-xl font-black uppercase tracking-wide brutal-border-b border-b-3 border-ink pb-2 flex-1">
                  Editor's Picks
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {editorPicks.map((post) => (
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
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── Hero components ───────────────────────── */

function BreakingHero({ post }: { post: PostWithAuthor }) {
  return (
    <Link
      href={`/news/${post.slug}`}
      className="block card-coral brutal-shadow p-6 md:p-8 hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[6px_6px_0_#111] transition-all duration-100"
    >
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Badge variant="bearish">Breaking</Badge>
        <Badge variant="forex">{post.category}</Badge>
        <span className="text-xs font-bold uppercase opacity-60 ml-auto">
          {formatDate(post.publishedAt)}
        </span>
      </div>
      <h3 className="text-2xl md:text-4xl font-black uppercase leading-tight mb-3">
        {post.title}
      </h3>
      <p className="text-sm md:text-base font-bold opacity-80 leading-relaxed max-w-3xl mb-4">
        {post.summary}
      </p>
      <span className="text-xs font-black uppercase opacity-60 hover:opacity-100 transition-opacity">
        Read full story →
      </span>
    </Link>
  );
}

function FeaturedHero({ post }: { post: PostWithAuthor }) {
  return (
    <Link
      href={`/news/${post.slug}`}
      className="block card-gold brutal-shadow p-6 md:p-8 hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[6px_6px_0_#111] transition-all duration-100"
    >
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Badge variant="flat">Featured</Badge>
        <Badge variant="forex">{post.category}</Badge>
        <span className="text-xs font-bold uppercase opacity-60 ml-auto">
          {formatDate(post.publishedAt)}
        </span>
      </div>
      <h3 className="text-2xl md:text-3xl font-black uppercase leading-tight mb-3">
        {post.title}
      </h3>
      <p className="text-sm md:text-base font-bold opacity-80 leading-relaxed max-w-3xl mb-4">
        {post.summary}
      </p>
      <span className="text-xs font-black uppercase opacity-60 hover:opacity-100 transition-opacity">
        Read full story →
      </span>
    </Link>
  );
}