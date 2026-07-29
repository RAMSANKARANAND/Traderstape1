import { getPublishedNewsSlugs } from "@/lib/db-raw";
import type { MetadataRoute } from "next";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://traderstape.com";

  // Static pages
  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "hourly" as const, priority: 1.0 },
    { url: `${baseUrl}/stocks`, lastModified: new Date(), changeFrequency: "hourly" as const, priority: 0.9 },
    { url: `${baseUrl}/crypto`, lastModified: new Date(), changeFrequency: "hourly" as const, priority: 0.8 },
    { url: `${baseUrl}/forex`, lastModified: new Date(), changeFrequency: "hourly" as const, priority: 0.9 },
    { url: `${baseUrl}/news`, lastModified: new Date(), changeFrequency: "hourly" as const, priority: 0.9 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.5 },
  ];

  // Dynamic news pages
  const newsPosts = await getPublishedNewsSlugs();

  const newsPages = newsPosts.map((post) => ({
    url: `${baseUrl}/news/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...newsPages];
}