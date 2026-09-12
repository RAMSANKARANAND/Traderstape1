import { getNewsPostBySlug } from "@/lib/db-raw";
import { Badge, ShareButtons } from "@/components/ui";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] }>;
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getNewsPostBySlug(slug, true); // for metadata, we want published version

  if (!post) return { title: "Article Not Found" };

  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.summary,
    openGraph: {
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.summary,
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
      images: post.ogImageUrl ? [{ url: post.ogImageUrl }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.summary,
    },
    alternates: {
      canonical: `/news/${slug}`,
    },
  };
}

export default async function ArticlePage({
  params,
  searchParams,
}: ArticlePageProps) {
  const { slug } = await params;
  const search = await searchParams;
  const isPreview = search?.preview === "1";

  const post = await getNewsPostBySlug(slug, !isPreview); // if preview, do not require published

  if (!post) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: post.title,
    description: post.summary,
    author: {
      "@type": "Person",
      name: post.author.name,
    },
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
  };

  const shareUrl = `https://traderstape.com/news/${slug}`;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link
        href="/news"
        className="inline-block mb-6 font-black uppercase text-sm hover:text-[var(--ng-gold)] transition-colors duration-100"
        style={{ color: 'var(--ng-navy-text)' }}
      >
        ← Back to News
      </Link>

      {isPreview && (
        <div className="mb-4 p-3 bg-accent-yellow text-ink rounded-md font-bold">
          Preview Mode - Draft Post
        </div>
      )}

      <article>
        <div className="flex items-center gap-3 mb-4">
          <Badge variant="flat" className="ng-pill-navy text-[10px]">{post.category}</Badge>
          {post.publishedAt && (
            <span className="text-xs font-bold uppercase" style={{ color: 'var(--ng-navy-text)' }}>
              {new Date(post.publishedAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          )}
          {post.sourceName && (
            <span className="text-xs font-bold uppercase opacity-70" style={{ color: 'var(--ng-navy-text)' }}>
              Source: {post.sourceName}
            </span>
          )}
        </div>

        <h1 className="text-3xl md:text-4xl font-black uppercase leading-tight mb-4" style={{ color: 'var(--ng-navy-text)' }}>
          {post.title}
        </h1>

        <p className="text-lg font-bold opacity-70 mb-8">
          By {post.author.name}
        </p>

        <div className="ng-card p-5 mb-8">
          <p className="text-lg leading-relaxed text-base">{post.summary}</p>
        </div>
      </article>

      <ShareButtons title={post.title} url={shareUrl} />
    </div>
  );
}