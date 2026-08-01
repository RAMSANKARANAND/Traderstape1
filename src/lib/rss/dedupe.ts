import { NormalizedFeedItem, DedupeResult } from './types';

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.hash = '';
    parsed.searchParams.delete('utm_source');
    parsed.searchParams.delete('utm_medium');
    parsed.searchParams.delete('utm_campaign');
    parsed.searchParams.delete('utm_content');
    parsed.searchParams.delete('utm_term');
    parsed.searchParams.delete('ref');
    parsed.searchParams.delete('source');
    return parsed.toString();
  } catch {
    return url;
  }
}

function createDedupeKey(item: NormalizedFeedItem): string {
  const normTitle = normalizeTitle(item.title);
  const normUrl = normalizeUrl(item.url);
  return `${normTitle}|${normUrl}`;
}

export function deduplicateItems(items: NormalizedFeedItem[]): DedupeResult {
  const seen = new Set<string>();
  const unique: NormalizedFeedItem[] = [];
  let duplicatesRemoved = 0;

  for (const item of items) {
    const key = createDedupeKey(item);
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(item);
    } else {
      duplicatesRemoved++;
    }
  }

  return { unique, duplicatesRemoved };
}

export function deduplicateByUrl(items: NormalizedFeedItem[]): DedupeResult {
  const seen = new Set<string>();
  const unique: NormalizedFeedItem[] = [];
  let duplicatesRemoved = 0;

  for (const item of items) {
    const normUrl = normalizeUrl(item.url);
    if (!seen.has(normUrl)) {
      seen.add(normUrl);
      unique.push(item);
    } else {
      duplicatesRemoved++;
    }
  }

  return { unique, duplicatesRemoved };
}

export function deduplicateByTitle(items: NormalizedFeedItem[]): DedupeResult {
  const seen = new Set<string>();
  const unique: NormalizedFeedItem[] = [];
  let duplicatesRemoved = 0;

  for (const item of items) {
    const normTitle = normalizeTitle(item.title);
    if (!seen.has(normTitle)) {
      seen.add(normTitle);
      unique.push(item);
    } else {
      duplicatesRemoved++;
    }
  }

  return { unique, duplicatesRemoved };
}