import type { MarketQuote, MarketProvider } from "../types";

const COINGECKO_IDS = ["bitcoin", "ethereum"];

function mapDirection(change: number): "up" | "down" | "flat" {
  if (change > 0) return "up";
  if (change < 0) return "down";
  return "flat";
}

export const coingeckoProvider: MarketProvider = {
  name: "coingecko",
  async fetchQuotes(): Promise<MarketQuote[]> {
    const results: MarketQuote[] = [];

    try {
      const ids = COINGECKO_IDS.join(",");
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(ids)}&vs_currencies=usd&include_24hr_change=true`;
      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        console.error(`CoinGecko provider: HTTP ${response.status}`);
        return results;
      }

      const data = (await response.json()) as Record<string, { usd?: number; usd_24h_change?: number }>;

      const coinMap: Record<string, { symbol: string; name: string }> = {
        bitcoin: { symbol: "BTC", name: "Bitcoin" },
        ethereum: { symbol: "ETH", name: "Ethereum" },
      };

      for (const id of COINGECKO_IDS) {
        const coin = data[id];
        const meta = coinMap[id];
        if (!coin || !meta) {
          console.error(`CoinGecko provider: missing data for ${id}`);
          continue;
        }

        const price = coin.usd ?? 0;
        const changePercent = coin.usd_24h_change ?? 0;
        const change = price * (changePercent / 100);

        results.push({
          symbol: meta.symbol,
          name: meta.name,
          price: Number(price.toFixed(2)),
          change: Number(change.toFixed(2)),
          changePercent: Number(changePercent.toFixed(2)),
          direction: mapDirection(change),
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("CoinGecko provider: failed", error);
    }

    return results;
  },
};