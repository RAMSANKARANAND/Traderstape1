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
            {new Date(publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </span>
        )}
      </div>
      <h3 className="text-lg font-black uppercase leading-tight mb-2">{title}</h3>
      <p className="text-sm font-bold leading-snug opacity-80">{summary}</p>
    </Link>
  );
}