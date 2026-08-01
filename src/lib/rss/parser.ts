import { ParsedFeed, RawFeedItem } from './types';

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

function parseRss2(doc: Document): ParsedFeed {
  const channel = doc.getElementsByTagName('channel')[0];
  const items = Array.from(channel?.getElementsByTagName('item') || []);

  return {
    title: getTextContent(channel!, 'title'),
    description: getTextContent(channel!, 'description'),
    link: getTextContent(channel!, 'link'),
    feedType: 'rss2',
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

function parseAtom(doc: Document): ParsedFeed {
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
    feedType: 'atom',
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

export function parseFeed(xmlText: string, feedUrl: string): ParsedFeed {
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

  throw new Error(`Unknown feed format at ${feedUrl}. Root element: ${rootName}`);
}

export function normalizeItems(parsed: ParsedFeed, sourceName: string, sourceUrl: string): import('./types').NormalizedFeedItem[] {
  return parsed.items.map((item) => ({
    title: item.title || 'Untitled',
    url: item.link || item.guid || '',
    publishedAt: parseDate(item.pubDate || item.isoDate || ''),
    summary: cleanHtml(item.contentSnippet || item.description || ''),
    content: item.content ? cleanHtml(item.content) : undefined,
    author: item.author || undefined,
    categories: item.categories || [],
    sourceName,
    sourceUrl,
    guid: item.guid || item.link || item.title,
  })).filter((item) => item.url && item.title);
}