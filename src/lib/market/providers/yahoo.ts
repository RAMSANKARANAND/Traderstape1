import type { MarketQuote, MarketProvider } from "../types";

interface YahooMeta {
  regularMarketPrice?: number;
  previousClose?: number;
  chartPreviousClose?: number;
}

interface YahooResult {
  meta?: YahooMeta;
}

interface YahooChartResponse {
  chart?: {
    result?: YahooResult[];
  };
}

const YAHOO_SYMBOLS = [
  { symbol: "^NSEI", name: "NIFTY 50" },
  { symbol: "^NSEBANK", name: "BANK NIFTY" },
  { symbol: "^BSESN", name: "SENSEX" },
  { symbol: "^INDIAVIX", name: "INDIA VIX" },
];

function mapDirection(change: number): "up" | "down" | "flat" {
  if (change > 0) return "up";
  if (change < 0) return "down";
  return "flat";
}

export const yahooProvider: MarketProvider = {
  name: "yahoo",
  async fetchQuotes(): Promise<MarketQuote[]> {
    const results: MarketQuote[] = [];

    for (const { symbol, name } of YAHOO_SYMBOLS) {
      try {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;
        const response = await fetch(url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; TradersTape/1.0)",
          },
        });

        if (!response.ok) {
          console.error(`Yahoo provider: HTTP ${response.status} for ${symbol}`);
          continue;
        }

        const data = (await response.json()) as YahooChartResponse;
        const result = data?.chart?.result?.[0];
        if (!result) {
          console.error(`Yahoo provider: no data for ${symbol}`);
          continue;
        }

        const meta = result.meta;
        const price = meta?.regularMarketPrice ?? meta?.previousClose ?? 0;
        const previousClose = meta?.chartPreviousClose ?? meta?.previousClose ?? price;
        const change = price - previousClose;
        const changePercent = previousClose !== 0 ? (change / previousClose) * 100 : 0;

        results.push({
          symbol,
          name,
          price: Number(price.toFixed(2)),
          change: Number(change.toFixed(2)),
          changePercent: Number(changePercent.toFixed(2)),
          direction: mapDirection(change),
          updatedAt: new Date().toISOString(),
        });
      } catch (error) {
        console.error(`Yahoo provider: failed for ${symbol}:`, error);
      }
    }

    return results;
  },
};