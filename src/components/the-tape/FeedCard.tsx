import React from "react";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";

interface FeedCardProps {
  category: string;
  headline: string;
  time: string;
}

export function FeedCard({ category, headline, time }: FeedCardProps) {
  return (
    <Card className="p-4 flex items-center justify-between gap-4 hover:bg-bg-bg-surface transition-colors group cursor-pointer">
      <div className="flex items-center gap-4">
        <Badge variant="default" className="whitespace-nowrap">
          {category}
        </Badge>
        <h4 className="font-bold text-sm leading-tight group-hover:underline decoration-2 underline-offset-4">
          {headline}
        </h4>
      </div>
      <span className="text-[10px] font-black uppercase text-text-secondary whitespace-nowrap">
        {time}
      </span>
    </Card>
  );
}