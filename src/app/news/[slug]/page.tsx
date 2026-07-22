import { prisma } from "@/lib/prisma";
import { Badge, Card } from "@/components/ui";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.newsPost.findUnique({
    where: { slug },
  });

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

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const post = await prisma.newsPost.findUnique({
    where: { slug, isPublished: true },
    include: { author: { select: { name: true } } },
  });

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
          <p className="text-lg font-bold leading-relaxed">{post.summary}</p>
        </Card>

        <div className="prose prose-lg font-bold max-w-none">
          {post.body.split("\n").map((paragraph, i) => {
            if (paragraph.startsWith("## ")) {
              return (
                <h2 key={i} className="text-2xl font-black uppercase mt-8 mb-4">
                  {paragraph.replace("## ", "")}
                </h2>
              );
            }
            if (paragraph.startsWith("- ")) {
              return (
                <li key={i} className="ml-4 mb-1 font-bold">
                  {paragraph.replace("- ", "")}
                </li>
              );
            }
            if (paragraph.trim() === "") return null;
            return (
              <p key={i} className="mb-4 leading-relaxed">
                {paragraph}
              </p>
            );
          })}
        </div>
      </article>

      <div className="mt-12 pt-8 brutal-border-t border-t-3 border-ink">
        <p className="text-xs font-bold opacity-60">
          TradersTape is for educational purposes only. Nothing on this site is financial advice.
        </p>
      </div>
    </div>
  );
}