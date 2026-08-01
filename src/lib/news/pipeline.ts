import { NewsSource, PipelineResult, NormalizedFeedItem, FeedFetchResult } from './types';
import { validateSource } from './rss/validator';

const DEFAULT_HEADERS = {
  'User-Agent': 'TraderstapeNewsBot/1.0 (+https://traderstape.com)',
  'Accept': 'application/rss+xml, application/xml, text/xml, */*',
};

function parseDate(dateStr: string): Date {
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? new Date() : date;
}

function cleanHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function getTextContent(element: Element, tagName: string): string {
  const child = element.getElementsByTagName(tagName)[0];
  return child?.textContent?.trim() || '';
}

function parseRss2(doc: Document) {
  const channel = doc.getElementsByTagName('channel')[0];
  const items = Array.from(channel?.getElementsByTagName('item') || []);

  return {
    title: getTextContent(channel!, 'title'),
    description: getTextContent(channel!, 'description'),
    link: getTextContent(channel!, 'link'),
    feedType: 'rss2' as const,
    items: items.map((item) => ({
      title: getTextContent(item, 'title'),
      link: getTextContent(item, 'link'),
      pubDate: getTextContent(item, 'pubDate'),
      description: getTextContent(item, 'description'),
      content: getTextContent(item, 'content:encoded') || getTextContent(item, 'content'),
      contentSnippet: getTextContent(item, 'description'),
      author: getTextContent(item, 'author') || getTextContent(item, 'dc:creator'),
      categories: Array.from(item.getElementsByTagName('category')).map((c) => c.textContent?.trim() || '').filter(Boolean),
      guid: getTextContent(item, 'guid') || getTextContent(item, 'link'),
      isoDate: getTextContent(item, 'pubDate'),
    })),
  };
}

function parseAtom(doc: Document) {
  const feed = doc.getElementsByTagName('feed')[0];
  const entries = Array.from(feed?.getElementsByTagName('entry') || []);

  const getLink = (entry: Element): string => {
    const links = entry.getElementsByTagName('link');
    for (let i = 0; i < links.length; i++) {
      const rel = links[i].getAttribute('rel');
      if (rel === 'alternate' || rel === null) {
        return links[i].getAttribute('href') || '';
      }
    }
    return '';
  };

  return {
    title: getTextContent(feed!, 'title'),
    description: getTextContent(feed!, 'subtitle') || getTextContent(feed!, 'description'),
    link: getLink(feed!),
    feedType: 'atom' as const,
    items: entries.map((entry) => {
      const contentEl = entry.getElementsByTagName('content')[0];
      const summaryEl = entry.getElementsByTagName('summary')[0];

      return {
        title: getTextContent(entry, 'title'),
        link: getLink(entry),
        pubDate: getTextContent(entry, 'published') || getTextContent(entry, 'updated'),
        description: summaryEl ? cleanHtml(summaryEl.textContent || '') : '',
        content: contentEl ? cleanHtml(contentEl.textContent || '') : '',
        contentSnippet: summaryEl ? cleanHtml(summaryEl.textContent || '') : '',
        author: getTextContent(entry.getElementsByTagName('author')[0] || entry, 'name'),
        categories: Array.from(entry.getElementsByTagName('category')).map((c) => c.getAttribute('term') || c.textContent?.trim() || '').filter(Boolean),
        guid: getTextContent(entry, 'id') || getLink(entry),
        isoDate: getTextContent(entry, 'published') || getTextContent(entry, 'updated'),
      };
    }),
  };
}

function parseFeed(xmlText: string) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, 'application/xml');

  const parseError = doc.getElementsByTagName('parsererror')[0];
  if (parseError) {
    throw new Error(`XML Parse Error: ${parseError.textContent}`);
  }

  const root = doc.documentElement;
  const rootName = root.tagName.toLowerCase();

  if (rootName === 'rss' || root.getElementsByTagName('channel').length > 0) {
    return parseRss2(doc);
  }

  if (rootName === 'feed' || root.getElementsByTagName('entry').length > 0) {
    return parseAtom(doc);
  }

  throw new Error(`Unknown feed format. Root element: ${rootName}`);
}

function normalizeItems(parsed: ReturnType<typeof parseFeed>, source: { id: string; name: string; url: string }): NormalizedFeedItem[] {
  return parsed.items.map((item) => ({
    title: item.title || 'Untitled',
    url: item.link || item.guid || '',
    publishedAt: parseDate(item.pubDate || item.isoDate || ''),
    summary: cleanHtml(item.contentSnippet || item.description || ''),
    content: item.content ? cleanHtml(item.content) : undefined,
    author: item.author || undefined,
    categories: item.categories || [],
    sourceId: source.id,
    sourceName: source.name,
    sourceUrl: source.url,
    guid: item.guid || item.link || item.title,
  })).filter((item) => item.url && item.title);
}

async function fetchFeed(source: NewsSource): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(source.url, {
      headers: {
        'User-Agent': 'TraderstapeNewsBot/1.0 (+https://traderstape.com)',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.text();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Fetch timeout for ${source.name}`);
    }
    throw error;
  }
}

async function fetchAndParseSource(source: NewsSource): Promise<FeedFetchResult> {
  const fetchedAt = new Date();

  try {
    const xmlText = await fetchFeed(source);
    const parsed = parseFeed(xmlText);
    const items = normalizeItems(parsed, source);

    return {
      success: true,
      sourceId: source.id,
      sourceName: source.name,
      items,
      fetchedAt,
    };
  } catch (error) {
    return {
      success: false,
      sourceId: source.id,
      sourceName: source.name,
      items: [],
      error: error instanceof Error ? error.message : 'Unknown error',
      fetchedAt,
    };
  }
}

export async function processSource(source: NewsSource): Promise<PipelineResult> {
  const processedAt = new Date();

  const validation = await validateSource(source);
  if (!validation.success) {
    return {
      sourceId: source.id,
      success: false,
      validated: false,
      items: [],
      validationError: validation.error,
      processedAt,
    };
  }

  const fetchResult = await fetchAndParseSource(source);

  return {
    sourceId: source.id,
    success: fetchResult.success,
    validated: true,
    items: fetchResult.items,
    fetchError: fetchResult.error,
    processedAt,
  };
}

export async function processAllSources(sources: NewsSource[]): Promise<PipelineResult[]> {
  return Promise.all(sources.map((source) => processSource(source)));
}

export async function processSourcesByCategory(sources: NewsSource[], category: NewsSource['category']): Promise<PipelineResult[]> {
  const categorySources = sources.filter((s) => s.category === category && s.enabled);
  return processAllSources(categorySources);
}

export async function processAllEnabledSources(sources: NewsSource[]): Promise<PipelineResult[]> {
  const enabledSources = sources.filter((s) => s.enabled);
  return processAllSources(enabledSources);
}