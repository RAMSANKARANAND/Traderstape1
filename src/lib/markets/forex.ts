import type { ForexQuote } from "./types";

const FOREX_PAIRS = [
  { symbol: "USD/INR", name: "USD/INR", code: "INR" },
  { symbol: "EUR/USD", name: "EUR/USD", code: "EUR" },
  { symbol: "GBP/USD", name: "GBP/USD", code: "GBP" },
];

interface ErApiResponse {
  result: string;
  base_code: string;
  rates: Record<string, number>;
  time_last_update_utc?: string;
}

interface FrankfurterResponse {
  rates?: Record<string, number>;
}

function mapDirection(change: number): "up" | "down" | "flat" {
  if (change > 0) return "up";
  if (change < 0) return "down";
  return "flat";
}

function getYesterdayDate(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}

async function fetchLatestRates(): Promise<{
  rates: Record<string, number>;
  updatedAt: string;
}> {
  const url = "https://open.er-api.com/v6/latest/USD";

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    throw new Error(`ExchangeRate API: HTTP ${response.status}`);
  }

  const data = (await response.json()) as ErApiResponse;

  if (data.result !== "success" || !data.rates) {
    throw new Error("ExchangeRate API: invalid response");
  }

  return {
    rates: data.rates,
    updatedAt: data.time_last_update_utc ?? new Date().toISOString(),
  };
}

async function fetchYesterdayRates(): Promise<Record<string, number>> {
  const yesterday = getYesterdayDate();
  const symbols = FOREX_PAIRS.map((p) => p.code).join(",");
  const url = `https://api.frankfurter.dev/v1/${yesterday}?base=USD&symbols=${encodeURIComponent(symbols)}`;

  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) return {};

    const data = (await response.json()) as FrankfurterResponse;
    return data?.rates ?? {};
  } catch {
    return {};
  }
}

export async function getForex(): Promise<ForexQuote[]> {
  const results: ForexQuote[] = [];

  try {
    const [latest, yesterdayRates] = await Promise.all([
      fetchLatestRates(),
      fetchYesterdayRates(),
    ]);

    for (const pair of FOREX_PAIRS) {
      const currentRate = latest.rates[pair.code];
      if (!currentRate) continue;

      const previousRate = yesterdayRates[pair.code];
      const change = previousRate
        ? Number((currentRate - previousRate).toFixed(4))
        : 0;
      const changePercent = previousRate
        ? Number((((currentRate - previousRate) / previousRate) * 100).toFixed(2))
        : 0;

      results.push({
        symbol: pair.symbol,
        name: pair.name,
        price: Number(currentRate.toFixed(4)),
        currency: "USD",
        change,
        changePercent,
        direction: mapDirection(change),
        source: "Open Exchange Rates",
        updatedAt: latest.updatedAt,
      });
    }
  } catch (err) {
    console.error("Forex provider: failed", err);
  }

  return results;
}