export interface RssFeedConfig {
  name: string;
  url: string;
  category: 'stocks' | 'crypto' | 'forex' | 'geopolitical';
  enabled: boolean;
  fetchIntervalMinutes?: number;
}

export interface RawFeedItem {
  title: string;
  link: string;
  pubDate: string;
  description?: string;
  content?: string;
  contentSnippet?: string;
  author?: string;
  categories?: string[];
  guid?: string;
  isoDate?: string;
}

export interface NormalizedFeedItem {
  title: string;
  url: string;
  publishedAt: Date;
  summary: string;
  content?: string;
  author?: string;
  categories: string[];
  sourceName: string;
  sourceUrl: string;
  guid: string;
}

export interface ParsedFeed {
  title: string;
  description: string;
  link: string;
  items: RawFeedItem[];
  feedType: 'rss2' | 'atom' | 'unknown';
}

export interface FeedFetchResult {
  success: boolean;
  feedName: string;
  items: NormalizedFeedItem[];
  error?: string;
  fetchedAt: Date;
}

export interface DedupeResult {
  unique: NormalizedFeedItem[];
  duplicatesRemoved: number;
}