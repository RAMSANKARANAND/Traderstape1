import type { MarketQuote, MarketProvider } from "../types";
import { getCloudflareContext } from "@opennextjs/cloudflare";

const COINGECKO_IDS = ["bitcoin", "ethereum", "solana", "ripple"];

function mapDirection(change: number): "up" | "down" | "flat" {
  if (change > 0) return "up";
  if (change < 0) return "down";
  return "flat";
}

const FALLBACK_QUOTES: MarketQuote[] = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    price: 0,
    change: 0,
    changePercent: 0,
    direction: "flat",
    updatedAt: new Date().toISOString(),
    provider: "CoinGecko",
    currency: "USD",
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    price: 0,
    change: 0,
    changePercent: 0,
    direction: "flat",
    updatedAt: new Date().toISOString(),
    provider: "CoinGecko",
    currency: "USD",
  },
  {
    symbol: "SOL",
    name: "Solana",
    price: 0,
    change: 0,
    changePercent: 0,
    direction: "flat",
    updatedAt: new Date().toISOString(),
    provider: "CoinGecko",
    currency: "USD",
  },
  {
    symbol: "XRP",
    name: "Ripple",
    price: 0,
    change: 0,
    changePercent: 0,
    direction: "flat",
    updatedAt: new Date().toISOString(),
    provider: "CoinGecko",
    currency: "USD",
  },
];

export const coingeckoProvider: MarketProvider = {
  name: "coingecko",
  async fetchQuotes(): Promise<MarketQuote[]> {
    const results: MarketQuote[] = [];

    try {
      // Get API key from Cloudflare environment (works in both local .dev.vars and production)
      let apiKey: string | undefined;
      try {
        const { env } = await getCloudflareContext({ async: true });
        apiKey = (env as any).COINGECKO_API_KEY as string | undefined;
      } catch {
        // Fallback for non-Cloudflare environments (should not happen in production)
        apiKey = process.env.COINGECKO_API_KEY;
      }

      const ids = COINGECKO_IDS.join(",");
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(ids)}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_24hr_high=true&include_24hr_low=true`;

      // Create AbortController for 5-second timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const headers: Record<string, string> = {
        Accept: "application/json",
      };

      // Add demo API key header if available
      if (apiKey) {
        headers["x-cg-demo-api-key"] = apiKey;
      }

      const response = await fetch(url, {
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error(`CoinGecko provider: HTTP ${response.status}`);
        return FALLBACK_QUOTES;
      }

      const data = (await response.json()) as Record<string, {
        usd?: number;
        usd_24h_change?: number;
        usd_24h_vol?: number;
        usd_24h_high?: number;
        usd_24h_low?: number;
      }>;

      const coinMap: Record<string, { symbol: string; name: string }> = {
        bitcoin: { symbol: "BTC", name: "Bitcoin" },
        ethereum: { symbol: "ETH", name: "Ethereum" },
        solana: { symbol: "SOL", name: "Solana" },
        ripple: { symbol: "XRP", name: "Ripple" },
      };

      for (const id of COINGECKO_IDS) {
        const coin = data[id];
        const meta = coinMap[id];
        if (!coin || !meta) {
          console.error(`CoinGecko provider: missing data for ${id}`);
          continue;
        }

        const price = coin.usd ?? 0;
        const changePercent = coin.usd_24h_change ?? 0;
        const change = price * (changePercent / 100);

        results.push({
          symbol: meta.symbol,
          name: meta.name,
          price: Number(price.toFixed(2)),
          change: Number(change.toFixed(2)),
          changePercent: Number(changePercent.toFixed(2)),
          direction: mapDirection(change),
          updatedAt: new Date().toISOString(),
          provider: "CoinGecko",
          previousClose: coin.usd_24h_change ? Number((price - price * (coin.usd_24h_change / 100)).toFixed(2)) : undefined,
          dayHigh: coin.usd_24h_high ? Number(coin.usd_24h_high.toFixed(2)) : undefined,
          dayLow: coin.usd_24h_low ? Number(coin.usd_24h_low.toFixed(2)) : undefined,
          volume: coin.usd_24h_vol ? Number(coin.usd_24h_vol) : undefined,
          currency: "USD",
        });
      }

      // If we got fewer results than expected, fill with fallback data
      if (results.length < COINGECKO_IDS.length) {
        const missingIds = COINGECKO_IDS.filter(id => !results.find(r => r.symbol === coinMap[id]?.symbol));
        for (const id of missingIds) {
          const fallback = FALLBACK_QUOTES.find(q => q.symbol === coinMap[id]?.symbol);
          if (fallback) {
            results.push({ ...fallback });
          }
        }
      }

      return results;
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        console.error("CoinGecko provider: request timed out after 5 seconds");
      } else {
        console.error("CoinGecko provider: failed", error);
      }
      return FALLBACK_QUOTES;
    }
  },
};