import React from "react";
import { TheTapeClient } from "@/components/the-tape/TheTapeClient";
import { getMarketQuotes } from "@/lib/market/service";
import { getMetals, getCrypto, getForex } from "@/lib/markets/service";
import type { MarketQuote } from "@/lib/market/types";
import type { MetalQuote } from "@/lib/markets/types";
import type { CryptoQuote } from "@/lib/markets/types";
import type { ForexQuote } from "@/lib/markets/types";

export const dynamic = "force-dynamic";

function metalsToMarketQuotes(metals: MetalQuote[]): MarketQuote[] {
  return metals.map((m) => ({
    symbol: m.symbol,
    name: m.name,
    price: m.price,
    change: m.change,
    changePercent: m.changePercent,
    direction: m.direction,
    updatedAt: m.updatedAt,
    provider: m.source,
    currency: m.currency,
  }));
}

function cryptoToMarketQuotes(crypto: CryptoQuote[]): MarketQuote[] {
  return crypto.map((c) => ({
    symbol: c.symbol,
    name: c.name,
    price: c.price,
    change: c.change,
    changePercent: c.changePercent,
    direction: c.direction,
    updatedAt: c.updatedAt,
    provider: c.source,
    currency: c.currency,
    dayHigh: c.dayHigh,
    dayLow: c.dayLow,
    volume: c.volume,
  }));
}

function forexToMarketQuotes(forex: ForexQuote[]): MarketQuote[] {
  return forex.map((f) => ({
    symbol: f.symbol,
    name: f.name,
    price: f.price,
    change: f.change,
    changePercent: f.changePercent,
    direction: f.direction,
    updatedAt: f.updatedAt,
    provider: f.source,
    currency: f.currency,
    dayHigh: f.dayHigh,
    dayLow: f.dayLow,
  }));
}

export default async function TheTapePage() {
  let initialQuotes: MarketQuote[] = [];

  try {
    const [marketQuotes, metals, crypto, forex] = await Promise.allSettled([
      getMarketQuotes(),
      getMetals(),
      getCrypto(),
      getForex(),
    ]);

    if (marketQuotes.status === "fulfilled") {
      initialQuotes.push(...marketQuotes.value);
    } else {
      console.error("The Tape: market quotes fetch failed", marketQuotes.reason);
    }

    if (metals.status === "fulfilled") {
      initialQuotes.push(...metalsToMarketQuotes(metals.value));
    } else {
      console.error("The Tape: metals fetch failed", metals.reason);
    }

    if (crypto.status === "fulfilled") {
      initialQuotes.push(...cryptoToMarketQuotes(crypto.value));
    } else {
      console.error("The Tape: crypto fetch failed", crypto.reason);
    }

    if (forex.status === "fulfilled") {
      initialQuotes.push(...forexToMarketQuotes(forex.value));
    } else {
      console.error("The Tape: forex fetch failed", forex.reason);
    }
  } catch (err) {
    console.error("The Tape: initial fetch failed", err);
  }

  return <TheTapeClient initialQuotes={initialQuotes} />;
}
