"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { AVAILABLE_AI_ACTIONS } from "@/lib/ai/actions";
import type { AiAction, AiResponse } from "@/lib/ai/types";

interface AiAssistantPanelProps {
  title: string;
  category: string;
  content: string;
  onInsertContent: (field: string, value: string) => void;
  onInsertTags: (tags: string[]) => void;
}

export function AiAssistantPanel({
  title,
  category,
  content,
  onInsertContent,
  onInsertTags,
}: AiAssistantPanelProps) {
  const [selectedAction, setSelectedAction] = useState<AiAction>("generate-news-draft");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: selectedAction,
          title: title || undefined,
          category: category || undefined,
          content: content || undefined,
        }),
      });

      const data: AiResponse = await response.json();

      if (!data.success) {
        setError(data.message || "Generation failed");
        return;
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleInsert = () => {
    if (!result?.data) return;

    const action = AVAILABLE_AI_ACTIONS.find((a) => a.id === selectedAction);
    if (!action) return;

    for (const field of action.fields) {
      if (field === "tags" && result.data.tags) {
        onInsertTags(result.data.tags as string[]);
      } else if (field === "seoTitle" && result.data.seoTitle) {
        onInsertContent("seoTitle", result.data.seoTitle as string);
      } else if (field === "seoDescription" && result.data.metaDescription) {
        onInsertContent("seoDescription", result.data.metaDescription as string);
      } else if (field === "summary" && result.data.summary) {
        onInsertContent("summary", result.data.summary as string);
      } else if (field === "body" && result.data.content) {
        onInsertContent("body", result.data.content as string);
      }
    }
  };

  return (
    <Card className="p-6 space-y-6 max-w-lg">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-lg font-black uppercase tracking-tight leading-tight">🤖 AI Assistant</h3>
          <p className="text-xs font-black uppercase text-text-secondary mt-1 leading-tight">
            Traderstape Editorial AI
          </p>
        </div>
        {result && (
          <Badge variant="default" className={`shrink-0 ${result.mode === "mock" ? "bg-yellow-500 text-black" : "bg-accent-bullish text-white"}`}>
            {result.mode === "mock" ? "Mock Mode" : "OpenAI"}
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {AVAILABLE_AI_ACTIONS.map((action) => (
          <button
            key={action.id}
            type="button"
            onClick={() => {
              setSelectedAction(action.id);
              setResult(null);
              setError(null);
            }}
            className={`flex items-center justify-center text-center text-sm font-bold tracking-wide leading-tight px-3 py-4 min-h-[70px] brutal-border transition-all duration-150 ${
              selectedAction === action.id
                ? "bg-ink text-white"
                : "bg-bg text-ink hover:bg-ink hover:text-white"
            }`}
          >
            {action.label}
          </button>
        ))}
      </div>

      <div className="text-sm font-bold text-text-secondary leading-relaxed">
        {AVAILABLE_AI_ACTIONS.find((a) => a.id === selectedAction)?.description}
      </div>

      <Button
        type="button"
        variant="primary"
        onClick={handleGenerate}
        disabled={loading}
        className="w-full"
      >
        {loading ? "Generating..." : "Generate"}
      </Button>

      {error && (
        <div className="bg-red-100 border-4 border-ink text-red-900 px-4 py-3 text-xs font-black uppercase">
          {error}
        </div>
      )}

      {result?.data && (
        <div className="space-y-3">
          <div className="bg-bg border-4 border-ink p-4 max-h-48 overflow-y-auto text-sm font-bold leading-relaxed">
            {result.data.content && <p>{result.data.content as string}</p>}
            {result.data.summary && <p>{result.data.summary as string}</p>}
            {result.data.seoTitle && (
              <p className="mb-1">
                <span className="text-text-secondary">SEO Title:</span> {result.data.seoTitle as string}
              </p>
            )}
            {result.data.metaDescription && (
              <p className="mb-1">
                <span className="text-text-secondary">Meta Desc:</span> {result.data.metaDescription as string}
              </p>
            )}
            {result.data.tags && (
              <div className="flex flex-wrap gap-1 mt-2">
                {(result.data.tags as string[]).map((tag, i) => (
                  <span key={i} className="bg-ink text-white px-2 py-0.5 text-[10px] font-black uppercase">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <Button type="button" variant="primary" onClick={handleInsert}>
            Insert into Editor
          </Button>
        </div>
      )}

      <div className="bg-yellow-100 border-4 border-ink px-4 py-3 text-[10px] font-black uppercase leading-relaxed">
        ⚠ AI generated content requires editorial review before publishing. The AI does not provide
        investment advice, guaranteed returns, or buy/sell signals.
      </div>
    </Card>
  );
}