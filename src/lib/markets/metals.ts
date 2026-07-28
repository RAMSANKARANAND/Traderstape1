import type { MetalQuote } from "./types";

const GOLD_API_BASE = "https://api.gold-api.com";

interface GoldApiResponse {
  symbol: string;
  name: string;
  price: number;
  currency: string;
  change?: number;
  change_percent?: number;
  updated_at?: string;
}

function mapDirection(change: number): "up" | "down" | "flat" {
  if (change > 0) return "up";
  if (change < 0) return "down";
  return "flat";
}

export async function getMetals(): Promise<MetalQuote[]> {
  const results: MetalQuote[] = [];

  try {
    const response = await fetch(`${GOLD_API_BASE}/price/XAU`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      console.error(`Gold API: HTTP ${response.status}`);
      return results;
    }

    const data = (await response.json()) as GoldApiResponse | GoldApiResponse[];

    // gold-api.com returns different shapes; normalize
    const items = Array.isArray(data) ? data : [data];

    for (const item of items) {
      if (!item.price) continue;

      const change = item.change ?? 0;
      const changePercent = item.change_percent ?? 0;

      results.push({
        symbol: item.symbol ?? "XAU/USD",
        name: item.name ?? "Gold",
        price: Number(item.price.toFixed(2)),
        currency: item.currency ?? "USD",
        change: Number(change.toFixed(2)),
        changePercent: Number(changePercent.toFixed(2)),
        direction: mapDirection(change),
        source: "Gold API",
        updatedAt: item.updated_at ?? new Date().toISOString(),
      });
    }
  } catch (err) {
    console.error("Gold API: failed to fetch metals", err);
  }

  return results;
}