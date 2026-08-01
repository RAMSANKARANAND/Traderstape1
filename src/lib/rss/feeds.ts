import { RssFeedConfig } from './types';

export const RSS_FEEDS: RssFeedConfig[] = [
  {
    name: 'Moneycontrol Markets',
    url: 'https://www.moneycontrol.com/rss/latestnews.xml',
    category: 'stocks',
    enabled: true,
    fetchIntervalMinutes: 30,
  },
  {
    name: 'Economic Times Markets',
    url: 'https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms',
    category: 'stocks',
    enabled: true,
    fetchIntervalMinutes: 30,
  },
  {
    name: 'Business Standard Markets',
    url: 'https://www.business-standard.com/rss/markets-106.rss',
    category: 'stocks',
    enabled: true,
    fetchIntervalMinutes: 30,
  },
  {
    name: 'LiveMint Markets',
    url: 'https://www.livemint.com/rss/markets',
    category: 'stocks',
    enabled: true,
    fetchIntervalMinutes: 30,
  },
  {
    name: 'CoinDesk',
    url: 'https://www.coindesk.com/arc/outboundfeeds/rss/',
    category: 'crypto',
    enabled: true,
    fetchIntervalMinutes: 15,
  },
  {
    name: 'CoinTelegraph',
    url: 'https://cointelegraph.com/rss',
    category: 'crypto',
    enabled: true,
    fetchIntervalMinutes: 15,
  },
  {
    name: 'FXStreet News',
    url: 'https://www.fxstreet.com/rss/news',
    category: 'forex',
    enabled: true,
    fetchIntervalMinutes: 15,
  },
  {
    name: 'Investing.com Forex',
    url: 'https://www.investing.com/rss/news_285.rss',
    category: 'forex',
    enabled: true,
    fetchIntervalMinutes: 15,
  },
  {
    name: 'Reuters World News',
    url: 'https://feeds.reuters.com/reuters/worldNews',
    category: 'geopolitical',
    enabled: true,
    fetchIntervalMinutes: 30,
  },
  {
    name: 'BBC World News',
    url: 'https://feeds.bbci.co.uk/news/world/rss.xml',
    category: 'geopolitical',
    enabled: true,
    fetchIntervalMinutes: 30,
  },
];

export function getEnabledFeeds(): RssFeedConfig[] {
  return RSS_FEEDS.filter((feed) => feed.enabled);
}

export function getFeedsByCategory(category: RssFeedConfig['category']): RssFeedConfig[] {
  return RSS_FEEDS.filter((feed) => feed.enabled && feed.category === category);
}