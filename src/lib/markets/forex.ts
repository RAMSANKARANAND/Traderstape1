import type { ForexQuote } from "./types";

const FOREX_PAIRS = [
  { symbol: "USDINR", name: "USD/INR" },
  { symbol: "EURUSD", name: "EUR/USD" },
  { symbol: "GBPUSD", name: "GBP/USD" },
];

function mapDirection(change: number): "up" | "down" | "flat" {
  if (change > 0) return "up";
  if (change < 0) return "down";
  return "flat";
}

export async function getForex(): Promise<ForexQuote[]> {
  const results: ForexQuote[] = [];

  try {
    const symbols = FOREX_PAIRS.map((p) => p.symbol).join(",");
    const url = `https://api.frankfurter.dev/v1/latest?base=USD&symbols=${encodeURIComponent(symbols)}`;

    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      console.error(`Forex provider: HTTP ${response.status}`);
      return results;
    }

    const data = (await response.json()) as { rates?: Record<string, number>; date?: string };
    const rates = data?.rates ?? {};
    const date = data?.date ? new Date(data.date).toISOString() : new Date().toISOString();

    const pairMap: Record<string, { symbol: string; name: string; rate: number }> = {
      USDINR: { symbol: "USD/INR", name: "USD/INR", rate: rates["INR"] ?? 0 },
      EURUSD: { symbol: "EUR/USD", name: "EUR/USD", rate: rates["EUR"] ?? 0 },
      GBPUSD: { symbol: "GBP/USD", name: "GBP/USD", rate: rates["GBP"] ?? 0 },
    };

    for (const key of Object.keys(pairMap)) {
      const pair = pairMap[key];
      if (!pair.rate) continue;

      results.push({
        symbol: pair.symbol,
        name: pair.name,
        price: Number(pair.rate.toFixed(4)),
        currency: "USD",
        change: 0,
        changePercent: 0,
        direction: "flat",
        source: "Frankfurter",
        updatedAt: date,
      });
    }
  } catch (err) {
    console.error("Forex provider: failed", err);
  }

  return results;
}