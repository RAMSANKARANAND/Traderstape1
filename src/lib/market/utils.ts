export function formatPrice(value: number, decimals = 2): string {
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatVolume(value: number): string {
  if (value >= 1e9) {
    return `${(value / 1e9).toFixed(2)}B`;
  }
  if (value >= 1e6) {
    return `${(value / 1e6).toFixed(2)}M`;
  }
  if (value >= 1e3) {
    return `${(value / 1e3).toFixed(2)}K`;
  }
  return value.toString();
}

export function formatPercent(value: number, decimals = 2): string {
  const fixed = value.toFixed(decimals);
  const sign = value > 0 ? "+" : value < 0 ? "" : "";
  return `${sign}${fixed}%`;
}

export function formatChange(value: number, decimals = 2): string {
  const fixed = value.toFixed(decimals);
  const sign = value > 0 ? "+" : value < 0 ? "" : "";
  return `${sign}${fixed}`;
}

export function formatTimestamp(iso: string): string {
  const now = new Date();
  const then = new Date(iso);
  const diffMs = now.getTime() - then.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);

  if (diffSec < 10) return "Updated just now";
  if (diffSec < 60) return `Updated ${diffSec} sec ago`;
  if (diffMin < 60) return `Updated ${diffMin} min ago`;

  return `Updated ${then.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
}

export function getStaleLevel(iso: string): "ok" | "delayed" | "stale" {
  const diffMin = (Date.now() - new Date(iso).getTime()) / 1000 / 60;
  if (diffMin > 15) return "stale";
  if (diffMin > 5) return "delayed";
  return "ok";
}

export function getMarketStatus(): { open: boolean; label: string; detail: string } {
  const now = new Date();
  const ist = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  const hours = ist.getHours();
  const minutes = ist.getMinutes();
  const time = hours * 60 + minutes;

  const open = time >= 9 * 60 + 15 && time < 15 * 60 + 30;
  return {
    open,
    label: open ? "NSE OPEN" : "MARKET CLOSED",
    detail: open ? "09:15–15:30 IST" : "Opens Tomorrow 09:15 IST",
  };
}