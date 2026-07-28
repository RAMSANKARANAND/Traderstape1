import React from "react";
import { Badge } from "../ui/Badge";

type StatusType = "bullish" | "bearish" | "neutral";

interface StatusBadgeProps {
  status: StatusType;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = {
    bullish: { variant: "up" as const, label: "Bullish" },
    bearish: { variant: "down" as const, label: "Bearish" },
    neutral: { variant: "flat" as const, label: "Neutral" },
  };

  const { variant, label } = config[status];

  return (
    <Badge variant={variant}>
      {label}
    </Badge>
  );
}