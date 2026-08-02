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
    <div className="card-lavender flex flex-col h-full p-5 gap-4 card-lift">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="ai" className="text-[10px]">AI</Badge>
          <h2 className="text-card-title font-black uppercase tracking-tight">Morning Market Brief</h2>
        </div>
        <span className="text-[10px] font-black uppercase opacity-50">
          {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
        </span>
      </div>

      {/* Market Sentiment + Confidence */}
      <div className="flex flex-wrap items-center gap-3">
        <Badge variant={sentimentVariantKey}>{data.sentiment}</Badge>
        <div className="flex items-center gap-2">
          <div className="w-32 h-2 border-2 border-ink bg-white">
            <div
              className="h-full bg-ink"
              style={{ width: `${Math.min(100, Math.max(0, data.confidence))}%` }}
            />
          </div>
          <span className="text-small font-black uppercase opacity-70">{data.confidence}%</span>
        </div>
        {lastUpdated && (
          <span className="text-[10px] font-black uppercase opacity-40 ml-auto">
            Updated: {lastUpdated}
          </span>
        )}
      </div>

      {/* Today's Focus */}
      <div>
        <p className="text-small font-black uppercase opacity-50 mb-1.5">Today's Focus</p>
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
        <div className="brutal-border brutal-shadow p-2 bg-white">
          <div className="text-[10px] font-black uppercase opacity-60">US Markets</div>
          <div className="text-small font-black">{data.globalOverview.us}</div>
        </div>
        <div className="brutal-border brutal-shadow p-2 bg-white">
          <div className="text-[10px] font-black uppercase opacity-60">Europe</div>
          <div className="text-small font-black">{data.globalOverview.europe}</div>
        </div>
        <div className="brutal-border brutal-shadow p-2 bg-white">
          <div className="text-[10px] font-black uppercase opacity-60">Asia</div>
          <div className="text-small font-black">{data.globalOverview.asia}</div>
        </div>
      </div>

      {/* Risk Events */}
      <div>
        <p className="text-small font-black uppercase opacity-50 mb-1.5">Risk Events</p>
        <div className="flex flex-wrap gap-2">
          {data.riskEvents.slice(0, 4).map((risk, i) => (
            <Badge
              key={i}
              variant={
                risk.level === "High"
                  ? "bearish"
                  : risk.level === "Medium"
                  ? "breaking"
                  : "neutral"
              }
              className="text-[10px]"
            >
              {risk.level}: {risk.title}
            </Badge>
          ))}
        </div>
      </div>

      {/* AI Summary */}
      <div className="bg-white border-2 border-ink p-3">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="ai" className="text-[9px]">AI</Badge>
          <span className="text-[10px] font-black uppercase opacity-70">Summary</span>
        </div>
        <p className="text-small font-bold leading-relaxed opacity-80">{data.summary}</p>
      </div>

      {/* CTA */}
      <div className="mt-auto">
        <Button variant="primary" size="sm" onClick={onReadFull}>
          Read Full Market Brief
        </Button>
      </div>
    </div>
  );
}