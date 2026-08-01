export type NewsCategory = 'stocks' | 'crypto' | 'forex' | 'geopolitical';

export type SourceType = 'rss' | 'api' | 'scraper';

export interface NewsSource {
  id: string;
  name: string;
  type: SourceType;
  url: string;
  category: NewsCategory;
  country: string;
  official: boolean;
  attributionRequired: boolean;
  enabled: boolean;
  refreshMinutes: number;
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
  sourceId: string;
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
  sourceId: string;
  sourceName: string;
  items: NormalizedFeedItem[];
  error?: string;
  fetchedAt: Date;
}

export interface ValidationResult {
  success: boolean;
  sourceId: string;
  statusCode?: number;
  contentType?: string;
  itemCount?: number;
  error?: string;
  validatedAt: Date;
}

export interface PipelineResult {
  sourceId: string;
  success: boolean;
  validated: boolean;
  items: NormalizedFeedItem[];
  validationError?: string;
  fetchError?: string;
  processedAt: Date;
}