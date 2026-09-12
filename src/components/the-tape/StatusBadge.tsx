import React from "react";
import { Badge } from "../ui/Badge";

type StatusType = "bullish" | "bearish" | "neutral";

interface StatusBadgeProps {
  status: StatusType;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = {
    bullish: { variant: "up" as const, label: "Bullish", pill: "ng-pill-positive" },
    bearish: { variant: "down" as const, label: "Bearish", pill: "ng-pill-negative" },
    neutral: { variant: "flat" as const, label: "Neutral", pill: "ng-pill-neutral" },
  };

  const { variant, label, pill } = config[status];

  return (
    <Badge variant={variant} className={pill}>
      {label}
    </Badge>
  );
}