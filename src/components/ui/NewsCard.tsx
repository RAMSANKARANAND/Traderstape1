import React from "react";
import Link from "next/link";
import { Badge } from "./Badge";

interface NewsCardProps {
  title: string;
  slug: string;
  category: string;
  summary: string;
  publishedAt: Date | null;
  className?: string;
}

export function NewsCard({ title, slug, category, summary, publishedAt, className = "" }: NewsCardProps) {
  // Determine badge class based on category
  const getBadgeClass = (category: string) => {
    const rareSecondCategories = ["GEOPOLITICAL"];
    if (rareSecondCategories.includes(category)) {
      return "whitespace-nowrap bg-accent-2-100 text-accent-2-700 border-transparent";
    }
    return "whitespace-nowrap bg-accent-100 text-accent-700 border-transparent";
  };

  return (
    <Link href={`/news/${slug}`} className={`block bg-white border border-[#cccccc] rounded-lg shadow-sm p-5 hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[4px_4px_0_#111] transition-all duration-100 ${className}`}>
      <div className="flex flex-col h-full">
        <div className="flex items-start justify-between gap-3 mb-3">
          <Badge variant="default" className={getBadgeClass(category)}>
            {category}
          </Badge>
          {publishedAt && (
            <span className="text-xs font-bold uppercase whitespace-nowrap" style={{ color: 'var(--color-text)' }}>
              {new Intl.DateTimeFormat("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                timeZone: "UTC",
              }).format(new Date(publishedAt))}
            </span>
          )}
        </div>
        <h3 className="text-lg font-black uppercase mb-2 leading-tight line-clamp-2" style={{ color: 'var(--color-text)' }}>{title}</h3>
        <p className="text-sm font-bold opacity-80 mb-4 leading-relaxed line-clamp-3">{summary}</p>
        <span className="mt-auto text-xs font-black uppercase opacity-60 hover:opacity-100 transition-opacity" style={{ color: 'var(--color-accent-700)' }}>
          Read more →
        </span>
      </div>
    </Link>
  );
}