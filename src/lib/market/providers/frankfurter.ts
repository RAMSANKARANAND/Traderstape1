import type { MarketQuote, MarketProvider } from "../types";

const FOREX_PAIRS = [
  { symbol: "USDINR=X", name: "USD/INR" },
  { symbol: "EURUSD=X", name: "EUR/USD" },
  { symbol: "GBPUSD=X", name: "GBP/USD" },
  { symbol: "XAUUSD=X", name: "XAU/USD" },
  { symbol: "XAGUSD=X", name: "XAG/USD" },
];

function mapDirection(change: number): "up" | "down" | "flat" {
  if (change > 0) return "up";
  if (change < 0) return "down";
  return "flat";
}

export const frankfurterProvider: MarketProvider = {
  name: "frankfurter",
  async fetchQuotes(): Promise<MarketQuote[]> {
    const results: MarketQuote[] = [];

    try {
      const symbols = FOREX_PAIRS.map((p) => p.symbol.replace("=X", "")).join(",");
      const url = `https://api.frankfurter.dev/v1/latest?base=USD&symbols=${encodeURIComponent(symbols)}`;
      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        console.error(`Frankfurter provider: HTTP ${response.status}`);
        return results;
      }

      const data = (await response.json()) as { rates?: Record<string, number>; date?: string };
      const rates = data?.rates ?? {};
      const date = data?.date ? new Date(data.date).toISOString() : new Date().toISOString();

      const pairMap: Record<string, { symbol: string; name: string; rate: number }> = {
        USDINR: { symbol: "USD/INR", name: "USD/INR", rate: rates["INR"] ?? 0 },
        EURUSD: { symbol: "EUR/USD", name: "EUR/USD", rate: rates["EUR"] ?? 0 },
        GBPUSD: { symbol: "GBP/USD", name: "GBP/USD", rate: rates["GBP"] ?? 0 },
        XAUUSD: { symbol: "XAU/USD", name: "XAU/USD", rate: rates["XAU"] ?? 0 },
        XAGUSD: { symbol: "XAG/USD", name: "XAG/USD", rate: rates["XAG"] ?? 0 },
      };

      for (const key of Object.keys(pairMap)) {
        const pair = pairMap[key];
        if (!pair.rate) {
          console.error(`Frankfurter provider: missing rate for ${key}`);
          continue;
        }

        results.push({
          symbol: pair.symbol,
          name: pair.name,
          price: Number(pair.rate.toFixed(4)),
          change: 0,
          changePercent: 0,
          direction: "flat",
          updatedAt: date,
          provider: "Frankfurter",
        });
      }
    } catch (error) {
      console.error("Frankfurter provider: failed", error);
    }

    return results;
  },
};