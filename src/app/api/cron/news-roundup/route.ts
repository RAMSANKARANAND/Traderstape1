import { NextRequest, NextResponse } from "next/server";
import { getEnabledCronFeeds } from "@/lib/rss/cronFeeds";
import { fetchAndParseFeed } from "@/lib/rss/fetch";
import { deduplicateByUrl, deduplicateByTitle } from "@/lib/rss/dedupe";
import { generateAiContent } from "@/lib/ai/service";
import type { AiRequest } from "@/lib/ai/types";
import { getDb } from "@/lib/prisma";
// Import using relative path to avoid alias issues
import { NewsCategory } from "@prisma/client";

const MAX_PER_RUN = 10;

export const maxDuration = 300; // 5 minutes for cron

export async function GET(request: NextRequest) {
  // Simple cron auth via header (optional)
  const cronSecret = request.headers.get("x-cron-secret");
  if (process.env.CRON_SECRET && cronSecret !== process.env.CRON_SECRET) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  let stats = {
    fetched: 0,
    newItems: 0,
    duplicates: 0,
    aiFailed: 0,
    saved: 0,
  };

const prisma = getDb();

    // Get system user for automated posts
    const systemUser = await prisma.user.findUnique({
      where: { email: "system@traderstape.com" },
    });
    if (!systemUser) {
      return NextResponse.json(
        { success: false, error: "System user not found. Run seed script." },
        { status: 500 }
      );
    }
    const systemUserId = systemUser.id;

    try {
    const feeds = getEnabledCronFeeds();
    console.log(`[News Roundup Cron] Processing ${feeds.length} feeds`);

    // We'll store items with their feed category for later use
    type FeedItem = {
      item: ReturnType<typeof fetchAndParseFeed> extends Promise<{ items: infer I }> ? I : never;
      feedCategory: string;
    };
    const feedItems: Array<{ item: any; feedCategory: string }> = [];

    for (const feed of feeds) {
      stats.fetched++;
      const result = await fetchAndParseFeed(feed);
      if (!result.success) {
        console.warn(`[News Roundup Cron] Failed to fetch ${feed.name}: ${result.error}`);
        continue;
      }
      for (const item of result.items) {
        feedItems.push({ item, feedCategory: feed.category });
      }
    }

    // Flatten items for deduplication (we need NormalizedFeedItem[])
    const allItems: any[] = feedItems.map(({ item }) => item);

    // Deduplicate by URL then title
    const afterUrl = deduplicateByUrl(allItems);
    const afterTitle = deduplicateByTitle(afterUrl.unique);
    const uniqueItems = afterTitle.unique;
    stats.duplicates = allItems.length - uniqueItems.length;

    // Limit to MAX_PER_RUN
    const toProcess = uniqueItems.slice(0, MAX_PER_RUN);
    stats.newItems = toProcess.length;

    // Map from item back to its feedCategory (we need a map; we'll create a Map from url to feedCategory)
    const urlToFeedCategory = new Map<string, string>();
    for (const { item, feedCategory } of feedItems) {
      urlToFeedCategory.set(item.url, feedCategory);
    }

    for (const item of toProcess) {
      // Check if already exists in DB by sourceName+externalId (we'll use url as externalId)
      const existing = await prisma.newsPost.findFirst({
        where: {
          sourceName: item.sourceName,
          externalId: item.url,
        },
      });
      if (existing) {
        stats.duplicates++;
        continue;
      }

      // Determine category from feed
      let cat: NewsCategory;
      const feedCat = urlToFeedCategory.get(item.url) ?? "";
      switch (feedCat.toLowerCase()) {
        case "stocks":
          cat = NewsCategory.STOCKS;
          break;
        case "crypto":
          cat = NewsCategory.CRYPTO;
          break;
        case "forex":
          cat = NewsCategory.FOREX;
          break;
        case "geopolitical":
          cat = NewsCategory.GEOPOLITICAL;
          break;
        default:
          cat = NewsCategory.STOCKS; // fallback
      }

      // Prepare content for AI: prefer summary, fallback to title
      const content = item.summary.trim() || item.title;
      // If content too long, we still send it; instruction says we will not store raw snippet.
      const aiReq: AiRequest = {
        action: "generate-news-roundup-summary",
        title: item.title,
        content,
        category: feedCat.toLowerCase() as any, // adjust to match action expectation
      };

      const aiRes = await generateAiContent(aiReq);
      if (!aiRes.success) {
        console.warn(`[News Roundup Cron] AI failed for "${item.title}": ${aiRes.message}`);
        stats.aiFailed++;
        continue;
      }

      const data = aiRes.data as { summary?: string | null; category?: string | null };
      if (!data.summary || !data.category) {
        console.warn(`[News Roundup Cron] AI returned null summary/category for "${item.title}"`);
        stats.aiFailed++;
        continue;
      }

      // Map category string to enum
      let finalCategory: NewsCategory;
      switch (data.category.toUpperCase()) {
        case "STOCKS":
          finalCategory = NewsCategory.STOCKS;
          break;
        case "CRYPTO":
          finalCategory = NewsCategory.CRYPTO;
          break;
        case "FOREX":
          finalCategory = NewsCategory.FOREX;
          break;
        case "GEOPOLITICAL":
          finalCategory = NewsCategory.GEOPOLITICAL;
          break;
        default:
          // fallback to feed category (need to map string to enum)
          switch (feedCat.toLowerCase()) {
            case "stocks":
              finalCategory = NewsCategory.STOCKS;
              break;
            case "crypto":
              finalCategory = NewsCategory.CRYPTO;
              break;
            case "forex":
              finalCategory = NewsCategory.FOREX;
              break;
            case "geopolitical":
              finalCategory = NewsCategory.GEOPOLITICAL;
              break;
            default:
              finalCategory = NewsCategory.STOCKS;
          }
      }

      const slug = `${item.sourceName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")}-${Date.now()}`;

      await prisma.newsPost.create({
        data: {
          title: item.title,
          slug,
          category: finalCategory,
          summary: data.summary,
          body: data.summary, // store same as body for now
          authorId: systemUserId,
          sourceName: item.sourceName,
          sourceUrl: item.sourceUrl,
          externalId: item.url,
          publishedAt: item.publishedAt,
          isPublished: false,
        },
      });
      stats.saved++;
    }

    console.log(`[News Roundup Cron] Finished: ${JSON.stringify(stats)}`);
    return NextResponse.json({ success: true, stats });
  } catch (error) {
    console.error("[News Roundup Cron] Error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}