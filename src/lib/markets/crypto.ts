import type { CryptoQuote } from "./types";

const COINGECKO_IDS = ["bitcoin", "ethereum"];

interface CoinGeckoCoin {
  usd?: number;
  usd_24h_change?: number;
  usd_24h_vol?: number;
  usd_24h_high?: number;
  usd_24h_low?: number;
}

function mapDirection(change: number): "up" | "down" | "flat" {
  if (change > 0) return "up";
  if (change < 0) return "down";
  return "flat";
}

export async function getCrypto(): Promise<CryptoQuote[]> {
  const results: CryptoQuote[] = [];

  try {
    const ids = COINGECKO_IDS.join(",");
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(ids)}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_24hr_high=true&include_24hr_low=true`;

    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      console.error(`Crypto provider: HTTP ${response.status}`);
      return results;
    }

    const data = (await response.json()) as Record<string, CoinGeckoCoin>;

    const coinMap: Record<string, { symbol: string; name: string }> = {
      bitcoin: { symbol: "BTC", name: "Bitcoin" },
      ethereum: { symbol: "ETH", name: "Ethereum" },
    };

    for (const id of COINGECKO_IDS) {
      const coin = data[id];
      const meta = coinMap[id];
      if (!coin || !meta) continue;

      const price = coin.usd ?? 0;
      const changePercent = coin.usd_24h_change ?? 0;
      const change = price * (changePercent / 100);

      results.push({
        symbol: meta.symbol,
        name: meta.name,
        price: Number(price.toFixed(2)),
        currency: "USD",
        change: Number(change.toFixed(2)),
        changePercent: Number(changePercent.toFixed(2)),
        direction: mapDirection(change),
        source: "CoinGecko",
        updatedAt: new Date().toISOString(),
        dayHigh: coin.usd_24h_high ? Number(coin.usd_24h_high.toFixed(2)) : undefined,
        dayLow: coin.usd_24h_low ? Number(coin.usd_24h_low.toFixed(2)) : undefined,
        volume: coin.usd_24h_vol ? Number(coin.usd_24h_vol) : undefined,
      });
    }
  } catch (err) {
    console.error("Crypto provider: failed", err);
  }

  return results;
}