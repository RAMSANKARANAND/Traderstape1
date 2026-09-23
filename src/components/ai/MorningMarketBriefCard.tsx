import React from "react";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import type { MorningBriefData } from "@/lib/ai/types";

interface MorningMarketBriefCardProps {
  data: {
    sentiment: string;
    confidence: number;
    focusPoints: readonly string[];
    globalOverview: {
      us: string;
      europe: string;
      asia: string;
    };
    riskEvents: ReadonlyArray<{
      level: "High" | "Medium" | "Low";
      title: string;
      description: string;
    }>;
    summary: string;
  };
  lastUpdated?: string;
  onReadFull?: () => void;
}

const sentimentVariant: Record<string, "bullish" | "bearish" | "neutral"> = {
  Bullish: "bullish",
  Bearish: "bearish",
  Neutral: "neutral",
};

export function MorningMarketBriefCard({ data, lastUpdated, onReadFull }: MorningMarketBriefCardProps) {
  const sentimentVariantKey = sentimentVariant[data.sentiment] ?? "neutral";

  return (
    <div className="flex flex-col h-full bg-white border border-[#cccccc] rounded-lg shadow-sm">
      {/* Header strip */}
      <div className="flex items-center gap-2 px-3.5 py-2.5 bg-[var(--color-surface)] border-b border-[var(--color-surface)]/20">
        <Badge variant="flat" className="bg-[var(--color-accent-500)] text-[var(--color-bg)] border-[0px] text-[10px]">AI</Badge>
        <span className="text-card-title font-black uppercase tracking-tight" style={{ color: 'var(--color-text)' }}>Morning Market Brief</span>
        {lastUpdated && (
          <span className="text-[10px] font-black uppercase opacity-60 ml-auto" style={{ color: 'var(--color-text)' }}>
            Updated: {lastUpdated}
          </span>
        )}
      </div>

      {/* White body content */}
      <div className="p-3.5 flex flex-col flex-1 gap-4">

        {/* Market Sentiment + Confidence */}
        <div className="flex flex-wrap items-center gap-3">
          <Badge className="bg-[var(--color-accent-500)] text-[var(--color-bg)] border-[0px]">{data.sentiment}</Badge>
          <div className="flex items-center gap-2">
            <div className="w-32 h-2 border-2 border-ink bg-white">
              <div
                className="h-full bg-ink"
                style={{ width: `${Math.min(100, Math.max(0, data.confidence))}%` }}
              />
            </div>
            <span className="text-small font-black uppercase opacity-70">{data.confidence}%</span>
          </div>
        </div>

{/* Today's Focus */}
        <div>
          <p className="text-small font-black uppercase mb-1.5" style={{ color: 'var(--color-text)' }}>Today's Focus</p>
          <ul className="space-y-1">
            {data.focusPoints.slice(0, 5).map((point, i) => (
              <li key={i} className="text-small font-bold leading-tight opacity-70 flex items-start gap-1.5">
                <span className="text-ink mt-0.5 shrink-0">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Global Overview */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2">
            <div className="text-[10px] font-black uppercase" style={{ color: 'var(--color-accent-800)' }}>US Markets</div>
            <div className="text-small font-black" style={{ color: 'var(--color-text)' }}>{data.globalOverview.us}</div>
          </div>
          <div className="p-2">
            <div className="text-[10px] font-black uppercase" style={{ color: 'var(--color-accent-800)' }}>Europe</div>
            <div className="text-small font-black" style={{ color: 'var(--color-text)' }}>{data.globalOverview.europe}</div>
          </div>
          <div className="p-2">
            <div className="text-[10px] font-black uppercase" style={{ color: 'var(--color-accent-800)' }}>Asia</div>
            <div className="text-small font-black" style={{ color: 'var(--color-text)' }}>{data.globalOverview.asia}</div>
          </div>
        </div>

{/* Risk Events */}
        <div>
          <p className="text-small font-black uppercase mb-1.5" style={{ color: 'var(--color-text)' }}>Risk Events</p>
          <div className="flex flex-wrap gap-2">
            {data.riskEvents.slice(0, 4).map((risk, i) => (
              <Badge
                key={i}
                variant={
                  risk.level === "High"
                    ? "bearish"
                    : risk.level === "Medium"
                      ? "gold"
                      : "neutral"
                }
                className="text-[10px] border-[0px] text-[var(--color-accent-800)]"
              >
                {risk.level}: {risk.title}
              </Badge>
            ))}
          </div>
        </div>

        {/* AI Summary */}
        <div className="p-3" style={{ borderLeft: '3px solid var(--color-accent-700)' }}>
<div className="flex items-center gap-2 mb-1">
            <Badge variant="ai" className="text-[9px] bg-[var(--color-accent-500)] text-[var(--color-bg)] border-[0px]">AI</Badge>
            <span className="text-[10px] font-black uppercase" style={{ color: 'var(--color-text)' }}>Summary</span>
          </div>
          <p className="text-small font-bold leading-relaxed opacity-80" style={{ color: 'var(--color-text)' }}>{data.summary}</p>
        </div>

        {/* CTA */}
        <div className="mt-auto">
          <Button variant="primary" size="sm" className="btn-hero-cyan" onClick={onReadFull}>
            Read Full Market Brief
          </Button>
        </div>
      </div>
    </div>
  );
}