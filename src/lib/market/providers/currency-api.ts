import type { MarketQuote, MarketProvider } from "../types";

interface CurrencyApiResponse {
  data: Record<string, {
    code: string;
    value: number;
  }>;
}

const CURRENCY_PAIRS = {
  USDINR: { name: "USD/INR", symbol: "USDINR", currency: "INR" },
  EURUSD: { name: "EUR/USD", symbol: "EURUSD", currency: "USD" },
  GBPUSD: { name: "GBP/USD", symbol: "GBPUSD", currency: "USD" },
};

let previousRates: Record<string, number> | null = null;
let previousCacheTime: number = 0;
const PREV_RATE_TTL = 24 * 60 * 60 * 1000; // 24 hours

function mapDirection(change: number): "up" | "down" | "flat" {
  if (change > 0) return "up";
  if (change < 0) return "down";
  return "flat";
}

function getPreviousRate(symbol: string): number | null {
  if (!previousRates) return null;
  if (Date.now() - previousCacheTime > PREV_RATE_TTL) {
    previousRates = null;
    return null;
  }
  return previousRates[symbol] ?? null;
}

function setPreviousRate(symbol: string, rate: number): void {
  if (!previousRates) previousRates = {};
  previousRates[symbol] = rate;
  previousCacheTime = Date.now();
}

function getFallbackForexQuotes(): MarketQuote[] {
    const now = new Date().toISOString();
    return [
      {
        symbol: "INRUSD",
        name: "INR/USD",
        price: Number((1 / 83.45).toFixed(4)), // ~0.0120
        change: 0, // fallback: no change data
        changePercent: 0,
        direction: "flat",
        updatedAt: now,
        provider: "CurrencyAPI (Fallback)",
        currency: "USD",
      },
      {
        symbol: "EURUSD",
        name: "EUR/USD",
        price: 1.0921,
        change: -0.0002,
        changePercent: -0.02,
        direction: "down",
        updatedAt: now,
        provider: "CurrencyAPI (Fallback)",
        currency: "USD",
      },
      {
        symbol: "GBPUSD",
        name: "GBP/USD",
        price: 1.2745,
        change: 0.001,
        changePercent: 0.08,
        direction: "up",
        updatedAt: now,
        provider: "CurrencyAPI (Fallback)",
        currency: "USD",
      },
    ];
  }

export const currencyApiProvider: MarketProvider = {
  name: "CurrencyAPI",
  async fetchQuotes(): Promise<MarketQuote[]> {
    const apiKey = process.env.CURRENCY_API_KEY;

    if (!apiKey) {
      console.warn("CurrencyAPI: API key not configured, using fallback");
      return getFallbackForexQuotes();
    }

    try {
      const url = new URL("https://api.currencyapi.com/v3/latest");
      url.searchParams.append("apikey", apiKey);
      url.searchParams.append("base_currency", "USD");
      url.searchParams.append("currencies", "INR,EUR,GBP");

      const response = await fetch(url.toString(), {
        signal: AbortSignal.timeout(8000),
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: CurrencyApiResponse = await response.json();

      const quotes: MarketQuote[] = [];
      const currentTime = new Date().toISOString();

      if (data.data.INR) {
        const rate = data.data.INR.value; // INR per 1 USD
        const invertedRate = 1 / rate;    // USD per 1 INR
        const prev = getPreviousRate("INRUSD");
        const change = prev ? invertedRate - prev : 0;
        const changePercent = prev ? (change / prev) * 100 : 0;
        quotes.push({
          symbol: "INRUSD",
          name: "INR/USD",
          price: Number(invertedRate.toFixed(4)),
          change: Number(change.toFixed(4)),
          changePercent: Number(changePercent.toFixed(2)),
          direction: mapDirection(change),
          updatedAt: currentTime,
          provider: "CurrencyAPI",
          currency: "USD",
        });
        setPreviousRate("INRUSD", invertedRate);
      }

      if (data.data.EUR) {
        const rate = data.data.EUR.value;
        const eurUsd = 1 / rate;
        const prev = getPreviousRate("EURUSD");
        const change = prev ? eurUsd - prev : 0;
        const changePercent = prev ? (change / prev) * 100 : 0;
        quotes.push({
          symbol: "EURUSD",
          name: "EUR/USD",
          price: Number(eurUsd.toFixed(4)),
          change: Number(change.toFixed(4)),
          changePercent: Number(changePercent.toFixed(2)),
          direction: mapDirection(change),
          updatedAt: currentTime,
          provider: "CurrencyAPI",
          currency: "USD",
        });
        setPreviousRate("EURUSD", eurUsd);
      }

      if (data.data.GBP) {
        const rate = data.data.GBP.value;
        const gbpUsd = 1 / rate;
        const prev = getPreviousRate("GBPUSD");
        const change = prev ? gbpUsd - prev : 0;
        const changePercent = prev ? (change / prev) * 100 : 0;
        quotes.push({
          symbol: "GBPUSD",
          name: "GBP/USD",
          price: Number(gbpUsd.toFixed(4)),
          change: Number(change.toFixed(4)),
          changePercent: Number(changePercent.toFixed(2)),
          direction: mapDirection(change),
          updatedAt: currentTime,
          provider: "CurrencyAPI",
          currency: "USD",
        });
        setPreviousRate("GBPUSD", gbpUsd);
      }

      return quotes;
    } catch (error) {
      console.error("CurrencyAPI provider: failed", error);
      return getFallbackForexQuotes();
    }
  },
};
