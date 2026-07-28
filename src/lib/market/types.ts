export interface MarketQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  direction: "up" | "down" | "flat";
  updatedAt: string;
}

export interface MarketProvider {
  name: string;
  fetchQuotes(): Promise<MarketQuote[]>;
}