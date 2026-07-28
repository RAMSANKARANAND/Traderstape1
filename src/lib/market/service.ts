import type { MarketQuote } from "./types";
import { yahooProvider } from "./providers/yahoo";
import { coingeckoProvider } from "./providers/coingecko";
import { frankfurterProvider } from "./providers/frankfurter";

const providers = [yahooProvider, coingeckoProvider, frankfurterProvider];

export async function getMarketQuotes(): Promise<MarketQuote[]> {
  const results = await Promise.allSettled(providers.map((provider) => provider.fetchQuotes()));

  const quotes: MarketQuote[] = [];

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    if (result.status === "fulfilled") {
      quotes.push(...result.value);
    } else {
      console.error(`Market provider failed: ${providers[i].name}`, result.reason);
    }
  }

  return quotes;
}