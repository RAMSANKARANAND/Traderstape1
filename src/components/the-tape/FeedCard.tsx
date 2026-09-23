import React from "react";
import { Badge } from "../ui/Badge";

interface FeedCardProps {
  category: string;
  headline: string;
  time: string;
}

export function FeedCard({ category, headline, time }: FeedCardProps) {
  const getBadgeClass = (category: string) => {
    const rareSecondCategories = ["GEOPOLITICAL"];
    if (rareSecondCategories.includes(category)) {
      return "whitespace-nowrap bg-accent-2-100 text-accent-2-700 border-transparent";
    }
    return "whitespace-nowrap bg-accent-100 text-accent-700 border-transparent";
  };

  return (
    <div className="bg-white border border-[#cccccc] rounded-lg shadow-sm p-4 flex items-center justify-between gap-4 hover:bg-bg-bg-surface transition-colors group cursor-pointer">
      <div className="flex items-center gap-4">
        <Badge variant="default" className={getBadgeClass(category)} whitespace-nowrap>
          {category}
        </Badge>
        <h4 className="font-bold text-sm leading-tight group-hover:underline decoration-2 underline-offset-4">
          {headline}
        </h4>
      </div>
      <span className="text-[10px] font-black uppercase text-text-secondary whitespace-nowrap">
        {time}
      </span>
    </div>
  );
}