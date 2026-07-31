export interface MarketQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  direction: "up" | "down" | "flat";
  updatedAt: string;
  provider: string;
  open?: number;
  previousClose?: number;
  dayHigh?: number;
  dayLow?: number;
  volume?: number;
  currency?: string;
  marketState?: "PRE-OPEN" | "LIVE" | "CLOSED";
}

export interface MarketProvider {
  name: string;
  fetchQuotes(): Promise<MarketQuote[]>;
}
