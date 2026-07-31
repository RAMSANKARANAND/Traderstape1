import React from "react";
import type { MarketQuote } from "../../lib/market/types";
import { MarketCard } from "./MarketCard";
import { MarketDetailCard } from "./MarketDetailCard";

interface GlobalMarketsDashboardProps {
  quotes: MarketQuote[];
}

const sectionOrder = [
  "India",
  "USA",
  "Europe",
  "Asia",
  "Commodities",
  "Crypto",
  "Forex",
] as const;

const sectionSymbolsMap: Record<typeof sectionOrder[number], string[]> = {
  India: ["^NSEI", "^NSEBANK", "^BSESN", "^INDIAVIX"],
  USA: ["^GSPC", "^IXIC", "^DJI"],
  Europe: ["^FTSE", "^GDAXI", "^FCHI"],
  Asia: ["^N225", "^HSI", "000001.SS"],
  Commodities: ["Gold", "Silver", "Brent Crude", "WTI Crude"],
  Crypto: ["bitcoin", "ethereum", "solana", "ripple"],
  Forex: ["USDINR", "EURUSD", "GBPUSD", "USDJPY"],
};

const GlobalMarketsDashboard: React.FC<GlobalMarketsDashboardProps> = ({
  quotes,
}) => {
  // Helper to get quotes by symbols for a section
  const getQuotesForSection = (symbols: string[]) =>
    symbols
      .map((symbol) => quotes.find((q) => q.symbol === symbol))
      .filter((q): q is MarketQuote => q !== undefined);

  return (
    <div className="space-y-8">
      {sectionOrder.map((section) => {
        const sectionQuotes = getQuotesForSection(sectionSymbolsMap[section]);
        if (sectionQuotes.length === 0) return null;

        return (
          <section key={section}>
            <h2 className="text-xl font-bold mb-4">{section}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {sectionQuotes.map((quote) => (
                <MarketCard key={quote.symbol} quote={quote} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
};

export default GlobalMarketsDashboard;