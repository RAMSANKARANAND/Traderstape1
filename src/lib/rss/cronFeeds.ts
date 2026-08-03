import { RssFeedConfig } from "./types";

export const CRON_FEEDS: RssFeedConfig[] = [
  {
    name: "RBI Press Releases",
    url: "https://www.rbi.org.in/pressreleases_rss.xml",
    category: "geopolitical",
    enabled: true,
  },
  {
    name: "RBI Notifications",
    url: "https://www.rbi.org.in/notifications_rss.xml",
    category: "geopolitical",
    enabled: true,
  },
  {
    name: "SEBI",
    url: "https://www.sebi.gov.in/sebirss.xml",
    category: "stocks",
    enabled: true,
  },
  {
    name: "Federal Reserve Press Releases",
    url: "https://www.federalreserve.gov/feeds/press_all.xml",
    category: "geopolitical",
    enabled: true,
  },
  {
    name: "Federal Reserve Monetary Policy",
    url: "https://www.federalreserve.gov/feeds/press_monetary.xml",
    category: "forex",
    enabled: true,
  },
  {
    name: "ECB Press Releases",
    url: "https://www.ecb.europa.eu/rss/press.html",
    category: "geopolitical",
    enabled: true,
  },
  {
    name: "ECB EUR/USD Reference Rate",
    url: "https://www.ecb.europa.eu/rss/fxref-usd.html",
    category: "forex",
    enabled: true,
  },
];

export function getEnabledCronFeeds(): RssFeedConfig[] {
  return CRON_FEEDS.filter((feed) => feed.enabled);
}