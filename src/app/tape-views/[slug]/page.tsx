import { getDbAsync } from "@/lib/prisma";
import { Badge, Card } from "@/components/ui";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const prisma = await getDbAsync();
  const post = await prisma.tapeView.findUnique({
    where: { slug },
  });

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
  const prisma = await getDbAsync();
  const post = await prisma.tapeView.findUnique({
    where: { slug },
    include: { author: { select: { name: true } } },
  });

  if (!post || !post.isPublished) {
    notFound();
  }

  const wordCount = post.body.split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  const relatedPosts = await prisma.tapeView.findMany({
    where: {
      category: post.category,
      isPublished: true,
      id: { not: post.id },
    },
    take: 3,
    select: {
      id: true,
      title: true,
      slug: true,
      category: true,
      instrument: true,
      bias: true,
      todayView: true,
    },
  });

  const shareUrl = `https://traderstape.com/tape-views/${slug}`;
  const shareTitle = encodeURIComponent(post.title);

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
        className="inline-block mb-4 md:mb-6 font-black uppercase text-xs md:text-sm hover:text-accent-coral transition-colors duration-100"
      >
        ← Back to Tape Views
      </Link>

      <header className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-4xl font-black uppercase leading-tight mb-3 md:mb-4">
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-3 md:mb-5">
          <Badge variant="default">{post.category}</Badge>
          <span className="text-xs md:text-sm font-black uppercase">{post.instrument}</span>
          <Badge variant={post.bias === "BULLISH" ? "up" : post.bias === "BEARISH" ? "flat" : "default"}>
            {post.bias}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 md:gap-x-4 gap-y-1 text-xs md:text-sm font-bold opacity-70">
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

      <Card className="mb-6 md:mb-8">
        <h2 className="text-lg md:text-xl font-black uppercase mb-2 md:mb-3">Today's Market View</h2>
        <p className="text-base md:text-lg font-bold leading-relaxed whitespace-pre-line">{post.todayView}</p>
      </Card>

      {post.keyLevelsToWatch && (
        <Card className="mb-6 md:mb-8">
          <h2 className="text-lg md:text-xl font-black uppercase mb-2 md:mb-3">Key Levels to Watch</h2>
          <p className="text-sm md:text-base font-bold leading-relaxed whitespace-pre-line">{post.keyLevelsToWatch}</p>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
        <Card accent="teal">
          <h2 className="text-lg md:text-xl font-black uppercase mb-3 md:mb-4">Support Levels</h2>
          <div className="space-y-2 md:space-y-3">
            {post.support1 && (
              <div className="flex items-center justify-between">
                <span className="text-xs md:text-sm font-black uppercase opacity-70">S1</span>
                <span className="text-base md:text-lg font-black">{post.support1}</span>
              </div>
            )}
            {post.support2 && (
              <div className="flex items-center justify-between">
                <span className="text-xs md:text-sm font-black uppercase opacity-70">S2</span>
                <span className="text-base md:text-lg font-black">{post.support2}</span>
              </div>
            )}
            {post.support3 && (
              <div className="flex items-center justify-between">
                <span className="text-xs md:text-sm font-black uppercase opacity-70">S3</span>
                <span className="text-base md:text-lg font-black">{post.support3}</span>
              </div>
            )}
          </div>
        </Card>

        <Card accent="coral">
          <h2 className="text-lg md:text-xl font-black uppercase mb-3 md:mb-4">Resistance Levels</h2>
          <div className="space-y-2 md:space-y-3">
            {post.resistance1 && (
              <div className="flex items-center justify-between">
                <span className="text-xs md:text-sm font-black uppercase opacity-70">R1</span>
                <span className="text-base md:text-lg font-black">{post.resistance1}</span>
              </div>
            )}
            {post.resistance2 && (
              <div className="flex items-center justify-between">
                <span className="text-xs md:text-sm font-black uppercase opacity-70">R2</span>
                <span className="text-base md:text-lg font-black">{post.resistance2}</span>
              </div>
            )}
            {post.resistance3 && (
              <div className="flex items-center justify-between">
                <span className="text-xs md:text-sm font-black uppercase opacity-70">R3</span>
                <span className="text-base md:text-lg font-black">{post.resistance3}</span>
              </div>
            )}
          </div>
        </Card>
      </div>

      <Card className="mb-6 md:mb-8">
        <h2 className="text-lg md:text-xl font-black uppercase mb-3 md:mb-4">Full Analysis</h2>
        <div className="prose prose-lg font-bold max-w-none">
          {post.body.split("\n").map((paragraph: string, i: number) => {
            if (paragraph.startsWith("## ")) {
              return (
                <h2 key={i} className="text-xl md:text-2xl font-black uppercase mt-6 md:mt-8 mb-3 md:mb-4">
                  {paragraph.replace("## ", "")}
                </h2>
              );
            }
            if (paragraph.startsWith("- ")) {
              return (
                <li key={i} className="ml-4 mb-1 md:mb-2 font-bold text-sm md:text-base">
                  {paragraph.replace("- ", "")}
                </li>
              );
            }
            if (paragraph.trim() === "") return null;
            return (
              <p key={i} className="mb-3 md:mb-4 leading-relaxed text-sm md:text-base">
                {paragraph}
              </p>
            );
          })}
        </div>
      </Card>

      {post.riskFactors && (
        <Card className="mb-6 md:mb-8">
          <h2 className="text-lg md:text-xl font-black uppercase mb-2 md:mb-3">Risk Factors</h2>
          <p className="text-sm md:text-base font-bold leading-relaxed whitespace-pre-line">{post.riskFactors}</p>
        </Card>
      )}

      {post.educationalDisclaimer && (
        <Card accent="yellow" className="mb-6 md:mb-8">
          <h2 className="text-lg md:text-xl font-black uppercase mb-2 md:mb-3">Educational Disclaimer</h2>
          <p className="text-sm md:text-base font-bold leading-relaxed">{post.educationalDisclaimer}</p>
        </Card>
      )}

      <Card className="mb-6 md:mb-8">
        <h2 className="text-lg md:text-xl font-black uppercase mb-3 md:mb-4">Share Analysis</h2>
        <div className="flex flex-wrap gap-2 md:gap-3">
          <a
            href={`https://wa.me/?text=${shareTitle}%20-%20${shareUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-3 md:px-4 py-1.5 md:py-2 font-black uppercase text-xs brutal-border bg-bg hover:bg-accent-yellow transition-colors"
          >
            WhatsApp
          </a>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-3 md:px-4 py-1.5 md:py-2 font-black uppercase text-xs brutal-border bg-bg hover:bg-accent-yellow transition-colors"
          >
            Facebook
          </a>
          <a
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${shareTitle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-3 md:px-4 py-1.5 md:py-2 font-black uppercase text-xs brutal-border bg-bg hover:bg-accent-yellow transition-colors"
          >
            X / Twitter
          </a>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-3 md:px-4 py-1.5 md:py-2 font-black uppercase text-xs brutal-border bg-bg hover:bg-accent-yellow transition-colors"
          >
            LinkedIn
          </a>
          <a
            href="https://www.instagram.com/traderstape"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-3 md:px-4 py-1.5 md:py-2 font-black uppercase text-xs brutal-border bg-bg hover:bg-accent-yellow transition-colors"
          >
            Instagram
          </a>
        </div>
      </Card>

      {relatedPosts.length > 0 && (
        <div className="mb-6 md:mb-8">
          <h2 className="text-lg md:text-xl font-black uppercase mb-3 md:mb-4">Related Research</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            {relatedPosts.map((related) => (
              <Link key={related.id} href={`/tape-views/${related.slug}`} className="block">
                <Card accent="none" className="page-enter">
                  <div className="flex flex-wrap items-center gap-2 mb-2 md:mb-3">
                    <Badge variant="default" className="text-[10px] px-2 py-0.5">
                      {related.category}
                    </Badge>
                    <Badge
                      variant={
                        related.bias === "BULLISH"
                          ? "up"
                          : related.bias === "BEARISH"
                          ? "flat"
                          : "default"
                      }
                      className="text-[10px] px-2 py-0.5"
                    >
                      {related.bias}
                    </Badge>
                  </div>
                  <h3 className="text-sm md:text-base font-black uppercase mb-1 md:mb-2 leading-tight">{related.title}</h3>
                  <p className="text-[10px] md:text-xs font-bold opacity-60">{related.instrument}</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 md:mt-12 pt-6 md:pt-8 brutal-border-t border-t-3 border-ink">
        <p className="text-[10px] md:text-xs font-bold opacity-60">
          TradersTape is for educational purposes only. Nothing on this site is financial advice.
        </p>
      </div>
    </div>
  );
}