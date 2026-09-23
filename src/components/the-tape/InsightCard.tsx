"use client";

import React, { useEffect, useState } from "react";
import { Badge } from "../ui/Badge";

interface InsightCardProps {
  title: string;
}

interface TapeInsightResponse {
  success: boolean;
  insight?: string;
  error?: string;
}

export function InsightCard({ title }: InsightCardProps) {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchInsight = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/tape-insight`);
        if (!res.ok) {
          throw new Error(`Failed to fetch: ${res.status}`);
        }
        const data: TapeInsightResponse = await res.json();
        if (data.success && data.insight) {
          if (!cancelled) {
            setInsight(data.insight);
          }
        } else {
          // fallback message
          if (!cancelled) {
            setInsight(
              "Market insight data is being generated. Please check back shortly."
            );
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unknown error");
          setInsight(
            "Market insight data is being generated. Please check back shortly."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchInsight();

    return () => {
      cancelled = true;
    };
  }, [title]);

  if (loading) {
    return (
      <div className="bg-white border border-[#cccccc] rounded-lg shadow-sm p-6 relative">
        <div className="absolute top-0 right-0 p-2">
          <Badge variant="default" className="bg-accent-500 text-white border-transparent">
            AI Powered
          </Badge>
        </div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-accent-500 text-white flex items-center justify-center font-black text-xs">
            AI
          </div>
          <h3 className="font-black uppercase tracking-tighter text-xl">{title}</h3>
        </div>
        <p className="text-text-secondary font-medium leading-relaxed italic">
          Loading market insight...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-[#cccccc] rounded-lg shadow-sm p-6 relative">
        <div className="absolute top-0 right-0 p-2">
          <Badge variant="default" className="bg-accent-500 text-white border-transparent">
            AI Powered
          </Badge>
        </div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-accent-500 text-white flex items-center justify-center font-black text-xs">
            AI
          </div>
          <h3 className="font-black uppercase tracking-tighter text-xl">{title}</h3>
        </div>
        <p className="text-text-secondary font-medium leading-relaxed italic">
          {error}
        </p>
      </div>
    );
  }

  const displayInsight = insight ?? "Market insight data is being generated. Please check back shortly.";

  return (
    <div className="bg-white border border-[#cccccc] rounded-lg shadow-sm p-6 relative">
      <div className="absolute top-0 right-0 p-2">
        <Badge variant="default" className="bg-accent-500 text-white border-transparent">
          AI Powered
        </Badge>
      </div>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-accent-500 text-white flex items-center justify-center font-black text-xs">
          AI
        </div>
        <h3 className="font-black uppercase tracking-tighter text-xl">{title}</h3>
      </div>
      <p className="text-text-secondary font-medium leading-relaxed italic">
        "{displayInsight}"
      </p>
    </div>
  );
}