import { RssFeedConfig } from './types';
import { parseFeed, normalizeItems } from './parser';

const DEFAULT_HEADERS = {
  'User-Agent': 'TraderstapeBot/1.0 (+https://traderstape.com)',
  'Accept': 'application/rss+xml, application/xml, text/xml, */*',
};

export async function fetchFeed(feed: RssFeedConfig): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(feed.url, {
      headers: DEFAULT_HEADERS,
      signal: controller.signal,
      cf: {
        cacheTtl: 300,
        cacheEverything: true,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('xml') && !contentType.includes('rss')) {
      console.warn(`Feed ${feed.name} returned content-type: ${contentType}`);
    }

    return await response.text();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Fetch timeout for ${feed.name}`);
    }
    throw error;
  }
}

export async function fetchAndParseFeed(feed: RssFeedConfig): Promise<import('./types').FeedFetchResult> {
  const fetchedAt = new Date();

  try {
    const xmlText = await fetchFeed(feed);
    const parsed = parseFeed(xmlText, feed.url);
    const items = normalizeItems(parsed, feed.name, feed.url);

    return {
      success: true,
      feedName: feed.name,
      items,
      fetchedAt,
    };
  } catch (error) {
    return {
      success: false,
      feedName: feed.name,
      items: [],
      error: error instanceof Error ? error.message : 'Unknown error',
      fetchedAt,
    };
  }
}

export async function fetchAllFeeds(feeds: RssFeedConfig[] = []): Promise<import('./types').FeedFetchResult[]> {
  const feedsToFetch = feeds.length > 0 ? feeds : (await import('./feeds')).getEnabledFeeds();

  const results = await Promise.allSettled(
    feedsToFetch.map((feed) => fetchAndParseFeed(feed))
  );

  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    }
    return {
      success: false,
      feedName: feedsToFetch[index].name,
      items: [],
      error: result.reason instanceof Error ? result.reason.message : 'Unknown error',
      fetchedAt: new Date(),
    };
  });
}