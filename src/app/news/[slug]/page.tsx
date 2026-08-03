import { getNewsPostBySlug } from "@/lib/db-raw";
import { Badge, Card } from "@/components/ui";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import remarkGfm from "remark-gfm";

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

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link
        href="/news"
        className="inline-block mb-6 font-black uppercase text-sm hover:text-accent-coral transition-colors duration-100"
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
          <Badge variant="default">{post.category}</Badge>
          {post.publishedAt && (
            <span className="text-xs font-bold uppercase">
              {new Date(post.publishedAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          )}
        </div>

        <h1 className="text-3xl md:text-4xl font-black uppercase leading-tight mb-4">
          {post.title}
        </h1>

        <p className="text-lg font-bold opacity-70 mb-8">
          By {post.author.name}
        </p>

<Card className="mb-8">
  <p className="text-lg leading-relaxed text-base">{post.summary}</p>
</Card>

<div className="prose prose-lg max-w-none mt-6">
          <div className="prose-invert text-base leading-6">
            <ReactMarkdown>
              {post.body}
            </ReactMarkdown>
          </div>
        </div>
      </article>

      <div className="mt-12 pt-8 brutal-border-t border-t-3 border-ink">
        <p className="text-xs font-bold opacity-60">
          Traderstape is for educational purposes only. Nothing on this site is financial advice.
        </p>
      </div>
    </div>
  );
}