export interface MetalQuote {
  symbol: string;
  name: string;
  price: number;
  currency: string;
  change: number;
  changePercent: number;
  direction: "up" | "down" | "flat";
  source: string;
  updatedAt: string;
}

export interface CryptoQuote {
  symbol: string;
  name: string;
  price: number;
  currency: string;
  change: number;
  changePercent: number;
  direction: "up" | "down" | "flat";
  source: string;
  updatedAt: string;
  dayHigh?: number;
  dayLow?: number;
  volume?: number;
}

export interface ForexQuote {
  symbol: string;
  name: string;
  price: number;
  currency: string;
  change: number;
  changePercent: number;
  direction: "up" | "down" | "flat";
  source: string;
  updatedAt: string;
  dayHigh?: number;
  dayLow?: number;
}