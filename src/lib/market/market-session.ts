/**
 * Market Session Engine
 * 
 * Provides reusable functions to determine market session status
 * for different exchanges and asset classes.
 */

export type MarketSession = "PRE-OPEN" | "LIVE" | "CLOSED";

/**
 * Get Indian market session (NSE/BSE)
 * PRE-OPEN: 09:00–09:15 IST
 * LIVE: 09:15–15:30 IST
 * CLOSED: all other times
 * CLOSED on Saturdays and Sundays
 */
export function getIndianMarketSession(): MarketSession {
  const now = new Date();
  const istTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  const day = istTime.getDay(); // 0 = Sunday, 6 = Saturday
  const hours = istTime.getHours();
  const minutes = istTime.getMinutes();
  const timeInMinutes = hours * 60 + minutes;

  // Weekend check
  if (day === 0 || day === 6) {
    return "CLOSED";
  }

  // PRE-OPEN: 09:00–09:15 IST (540 - 555 minutes)
  if (timeInMinutes >= 540 && timeInMinutes < 555) {
    return "PRE-OPEN";
  }

  // LIVE: 09:15–15:30 IST (555 - 930 minutes)
  if (timeInMinutes >= 555 && timeInMinutes < 930) {
    return "LIVE";
  }

  return "CLOSED";
}

/**
 * Get US market session (NYSE, NASDAQ)
 */
export function getUSMarketSession(): MarketSession {
  const now = new Date();
  
  // Convert to US Eastern Time
  const easternTime = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
  const day = easternTime.getDay();
  const hours = easternTime.getHours();
  const minutes = easternTime.getMinutes();
  const timeInMinutes = hours * 60 + minutes;

  // Weekend check
  if (day === 0 || day === 6) {
    return "CLOSED";
  }

  // PRE-OPEN: 04:00–09:30 ET (240 - 570 minutes)
  if (timeInMinutes >= 240 && timeInMinutes < 570) {
    return "PRE-OPEN";
  }

  // LIVE: 09:30–16:00 ET (570 - 960 minutes)
  if (timeInMinutes >= 570 && timeInMinutes < 960) {
    return "LIVE";
  }

  return "CLOSED";
}

/**
 * Get European market session (LSE, Euronext)
 */
export function getEuropeMarketSession(): MarketSession {
  const now = new Date();
  
  // Convert to Europe/London time
  const londonTime = new Date(now.toLocaleString("en-US", { timeZone: "Europe/London" }));
  const day = londonTime.getDay();
  const hours = londonTime.getHours();
  const minutes = londonTime.getMinutes();
  const timeInMinutes = hours * 60 + minutes;

  // Weekend check
  if (day === 0 || day === 6) {
    return "CLOSED";
  }

  // PRE-OPEN: 07:00–08:00 GMT (420 - 480 minutes)
  if (timeInMinutes >= 420 && timeInMinutes < 480) {
    return "PRE-OPEN";
  }

  // LIVE: 08:00–17:30 GMT (480 - 1050 minutes)
  if (timeInMinutes >= 480 && timeInMinutes < 1050) {
    return "LIVE";
  }

  return "CLOSED";
}

/**
 * Get Forex session
 * OPEN Monday–Friday
 * CLOSED on weekends
 */
export function getForexSession(): MarketSession {
  const now = new Date();
  const day = now.getDay(); // Use UTC day for forex as it's global

  // Weekend check (Friday evening to Sunday)
  if (day === 5 && now.getUTCHours() >= 20) {
    return "CLOSED";
  }
  if (day === 6 || day === 0) {
    return "CLOSED";
  }

  return "LIVE";
}

/**
 * Get Crypto session
 * Always 24/7
 */
export function getCryptoSession(): MarketSession {
  return "LIVE";
}

/**
 * Determine market session based on symbol
 */
export function getMarketSession(symbol: string): MarketSession {
  const upperSymbol = symbol.toUpperCase();
  
  // Crypto symbols
  if (["BTC", "ETH", "SOL", "XRP", "BNB", "ADA", "DOGE", "DOT", "MATIC", "LINK"].includes(upperSymbol)) {
    return getCryptoSession();
  }
  
  // Forex pairs
  if (upperSymbol.includes("USD") || upperSymbol.includes("EUR") || 
      upperSymbol.includes("GBP") || upperSymbol.includes("JPY") ||
      upperSymbol.includes("AUD") || upperSymbol.includes("NZD") ||
      upperSymbol.includes("CAD") || upperSymbol.includes("CHF")) {
    return getForexSession();
  }
  
  // Default to Indian market for NSE/BSE symbols
  return getIndianMarketSession();
}