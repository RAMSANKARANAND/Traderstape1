import type { MarketQuote } from "./types";
import { yahooProvider } from "./providers/yahoo";
import { coingeckoProvider } from "./providers/coingecko";
import { cloudflareForexProvider } from "./providers/cloudflare-forex";
import { getMarketSession } from "./market-session";

const providers = [yahooProvider, coingeckoProvider, cloudflareForexProvider];

export async function getMarketQuotes(): Promise<MarketQuote[]> {
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

  return quotes;
}
