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

const categoryColors: Record<string, string> = {
  STOCKS: "border-accent-blue",
  CRYPTO: "border-accent-yellow",
  FOREX: "border-accent-teal",
  GEOPOLITICAL: "border-accent-coral",
};

export function NewsCard({ title, slug, category, summary, publishedAt, className = "" }: NewsCardProps) {
  const borderColor = categoryColors[category] || "border-ink";

  return (
    <Link href={`/news/${slug}`} className={`block brutal-card p-5 ${borderColor} hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[4px_4px_0_#111] transition-all duration-100 ${className}`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <Badge variant="default">{category}</Badge>
        {publishedAt && (
          <span className="text-xs font-bold uppercase whitespace-nowrap">
            {new Intl.DateTimeFormat("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              timeZone: "UTC",
            }).format(new Date(publishedAt))}
          </span>
        )}
      </div>
      <h3 className="text-lg font-black uppercase mb-2 leading-tight">{title}</h3>
      <p className="text-sm font-bold opacity-80 mb-4 leading-relaxed">{summary}</p>
      <span className="text-xs font-black uppercase opacity-60 hover:opacity-100 transition-opacity">
        Read more →
      </span>
    </Link>
  );
}