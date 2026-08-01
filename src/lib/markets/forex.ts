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

function mapDirection(change: number): "up" | "down" | "flat" {
  if (change > 0) return "up";
  if (change < 0) return "down";
  return "flat";
}

// In-memory cache for previous rates to calculate changes
// Persists across requests in the same Cloudflare Worker instance
let previousRatesCache: Record<string, number> | null = null;
let previousCacheTime: number = 0;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

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

function updateCache(rates: Record<string, number>): void {
  previousRatesCache = { ...rates };
  previousCacheTime = Date.now();
}

function getCachedRates(): Record<string, number> | null {
  if (!previousRatesCache) return null;
  if (Date.now() - previousCacheTime > CACHE_TTL_MS) {
    previousRatesCache = null;
    return null;
  }
  return previousRatesCache;
}

export async function getForex(): Promise<ForexQuote[]> {
  const results: ForexQuote[] = [];

  try {
    const latest = await fetchLatestRates();
    const cachedRates = getCachedRates();

    // Update cache for next request
    updateCache(latest.rates);

    for (const pair of FOREX_PAIRS) {
      const currentRate = latest.rates[pair.code];
      if (!currentRate) continue;

      const previousRate = cachedRates?.[pair.code];
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
        source: "ExchangeRate API",
        updatedAt: latest.updatedAt,
      });
    }
  } catch (err) {
    console.error("Forex provider: failed", err);
  }

  return results;
}