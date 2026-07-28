import React from "react";
import { TheTapeClient } from "@/components/the-tape/TheTapeClient";
import { getMarketQuotes } from "@/lib/market/service";
import type { MarketQuote } from "@/lib/market/types";

export const dynamic = "force-dynamic";

export default async function TheTapePage() {
  let initialQuotes: MarketQuote[] = [];
  try {
    initialQuotes = await getMarketQuotes();
  } catch (err) {
    console.error("The Tape: initial fetch failed", err);
  }

  return <TheTapeClient initialQuotes={initialQuotes} />;
}