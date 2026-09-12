import { getTapeViewBySlug, getRelatedTapeViews } from "@/lib/db-raw";
import { Badge, ShareButtons } from "@/components/ui";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

function normalizeBodyContent(content: string): string {
  return content.replace(/\\n/g, "\n");
}

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getTapeViewBySlug(slug);

  if (!post) return { title: "Article Not Found" };

  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.todayView,
    openGraph: {
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.todayView,
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
      images: post.ogImageUrl ? [{ url: post.ogImageUrl }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.todayView,
    },
    alternates: {
      canonical: `/tape-views/${slug}`,
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const post = await getTapeViewBySlug(slug, true);

  if (!post) {
    notFound();
  }

  const wordCount = post.body.split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  const relatedPosts = await getRelatedTapeViews(post.category, post.id, 3);

  const shareUrl = `https://traderstape.com/tape-views/${slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.todayView,
    author: {
      "@type": "Person",
      name: post.author.name,
    },
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link
        href="/tape-views"
        className="inline-block mb-4 md:mb-6 font-black uppercase text-xs md:text-sm hover:text-[var(--ng-gold)] transition-colors duration-100"
        style={{ color: 'var(--ng-navy-text)' }}
      >
        ← Back to Tape Views
      </Link>

      <header className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-4xl font-black uppercase leading-tight mb-3 md:mb-4" style={{ color: 'var(--ng-navy-text)' }}>
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-3 md:mb-5">
          <Badge variant="flat" className="ng-pill-navy text-[10px]">{post.category}</Badge>
          <span className="text-xs md:text-sm font-black uppercase" style={{ color: 'var(--ng-navy-text)' }}>{post.instrument}</span>
          <Badge
            variant="flat"
            className={
              post.bias === "BULLISH"
                ? "ng-pill-positive text-[10px]"
                : post.bias === "BEARISH"
                  ? "ng-pill-negative text-[10px]"
                  : "ng-pill-neutral text-[10px]"
            }
          >
            {post.bias}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 md:gap-x-4 gap-y-1 text-xs md:text-sm font-bold opacity-70" style={{ color: 'var(--ng-navy-text)' }}>
          <span>By {post.author.name}</span>
          {post.publishedAt && (
            <>
              <span className="hidden sm:inline opacity-40">|</span>
              <span>
                {new Intl.DateTimeFormat("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  timeZone: "UTC",
                }).format(new Date(post.publishedAt))}
              </span>
              <span className="hidden sm:inline opacity-40">|</span>
              <span>{readingTime} min read</span>
            </>
          )}
        </div>
      </header>

      <div className="ng-card p-5 md:p-6 mb-6 md:mb-8">
        <h2 className="text-lg md:text-xl font-black uppercase mb-2 md:mb-3" style={{ color: 'var(--ng-navy-text)' }}>Today&apos;s Market View</h2>
        <p className="text-base md:text-lg font-bold leading-relaxed whitespace-pre-line" style={{ color: 'var(--ng-navy-text)' }}>{post.todayView}</p>
      </div>

      {post.keyLevelsToWatch && (
        <div className="ng-card p-5 md:p-6 mb-6 md:mb-8">
          <h2 className="text-lg md:text-xl font-black uppercase mb-2 md:mb-3" style={{ color: 'var(--ng-navy-text)' }}>Key Levels to Watch</h2>
          <p className="text-sm md:text-base font-bold leading-relaxed whitespace-pre-line" style={{ color: 'var(--ng-navy-text)' }}>{post.keyLevelsToWatch}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="ng-card p-5 md:p-6">
          <h2 className="text-lg md:text-xl font-black uppercase mb-3 md:mb-4" style={{ color: 'var(--ng-navy-text)' }}>Support Levels</h2>
          <div className="space-y-2 md:space-y-3">
            {post.support1 && (
              <div className="flex items-center justify-between">
                <span className="text-xs md:text-sm font-black uppercase opacity-70" style={{ color: 'var(--ng-navy-text)' }}>S1</span>
                <span className="text-base md:text-lg font-black" style={{ color: 'var(--ng-navy-text)' }}>{post.support1}</span>
              </div>
            )}
            {post.support2 && (
              <div className="flex items-center justify-between">
                <span className="text-xs md:text-sm font-black uppercase opacity-70" style={{ color: 'var(--ng-navy-text)' }}>S2</span>
                <span className="text-base md:text-lg font-black" style={{ color: 'var(--ng-navy-text)' }}>{post.support2}</span>
              </div>
            )}
            {post.support3 && (
              <div className="flex items-center justify-between">
                <span className="text-xs md:text-sm font-black uppercase opacity-70" style={{ color: 'var(--ng-navy-text)' }}>S3</span>
                <span className="text-base md:text-lg font-black" style={{ color: 'var(--ng-navy-text)' }}>{post.support3}</span>
              </div>
            )}
          </div>
        </div>

        <div className="ng-card p-5 md:p-6">
          <h2 className="text-lg md:text-xl font-black uppercase mb-3 md:mb-4" style={{ color: 'var(--ng-navy-text)' }}>Resistance Levels</h2>
          <div className="space-y-2 md:space-y-3">
            {post.resistance1 && (
              <div className="flex items-center justify-between">
                <span className="text-xs md:text-sm font-black uppercase opacity-70" style={{ color: 'var(--ng-navy-text)' }}>R1</span>
                <span className="text-base md:text-lg font-black" style={{ color: 'var(--ng-navy-text)' }}>{post.resistance1}</span>
              </div>
            )}
            {post.resistance2 && (
              <div className="flex items-center justify-between">
                <span className="text-xs md:text-sm font-black uppercase opacity-70" style={{ color: 'var(--ng-navy-text)' }}>R2</span>
                <span className="text-base md:text-lg font-black" style={{ color: 'var(--ng-navy-text)' }}>{post.resistance2}</span>
              </div>
            )}
            {post.resistance3 && (
              <div className="flex items-center justify-between">
                <span className="text-xs md:text-sm font-black uppercase opacity-70" style={{ color: 'var(--ng-navy-text)' }}>R3</span>
                <span className="text-base md:text-lg font-black" style={{ color: 'var(--ng-navy-text)' }}>{post.resistance3}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="ng-card p-5 md:p-6 mb-6 md:mb-8">
        <h2 className="text-lg md:text-xl font-black uppercase mb-3 md:mb-4" style={{ color: 'var(--ng-navy-text)' }}>Full Analysis</h2>
        <div className="prose prose-lg max-w-none">
          <div className="prose-invert text-base leading-6">
            <ReactMarkdown>
              {normalizeBodyContent(post.body)}
            </ReactMarkdown>
          </div>
        </div>
      </div>

      {post.riskFactors && (
        <div className="ng-card p-5 md:p-6 mb-6 md:mb-8">
          <h2 className="text-lg md:text-xl font-black uppercase mb-2 md:mb-3" style={{ color: 'var(--ng-navy-text)' }}>Risk Factors</h2>
          <p className="text-sm md:text-base font-bold leading-relaxed whitespace-pre-line" style={{ color: 'var(--ng-navy-text)' }}>{post.riskFactors}</p>
        </div>
      )}

      {post.educationalDisclaimer && (
        <div className="ng-card p-5 md:p-6 mb-6 md:mb-8">
          <h2 className="text-lg md:text-xl font-black uppercase mb-2 md:mb-3" style={{ color: 'var(--ng-navy-text)' }}>Educational Disclaimer</h2>
          <p className="text-sm md:text-base font-bold leading-relaxed" style={{ color: 'var(--ng-navy-text)' }}>{post.educationalDisclaimer}</p>
        </div>
      )}

      <ShareButtons title={post.title} url={shareUrl} />

      {relatedPosts.length > 0 && (
        <div className="mb-6 md:mb-8">
          <h2 className="text-lg md:text-xl font-black uppercase mb-3 md:mb-4" style={{ color: 'var(--ng-navy-text)' }}>Related Research</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            {relatedPosts.map((related) => (
              <Link key={related.id} href={`/tape-views/${related.slug}`} className="block">
                <div className="ng-card p-4 page-enter">
                  <div className="flex flex-wrap items-center gap-2 mb-2 md:mb-3">
                    <Badge variant="flat" className="ng-pill-navy text-[10px] px-2 py-0.5">
                      {related.category}
                    </Badge>
                    <Badge
                      variant="flat"
                      className={
                        related.bias === "BULLISH"
                          ? "ng-pill-positive text-[10px] px-2 py-0.5"
                          : related.bias === "BEARISH"
                            ? "ng-pill-negative text-[10px] px-2 py-0.5"
                            : "ng-pill-neutral text-[10px] px-2 py-0.5"
                      }
                    >
                      {related.bias}
                    </Badge>
                  </div>
                  <h3 className="text-sm md:text-base font-black uppercase mb-1 md:mb-2 leading-tight" style={{ color: 'var(--ng-navy-text)' }}>{related.title}</h3>
                  <p className="text-[10px] md:text-xs font-bold opacity-60" style={{ color: 'var(--ng-navy-text)' }}>{related.instrument}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 md:mt-12 pt-6 md:pt-8" style={{ borderTop: '3px solid var(--ng-border)' }}>
        <p className="text-[10px] md:text-xs font-bold opacity-60" style={{ color: 'var(--ng-navy-text)' }}>
          TradersTape is for educational purposes only. Nothing on this site is financial advice.
        </p>
      </div>
    </div>
  );
}
