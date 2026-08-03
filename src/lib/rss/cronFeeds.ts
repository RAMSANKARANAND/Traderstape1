import { RssFeedConfig } from "./types";

// Empty array for approved RSS feed URLs for the news roundup cron job.
// Add approved feed URLs here as objects matching RssFeedConfig.
// The cron job will only process feeds where enabled === true.
export const CRON_FEEDS: RssFeedConfig[] = [];

export function getEnabledCronFeeds(): RssFeedConfig[] {
  return CRON_FEEDS.filter((feed) => feed.enabled);
}