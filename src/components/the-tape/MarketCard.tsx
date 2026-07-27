import React from "react";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";

interface MarketCardProps {
  name: string;
  price: string;
  change: string;
  trend: "up" | "down" | "flat";
}

export function MarketCard({ name, price, change, trend }: MarketCardProps) {
  return (
    <Card className="flex flex-col justify-between h-full group">
      <div className="flex justify-between items-start mb-4">
        <span className="font-black uppercase tracking-tighter text-lg">{name}</span>
        <Badge variant={trend === "up" ? "up" : trend === "down" ? "down" : "flat"}>
          {trend === "up" ? "Bullish" : trend === "down" ? "Bearish" : "Neutral"}
        </Badge>
      </div>
      <div>
        <div className="text-3xl font-black tracking-tighter mb-1">{price}</div>
        <div className={`text-sm font-bold ${trend === "up" ? "text-accent-bullish" : trend === "down" ? "text-accent-bearish" : "text-accent-neutral"}`}>
          {change}
        </div>
      </div>
    </Card>
  );
}