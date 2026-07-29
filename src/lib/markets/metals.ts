import type { MetalQuote } from "./types";

const GOLD_API_BASE = "https://api.gold-api.com";

interface GoldApiItem {
  symbol?: string;
  name?: string;
  price?: number;
  currency?: string;
  change?: number;
  change_percent?: number;
  updated_at?: string;
}

function mapDirection(change: number): "up" | "down" | "flat" {
  if (change > 0) return "up";
  if (change < 0) return "down";
  return "flat";
}

async function fetchMetal(symbol: string, name: string): Promise<MetalQuote | null> {
  try {
    const response = await fetch(`${GOLD_API_BASE}/price/${symbol}`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      console.error(`Gold API (${symbol}): HTTP ${response.status}`);
      return null;
    }

    const data = (await response.json()) as GoldApiItem | GoldApiItem[];

    // gold-api.com returns different shapes; normalize
    const items = Array.isArray(data) ? data : [data];

    for (const item of items) {
      if (!item.price) continue;

      const change = item.change ?? 0;
      const changePercent = item.change_percent ?? 0;

      return {
        symbol: item.symbol ?? symbol,
        name: item.name ?? name,
        price: Number(item.price.toFixed(2)),
        currency: item.currency ?? "INR",
        change: Number(change.toFixed(2)),
        changePercent: Number(changePercent.toFixed(2)),
        direction: mapDirection(change),
        source: "Gold API",
        updatedAt: item.updated_at ?? new Date().toISOString(),
      };
    }

    return null;
  } catch (err) {
    console.error(`Gold API (${symbol}): failed`, err);
    return null;
  }
}

export async function getMetals(): Promise<MetalQuote[]> {
  const results: MetalQuote[] = [];

  const [gold, silver] = await Promise.all([
    fetchMetal("XAU", "Gold"),
    fetchMetal("XAG", "Silver"),
  ]);

  if (gold) results.push(gold);
  if (silver) results.push(silver);

  return results;
}