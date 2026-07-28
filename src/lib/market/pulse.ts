import type { MarketQuote } from "./types";

export type Sentiment = "bullish" | "neutral" | "bearish";

export interface MarketPulse {
  sentiment: Sentiment;
  focus: string;
  status: {
    nse: string;
    forex: string;
    crypto: string;
  };
  details: {
    indicesPositive: number;
    indicesTotal: number;
    cryptoPositive: number;
    cryptoTotal: number;
    vixValue: number | null;
  };
}

const INDIAN_INDICES = ["NIFTY 50", "BANK NIFTY", "SENSEX"];
const VIX = "INDIA VIX";
const CRYPTO = ["BTC", "ETH"];

function countPositive(quotes: MarketQuote[], names: string[]): { positive: number; total: number } {
  const filtered = quotes.filter((q) => names.includes(q.name));
  const positive = filtered.filter((q) => q.direction === "up").length;
  return { positive, total: filtered.length };
}

function getVixValue(quotes: MarketQuote[]): number | null {
  const vix = quotes.find((q) => q.name === VIX);
  return vix ? vix.price : null;
}

function determineSentiment(
  indicesPositive: number,
  indicesTotal: number,
  cryptoPositive: number,
  cryptoTotal: number,
  vix: number | null
): Sentiment {
  const totalPositive = indicesPositive + cryptoPositive;
  const total = indicesTotal + cryptoTotal;

  if (total === 0) return "neutral";

  const ratio = totalPositive / total;

  // If VIX is elevated (>20), lean bearish
  if (vix !== null && vix > 20 && ratio < 0.5) {
    return "bearish";
  }

  if (ratio >= 0.6) return "bullish";
  if (ratio <= 0.3) return "bearish";
  return "neutral";
}

function generateFocus(
  quotes: MarketQuote[],
  indicesPositive: number,
  indicesTotal: number,
  cryptoPositive: number,
  cryptoTotal: number,
  vix: number | null
): string {
  const parts: string[] = [];

  // Indian equities
  if (indicesTotal > 0) {
    if (indicesPositive === indicesTotal) {
      parts.push("Indian equities are broadly positive");
    } else if (indicesPositive === 0) {
      parts.push("Indian equities are under pressure");
    } else {
      parts.push("Indian equities are mixed");
    }
  }

  // VIX
  if (vix !== null) {
    if (vix > 25) {
      parts.push("with elevated volatility (VIX > 25)");
    } else if (vix > 20) {
      parts.push("with above-average volatility");
    } else if (vix < 12) {
      parts.push("with low volatility");
    }
  }

  // Crypto
  if (cryptoTotal > 0) {
    if (cryptoPositive === cryptoTotal) {
      parts.push("while crypto is showing relative strength");
    } else if (cryptoPositive === 0) {
      parts.push("while crypto is showing weakness");
    } else {
      parts.push("while crypto is mixed");
    }
  }

  if (parts.length === 0) return "Market data is being processed.";

  return parts.join(" ") + ".";
}

function getNseStatus(quotes: MarketQuote[]): string {
  const nifty = quotes.find((q) => q.name === "NIFTY 50");
  if (nifty?.marketState === "OPEN") return "Open";
  if (nifty?.marketState === "CLOSED") return "Closed";
  // Fallback: check if any NSE stock has marketState
  const anyNse = quotes.find((q) => q.marketState);
  if (anyNse?.marketState === "OPEN") return "Open";
  return "Unknown";
}

function getForexStatus(): string {
  return "24/5";
}

function getCryptoStatus(): string {
  return "24/7";
}

export function computeMarketPulse(quotes: MarketQuote[]): MarketPulse {
  const { positive: indicesPositive, total: indicesTotal } = countPositive(quotes, INDIAN_INDICES);
  const { positive: cryptoPositive, total: cryptoTotal } = countPositive(quotes, CRYPTO);
  const vix = getVixValue(quotes);

  return {
    sentiment: determineSentiment(indicesPositive, indicesTotal, cryptoPositive, cryptoTotal, vix),
    focus: generateFocus(quotes, indicesPositive, indicesTotal, cryptoPositive, cryptoTotal, vix),
    status: {
      nse: getNseStatus(quotes),
      forex: getForexStatus(),
      crypto: getCryptoStatus(),
    },
    details: {
      indicesPositive,
      indicesTotal,
      cryptoPositive,
      cryptoTotal,
      vixValue: vix,
    },
  };
}