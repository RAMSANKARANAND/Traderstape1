import { getUserByEmail, getNewsPostTitlesIn, createNewsPost, type NewsCategory } from "../db-raw";
import { getEnabledCronFeeds } from "../rss/cronFeeds";
import { fetchAndParseFeed } from "../rss/fetch";
import { deduplicateByUrl, deduplicateByTitle } from "../rss/dedupe";
import { generateAiContent } from "../ai/service";
import type { AiRequest } from "../ai/types";

const MAX_PER_RUN = 10;

export interface NewsRoundupStats {
  fetched: number;
  newItems: number;
  duplicates: number;
  aiFailed: number;
  saved: number;
}

export interface NewsRoundupResult {
  success: true;
  stats: NewsRoundupStats;
}

export async function runNewsRoundup(): Promise<NewsRoundupResult> {
  let stats: NewsRoundupStats = {
    fetched: 0,
    newItems: 0,
    duplicates: 0,
    aiFailed: 0,
    saved: 0,
  };

  const feeds = getEnabledCronFeeds();
  console.log(`[News Roundup Cron] Processing ${feeds.length} feeds`);

  const feedItems: { item: any; feedCategory: string }[] = [];

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

  const allItems = feedItems.map(({ item }) => item);

  const afterUrl = deduplicateByUrl(allItems);
  const afterTitle = deduplicateByTitle(afterUrl.unique);
  const uniqueItems = afterTitle.unique;
  stats.duplicates = allItems.length - uniqueItems.length;

  const toProcess = uniqueItems.slice(0, MAX_PER_RUN);
  stats.newItems = toProcess.length;

  const urlToFeedCategory = new Map<string, string>();
  for (const { item, feedCategory } of feedItems) {
    urlToFeedCategory.set(item.url, feedCategory);
  }

  const titlesToCheck = toProcess.map((item) => item.title);
  const existingTitles = await getNewsPostTitlesIn(titlesToCheck);

  const systemUser = await getUserByEmail("system@traderstape.com");
  if (!systemUser) {
    throw new Error("System user not found. Run seed script.");
  }
  const systemUserId = systemUser.id;

  for (const item of toProcess) {
    if (existingTitles.has(item.title)) {
      stats.duplicates++;
      continue;
    }

    let category: NewsCategory;
    const feedCat = urlToFeedCategory.get(item.url) ?? "";
    switch (feedCat.toLowerCase()) {
      case "stocks":
        category = "STOCKS";
        break;
      case "crypto":
        category = "CRYPTO";
        break;
      case "forex":
        category = "FOREX";
        break;
      case "geopolitical":
        category = "GEOPOLITICAL";
        break;
      default:
        category = "STOCKS";
    }

    const content = item.summary.trim() || item.title;
    const aiReq: AiRequest = {
      action: "generate-news-roundup-summary",
      title: item.title,
      content,
      category: feedCat.toLowerCase() as AiRequest["category"],
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

    let finalCategory: NewsCategory;
    switch (data.category.toUpperCase()) {
      case "STOCKS":
        finalCategory = "STOCKS";
        break;
      case "CRYPTO":
        finalCategory = "CRYPTO";
        break;
      case "FOREX":
        finalCategory = "FOREX";
        break;
      case "GEOPOLITICAL":
        finalCategory = "GEOPOLITICAL";
        break;
      default:
        switch (feedCat.toLowerCase()) {
          case "stocks":
            finalCategory = "STOCKS";
            break;
          case "crypto":
            finalCategory = "CRYPTO";
            break;
          case "forex":
            finalCategory = "FOREX";
            break;
          case "geopolitical":
            finalCategory = "GEOPOLITICAL";
            break;
          default:
            finalCategory = "STOCKS";
        }
    }

    const slug = `${item.sourceName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")}-${Date.now()}`;

    await createNewsPost({
      title: item.title,
      slug,
      category: finalCategory,
      summary: data.summary,
      body: data.summary,
      authorId: systemUserId,
      publishedAt: item.publishedAt,
      isPublished: false,
    });
    stats.saved++;
  }

  console.log(`[News Roundup Cron] Finished: ${JSON.stringify(stats)}`);
  return { success: true, stats };
}
