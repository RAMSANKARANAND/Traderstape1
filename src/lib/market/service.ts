import type { MarketQuote } from "./types";
import { yahooProvider } from "./providers/yahoo";
import { coingeckoProvider } from "./providers/coingecko";
import { currencyApiProvider } from "./providers/currency-api";
import { getMetals } from "@/lib/markets/metals";
import { getMarketSession } from "./market-session";

const metalsProvider: import("./types").MarketProvider = {
  name: "Gold API",
  async fetchQuotes() {
    try {
      const metals = await getMetals();
      return metals.map(m => ({
        symbol: m.symbol.startsWith("XAU") ? "GOLD" : "SILVER",
        name: m.name,
        price: m.price,
        change: m.change,
        changePercent: m.changePercent,
        direction: m.direction,
        updatedAt: m.updatedAt || new Date().toISOString(),
        provider: "Gold API",
        currency: m.currency,
      }));
    } catch (error) {
      console.error("Metals fetch error:", error);
      return [];
    }
  },
};

const providers = [yahooProvider, coingeckoProvider, currencyApiProvider, metalsProvider];

let cache: { quotes: MarketQuote[]; timestamp: number } | null = null;
const CACHE_TTL = 30_000; // 30 seconds

export async function getMarketQuotes(): Promise<MarketQuote[]> {
  const now = Date.now();

  if (cache && now - cache.timestamp < CACHE_TTL) {
    return cache.quotes;
  }

  const results = await Promise.allSettled(providers.map((provider) => provider.fetchQuotes()));

  const quotes: MarketQuote[] = [];

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    if (result.status === "fulfilled") {
      const providerQuotes = result.value;
      for (const quote of providerQuotes) {
        quotes.push({
          ...quote,
          marketState: quote.marketState || getMarketSession(quote.symbol),
        });
      }
    } else {
      console.error(`Market provider failed: ${providers[i].name}`, result.reason);
    }
  }

  cache = { quotes, timestamp: now };

  return quotes;
}

export function invalidateMarketCache() {
  cache = null;
}
