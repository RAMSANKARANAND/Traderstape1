import type { MarketQuote, MarketProvider } from "../types";

interface YahooMeta {
  regularMarketPrice?: number;
  previousClose?: number;
  chartPreviousClose?: number;
  open?: number;
  dayHigh?: number;
  dayLow?: number;
  volume?: number;
  currency?: string;
  marketState?: string;
}

interface YahooResult {
  meta?: YahooMeta;
}

interface YahooChartResponse {
  chart?: {
    result?: YahooResult[];
  };
}

const YAHOO_INDICES = [
  { symbol: "^NSEI", name: "NIFTY 50" },
  { symbol: "^NSEBANK", name: "BANK NIFTY" },
  { symbol: "^BSESN", name: "SENSEX" },
  { symbol: "^INDIAVIX", name: "INDIA VIX" },
];

const YAHOO_STOCKS = [
  { symbol: "RELIANCE.NS", name: "RELIANCE" },
  { symbol: "HDFCBANK.NS", name: "HDFC BANK" },
  { symbol: "TCS.NS", name: "TCS" },
  { symbol: "INFY.NS", name: "INFOSYS" },
  { symbol: "ICICIBANK.NS", name: "ICICI BANK" },
  { symbol: "SBIN.NS", name: "SBI" },
  { symbol: "LT.NS", name: "L&T" },
  { symbol: "AXISBANK.NS", name: "AXIS BANK" },
  { symbol: "KOTAKBANK.NS", name: "KOTAK BANK" },
  { symbol: "ITC.NS", name: "ITC" },
];

function mapDirection(change: number): "up" | "down" | "flat" {
  if (change > 0) return "up";
  if (change < 0) return "down";
  return "flat";
}

function mapYahooMarketState(state?: string): MarketQuote["marketState"] {
  switch (state) {
    case "REGULAR":
      return "LIVE";
    case "PRE":
    case "PREPRE":
      return "PRE-OPEN";
    case "POST":
    case "POSTPOST":
    case "CLOSED":
      return "CLOSED";
    default:
      return undefined;
  }
}

export const yahooProvider: MarketProvider = {
  name: "yahoo",
  async fetchQuotes(): Promise<MarketQuote[]> {
    const results: MarketQuote[] = [];

    for (const { symbol, name } of YAHOO_INDICES) {
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

        const meta = result.meta as YahooMeta | undefined;
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
          provider: "Yahoo Finance",
          open: meta?.open ? Number(meta.open.toFixed(2)) : undefined,
          previousClose: meta?.previousClose ? Number(meta.previousClose.toFixed(2)) : undefined,
          dayHigh: meta?.dayHigh ? Number(meta.dayHigh.toFixed(2)) : undefined,
          dayLow: meta?.dayLow ? Number(meta.dayLow.toFixed(2)) : undefined,
          volume: meta?.volume ? Number(meta.volume) : undefined,
          currency: meta?.currency,
          marketState: mapYahooMarketState(meta?.marketState),
        });
      } catch (error) {
        console.error(`Yahoo provider: failed for ${symbol}:`, error);
      }
    }

    // Fetch individual NSE stocks
    for (const { symbol, name } of YAHOO_STOCKS) {
      try {
        const stockUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;
        const stockResponse = await fetch(stockUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; TradersTape/1.0)",
          },
        });

        if (!stockResponse.ok) {
          console.error(`Yahoo provider: HTTP ${stockResponse.status} for ${symbol}`);
          continue;
        }

        const stockData = (await stockResponse.json()) as YahooChartResponse;
        const stockResult = stockData?.chart?.result?.[0];
        if (!stockResult) {
          console.error(`Yahoo provider: no stock data for ${symbol}`);
          continue;
        }

        const stockMeta = stockResult.meta as YahooMeta | undefined;
        const stockPrice = stockMeta?.regularMarketPrice ?? stockMeta?.previousClose ?? 0;
        const stockPrevClose = stockMeta?.chartPreviousClose ?? stockMeta?.previousClose ?? stockPrice;
        const stockChange = stockPrice - stockPrevClose;
        const stockChangePercent = stockPrevClose !== 0 ? (stockChange / stockPrevClose) * 100 : 0;

        results.push({
          symbol,
          name,
          price: Number(stockPrice.toFixed(2)),
          change: Number(stockChange.toFixed(2)),
          changePercent: Number(stockChangePercent.toFixed(2)),
          direction: mapDirection(stockChange),
          updatedAt: new Date().toISOString(),
          provider: "Yahoo Finance",
          open: stockMeta?.open ? Number(stockMeta.open.toFixed(2)) : undefined,
          previousClose: stockMeta?.previousClose ? Number(stockMeta.previousClose.toFixed(2)) : undefined,
          dayHigh: stockMeta?.dayHigh ? Number(stockMeta.dayHigh.toFixed(2)) : undefined,
          dayLow: stockMeta?.dayLow ? Number(stockMeta.dayLow.toFixed(2)) : undefined,
          volume: stockMeta?.volume ? Number(stockMeta.volume) : undefined,
          currency: stockMeta?.currency,
          marketState: mapYahooMarketState(stockMeta?.marketState),
        });
      } catch (error) {
        console.error(`Yahoo provider: failed for stock ${symbol}:`, error);
      }
    }

    return results;
  },
};