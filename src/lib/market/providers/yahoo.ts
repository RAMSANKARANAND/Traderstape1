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
  { symbol: "^GSPC", name: "S&P 500" },
  { symbol: "^IXIC", name: "NASDAQ" },
  { symbol: "^DJI", name: "DOW JONES" },
  { symbol: "^N225", name: "NIKKEI 225" },
  { symbol: "^FTSE", name: "FTSE 100" },
  { symbol: "^GDAXI", name: "DAX" },
  { symbol: "^HSI", name: "HANG SENG" },
  { symbol: "^CNXAUTO", name: "AUTO" },
  { symbol: "^CNXIT", name: "IT" },
  { symbol: "^CNXPHARMA", name: "PHARMA" },
  { symbol: "^CNXFMCG", name: "FMCG" },
  { symbol: "^CNXMETAL", name: "METAL" },
  { symbol: "^CNXENERGY", name: "ENERGY" },
  { symbol: "^CNXREALTY", name: "REALTY" },
  { symbol: "^CNXPSE", name: "PSE" },
  { symbol: "^CNXMEDIA", name: "MEDIA" },
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

const YAHOO_COMMODITIES_FX = [
  { symbol: "GC=F", name: "GOLD" },
  { symbol: "SI=F", name: "SILVER" },
  { symbol: "CL=F", name: "CRUDE OIL" },
  { symbol: "EURUSD=X", name: "EUR/USD" },
  { symbol: "GBPUSD=X", name: "GBP/USD" },
  { symbol: "USDJPY=X", name: "USD/JPY" },
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

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
       const allSymbols = [...YAHOO_INDICES, ...YAHOO_STOCKS, ...YAHOO_COMMODITIES_FX];

      const fetchPromises = allSymbols.map(async ({ symbol, name }) => {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;

        const response = await fetch(url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; TradersTape/1.0)",
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          console.error(`Yahoo provider: HTTP ${response.status} for ${symbol}`);
          return null;
        }

        const data = (await response.json()) as YahooChartResponse;
        const result = data?.chart?.result?.[0];
        if (!result) {
          console.error(`Yahoo provider: no data for ${symbol}`);
          return null;
        }

        const meta = result.meta as YahooMeta | undefined;
        const price = meta?.regularMarketPrice ?? meta?.previousClose ?? 0;
        const previousClose = meta?.chartPreviousClose ?? meta?.previousClose ?? price;
        const change = price - previousClose;
        const changePercent = previousClose !== 0 ? (change / previousClose) * 100 : 0;

        const quote: MarketQuote = {
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
        };

        return { symbol, quote };
      });

      const resolved = await Promise.all(fetchPromises);

      for (const item of resolved) {
        if (item) {
          results.push(item.quote);
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        console.error("Yahoo provider: request timed out after 10 seconds");
      } else {
        console.error("Yahoo provider: failed", error);
      }
    } finally {
      clearTimeout(timeoutId);
    }

    return results;
  },
};