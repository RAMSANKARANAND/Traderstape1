"use client";

import React, { useState, useEffect } from "react";
import { LiveMarketTicker } from "@/components/home/LiveMarketTicker";
import { MarketQuote } from "@/lib/market/types";
import { formatPrice, formatChange, formatPercent } from "@/lib/market/utils";

interface MarketApiResponse {
  success: boolean;
  updatedAt?: string;
  quotes: MarketQuote[];
}

export function useMarketTicker(refreshInterval: number = 30000) {
  const [items, setItems] = useState<MarketQuote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchMarketData = async () => {
    if (isRefreshing) return; // Prevent concurrent fetches
    
    setIsRefreshing(true);
    setError(null);
    
    try {
      const response = await fetch('/api/market', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: MarketApiResponse = await response.json();
      
      if (!data.success || !Array.isArray(data.quotes)) {
        throw new Error('Invalid market data response');
      }
      
      // Transform and filter market data for the ticker
      const tickerItems: MarketQuote[] = data.quotes
        .filter(quote => {
          // Only show requested symbols
          const symbol = quote.symbol.toUpperCase();
          const validSymbols = [
            'NIFTY', 'NSEI', '^NSEI', 'BANKNIFTY', 'NSEBANK', 
            'BSESN', 'SENSEX', 'INDIAVIX', 'USDINR', 'USD/INR',
            'EURUSD', 'EUR/USD', 'GBPUSD', 'GBP/USD', 'BTC', 
            'BTC-USD', 'ETH', 'ETH-USD', 'SOL', 'SOL-USD', 
            'XRP', 'XRP-USD', 'GOLD', 'GC=F', 'SILVER', 'SI=F'
          ];
          return validSymbols.includes(symbol) || 
                 validSymbols.some(valid => symbol.includes(valid));
        })
        .map(quote => {
          // Map symbols to display names
          const getDisplayName = (symbol: string): string => {
            const upper = symbol.toUpperCase();
            if (upper === 'NIFTY' || upper === 'NSEI' || upper === '^NSEI') return 'NIFTY 50';
            if (upper === 'BANKNIFTY' || upper === 'NSEBANK') return 'BANK NIFTY';
            if (upper === 'BSESN' || upper === 'SENSEX') return 'SENSEX';
            if (upper === 'INDIAVIX') return 'INDIA VIX';
            if (upper.includes('USDINR') || upper === 'USD/INR') return 'USD/INR';
            if (upper === 'EURUSD' || upper === 'EUR/USD') return 'EUR/USD';
            if (upper === 'GBPUSD' || upper === 'GBP/USD') return 'GBP/USD';
            if (upper === 'BTC' || upper === 'BTC-USD') return 'BTC';
            if (upper === 'ETH' || upper === 'ETH-USD') return 'ETH';
            if (upper === 'SOL' || upper === 'SOL-USD') return 'SOL';
            if (upper === 'XRP' || upper === 'XRP-USD') return 'XRP';
            if (upper === 'GOLD' || upper === 'GC=F') return 'Gold';
            if (upper === 'SILVER' || upper === 'SI=F') return 'Silver';
            return quote.name || symbol;
          };
          
          return {
            ...quote,
            name: getDisplayName(quote.symbol),
            updatedAt: data.updatedAt || new Date().toISOString(),
          };
        })
        .sort((a, b) => {
          // Sort by priority: indices first, then forex, crypto, metals
          const priority = (symbol: string) => {
            const upper = symbol.toUpperCase();
            if (upper === 'NIFTY' || upper === 'BANKNIFTY' || upper === 'SENSEX' || upper === 'INDIAVIX') return 0;
            if (upper.includes('USD') || upper.includes('EUR') || upper.includes('GBP')) return 1;
            if (upper === 'BTC' || upper === 'ETH' || upper === 'SOL' || upper === 'XRP') return 2;
            if (upper === 'GOLD' || upper === 'SILVER') return 3;
            return 4;
          };
          return priority(a.symbol) - priority(b.symbol);
        });
      
      setItems(tickerItems);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch market data');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
    
    const interval = setInterval(fetchMarketData, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  return {
    items,
    isLoading,
    error,
    lastUpdated,
    isRefreshing,
    refresh: fetchMarketData,
  };
}
