import { NewsSource, ValidationResult } from '../types';

const DEFAULT_HEADERS = {
  'User-Agent': 'TraderstapeNewsBot/1.0 (+https://traderstape.com)',
  'Accept': 'application/rss+xml, application/xml, text/xml, */*',
};

function isValidContentType(contentType: string): boolean {
  const validTypes = [
    'application/rss+xml',
    'application/xml',
    'text/xml',
    'application/atom+xml',
    'application/rdf+xml',
  ];
  return validTypes.some((type) => contentType.toLowerCase().includes(type.toLowerCase()));
}

function estimateItemCount(xmlText: string): number {
  const itemMatches = xmlText.match(/<item[^>]*>/gi);
  const entryMatches = xmlText.match(/<entry[^>]*>/gi);
  return (itemMatches?.length || 0) + (entryMatches?.length || 0);
}

export async function validateSource(source: NewsSource): Promise<ValidationResult> {
  const validatedAt = new Date();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(source.url, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'TraderstapeNewsBot/1.0 (+https://traderstape.com)',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        success: false,
        sourceId: source.id,
        statusCode: response.status,
        error: `HTTP ${response.status}: ${response.statusText}`,
        validatedAt,
      };
    }

    const contentType = response.headers.get('content-type') || '';
    if (!isValidContentType(contentType)) {
      return {
        success: false,
        sourceId: source.id,
        statusCode: response.status,
        contentType,
        error: `Invalid content-type: ${contentType}`,
        validatedAt,
      };
    }

    const getResponse = await fetch(source.url, {
      method: 'GET',
      headers: {
        'User-Agent': 'TraderstapeNewsBot/1.0 (+https://traderstape.com)',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!getResponse.ok) {
      return {
        success: false,
        sourceId: source.id,
        statusCode: getResponse.status,
        error: `GET failed: ${getResponse.status}`,
        validatedAt,
      };
    }

    const xmlText = await getResponse.text();
    const itemCount = estimateItemCount(xmlText);

    if (itemCount === 0) {
      return {
        success: false,
        sourceId: source.id,
        statusCode: getResponse.status,
        contentType,
        error: 'No items found in feed',
        validatedAt,
      };
    }

    return {
      success: true,
      sourceId: source.id,
      statusCode: getResponse.status,
      contentType,
      itemCount,
      validatedAt,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        success: false,
        sourceId: source.id,
        error: 'Validation timeout',
        validatedAt,
      };
    }
    return {
      success: false,
      sourceId: source.id,
      error: error instanceof Error ? error.message : 'Validation failed',
      validatedAt,
    };
  }
}

export async function validateSources(sources: NewsSource[]): Promise<ValidationResult[]> {
  return Promise.all(sources.map((source) => validateSource(source)));
}

export async function validateAndFilterSources(sources: NewsSource[]): Promise<NewsSource[]> {
  const results = await validateSources(sources);
  const validSourceIds = new Set(
    results.filter((r) => r.success).map((r) => r.sourceId)
  );
  return sources.filter((s) => validSourceIds.has(s.id));
}