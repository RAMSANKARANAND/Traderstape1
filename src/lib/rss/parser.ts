import { ParsedFeed, RawFeedItem, NormalizedFeedItem } from './types';
import { XMLParser } from 'fast-xml-parser';

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

// Helper to get text content from an element that might be a string or an object (if it has attributes)
function getTextContent(element: any): string {
  if (typeof element === 'string') {
    return element;
  }
  // If it's an object with a "#text" property (fast-xml-parser can put text there if there are attributes?)
  // Actually with our options, text content is stored directly as the value if no attributes? 
  // But we set ignoreAttributes: false, attributeNamePrefix: "@_", so text content is in the property with key being the element name? 
  // Actually fast-xml-parser by default stores text content in the property with the same name as the element, but if there are attributes, it stores text in "#text".
  // We'll check for "#text" first, then if the element is a plain string, use that, otherwise if it's an object we try to get the value of the key that is not starting with "@_".
  // Simpler: if it's a string, return it; if it's an object and has "#text", return that; else if it's an object, we might need to concatenate all text? 
  // For safety, we'll just return empty string if we can't determine.
  if (element && typeof element === 'object') {
    if (element['#text']) {
      return element['#text'];
    }
    // If there's only one key that is not starting with "@_", assume that's the text content?
    const keys = Object.keys(element).filter(k => !k.startsWith('@_'));
    if (keys.length === 1 && typeof element[keys[0]] === 'string') {
      return element[keys[0]];
    }
    // Fallback: join all string values?
    return Object.values(element).filter(v => typeof v === 'string').join(' ');
  }
  return '';
}

// Helper to get attribute value
function getAttribute(element: any, attributeName: string): string {
  if (element && typeof element === 'object') {
    const attrKey = `@_${attributeName}`;
    if (element[attrKey]) {
      return element[attrKey];
    }
  }
  return '';
}

function parseRss2(channel: any): ParsedFeed {
  // channel is the parsed channel object
  const title = getTextContent(channel.title);
  const description = getTextContent(channel.description);
  const link = getTextContent(channel.link);

  // Ensure items is an array
  let itemsArray: any[] = [];
  if (channel.item) {
    itemsArray = Array.isArray(channel.item) ? channel.item : [channel.item];
  }

  const items = itemsArray.map((item: any) => ({
    title: getTextContent(item.title),
    link: getTextContent(item.link),
    pubDate: getTextContent(item.pubDate),
    description: getTextContent(item.description),
    content: getTextContent(item['content:encoded']) || getTextContent(item.content),
    contentSnippet: getTextContent(item.description),
    author: getTextContent(item.author) || getTextContent(item['dc:creator']),
    categories: Array.isArray(item.category) 
      ? item.category.map((cat: any) => getTextContent(cat)).filter(Boolean)
      : item.category 
        ? [getTextContent(item.category)].filter(Boolean) 
        : [],
    guid: getTextContent(item.guid) || getTextContent(item.link),
    isoDate: getTextContent(item.pubDate),
  }));

  return {
    title,
    description,
    link,
    feedType: 'rss2',
    items,
  };
}

function parseAtom(feed: any): ParsedFeed {
  // feed is the parsed feed object
  const title = getTextContent(feed.title);
  const description = getTextContent(feed.subtitle) || getTextContent(feed.description);
  
  // Find the best link: rel="alternate" or first link
  let link = '';
  if (feed.link) {
    const links = Array.isArray(feed.link) ? feed.link : [feed.link];
    const alternateLink = links.find((l: any) => getAttribute(l, 'rel') === 'alternate');
    if (alternateLink) {
      link = getAttribute(alternateLink, 'href');
    } else if (links.length > 0) {
      // fallback to first link's href
      link = getAttribute(links[0], 'href');
    }
  }

  // Ensure entries is an array
  let entriesArray: any[] = [];
  if (feed.entry) {
    entriesArray = Array.isArray(feed.entry) ? feed.entry : [feed.entry];
  }

  const items = entriesArray.map((entry: any) => {
    // For Atom, published/updated
    const pubDate = getTextContent(entry.published) || getTextContent(entry.updated);
    
    // Summary and content
    const summaryEl = entry.summary;
    const contentEl = entry.content;
    
    // Author: could be a string or an object with name
    let author = '';
    if (entry.author) {
      if (typeof entry.author === 'string') {
        author = entry.author;
      } else if (entry.author.name) {
        author = getTextContent(entry.author.name);
      } else {
        author = getTextContent(entry.author);
      }
    }
    
    // Categories: each category may have a term attribute
    let categories: string[] = [];
    if (entry.category) {
      const cats = Array.isArray(entry.category) ? entry.category : [entry.category];
      categories = cats.map((cat: any) => {
        // If it's an object with @_term attribute, use that; else treat as text
        if (cat && typeof cat === 'object') {
          return getAttribute(cat, 'term') || getTextContent(cat);
        }
        return getTextContent(cat);
      }).filter(Boolean);
    }
    
    // Guid: usually the id element
    const guid = getTextContent(entry.id) || getLinkFromEntry(entry);
    
    return {
      title: getTextContent(entry.title),
      link: getLinkFromEntry(entry),
      pubDate,
      description: summaryEl ? cleanHtml(getTextContent(summaryEl)) : '',
      content: contentEl ? cleanHtml(getTextContent(contentEl)) : '',
      contentSnippet: summaryEl ? cleanHtml(getTextContent(summaryEl)) : '',
      author,
      categories,
      guid,
      isoDate: pubDate,
    };
  });

  return {
    title,
    description,
    link,
    feedType: 'atom',
    items,
  };
}

// Helper to extract link from an Atom entry (similar to the getLink function in original)
function getLinkFromEntry(entry: any): string {
  if (entry.link) {
    const links = Array.isArray(entry.link) ? entry.link : [entry.link];
    const alternateLink = links.find((l: any) => getAttribute(l, 'rel') === 'alternate');
    if (alternateLink) {
      return getAttribute(alternateLink, 'href');
    }
    if (links.length > 0) {
      return getAttribute(links[0], 'href');
    }
  }
  return '';
}

export function parseFeed(xmlText: string, feedUrl: string): ParsedFeed {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    // Ensure these tags are always arrays
    isArray: (name) => ['item', 'entry', 'category', 'link'].includes(name),
  });
  const parsed = parser.parse(xmlText);
  
  if (parsed.rss?.channel) {
    return parseRss2(parsed.rss.channel);
  }
  if (parsed.feed) {
    return parseAtom(parsed.feed);
  }
  throw new Error(`Unknown feed format at ${feedUrl}`);
}

export function normalizeItems(parsed: ParsedFeed, sourceName: string, sourceUrl: string): NormalizedFeedItem[] {
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