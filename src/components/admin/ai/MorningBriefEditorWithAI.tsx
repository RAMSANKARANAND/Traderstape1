"use client";

import React, { useState, useEffect } from "react";
import { MorningBriefEditor } from "@/app/admin/(dashboard)/morning-brief/new/MorningBriefEditor";
import { AiAssistantPanel } from "./AiAssistantPanel";
import type { MorningBrief } from "@/lib/db-raw";

interface MorningBriefEditorWithAIProps {
  authorId: string;
  existing?: MorningBrief;
}

export function MorningBriefEditorWithAI({ authorId, existing }: MorningBriefEditorWithAIProps) {
  const [state, setState] = useState({
    headline: existing?.headline || "",
    slug: existing?.slug || "",
    sentiment: existing?.sentiment || "Neutral",
    confidence: existing?.confidence ?? 78,
    focusPoints: existing?.focusPoints || [],
    riskEvents: existing?.riskEvents || [],
    globalUs: existing?.globalUs || "Positive",
    globalEurope: existing?.globalEurope || "Cautious",
    globalAsia: existing?.globalAsia || "Mixed",
    summary: existing?.summary || "",
    body: existing?.body || "",
    seoTitle: existing?.seoTitle || "",
    seoDescription: existing?.seoDescription || "",
    isPublished: existing?.isPublished || false,
  });

  // Auto-generate slug when headline changes
  useEffect(() => {
    if (state.headline && !state.slug) {
      const generatedSlug = state.headline
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setState(prev => ({ ...prev, slug: generatedSlug }));
    }
  }, [state.headline]);

  const setters = {
    setHeadline: (v: string) => setState(prev => ({ ...prev, headline: v })),
    setSlug: (v: string) => setState(prev => ({ ...prev, slug: v })),
    setSentiment: (v: string) => setState(prev => ({ ...prev, sentiment: v })),
    setConfidence: (v: number) => setState(prev => ({ ...prev, confidence: v })),
    setFocusPoints: (v: string[]) => setState(prev => ({ ...prev, focusPoints: v })),
    setRiskEvents: (v: any[]) => setState(prev => ({ ...prev, riskEvents: v })),
    setGlobalUs: (v: string) => setState(prev => ({ ...prev, globalUs: v })),
    setGlobalEurope: (v: string) => setState(prev => ({ ...prev, globalEurope: v })),
    setGlobalAsia: (v: string) => setState(prev => ({ ...prev, globalAsia: v })),
    setSummary: (v: string) => setState(prev => ({ ...prev, summary: v })),
    setBody: (v: string) => setState(prev => ({ ...prev, body: v })),
    setSeoTitle: (v: string) => setState(prev => ({ ...prev, seoTitle: v })),
    setSeoDescription: (v: string) => setState(prev => ({ ...prev, seoDescription: v })),
    setIsPublished: (v: boolean) => setState(prev => ({ ...prev, isPublished: v })),
  };

  const handleInsertContent = (field: string, value: string) => {
    // Mapping AI response fields to editor state
    const mapping: Record<string, (v: string) => void> = {
      headline: setters.setHeadline,
      sentiment: setters.setSentiment,
      confidence: (v) => setters.setConfidence(parseInt(v) || 0),
      summary: setters.setSummary,
      body: setters.setBody,
      seoTitle: setters.setSeoTitle,
      seoDescription: setters.setSeoDescription,
      globalUs: setters.setGlobalUs,
      globalEurope: setters.setGlobalEurope,
      globalAsia: setters.setGlobalAsia,
    };

    if (mapping[field]) {
      mapping[field](value);
    }
  };

  const handleInsertTags = (tags: string[]) => {
    setters.setFocusPoints(tags);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="lg:col-span-2">
        <MorningBriefEditor 
          authorId={authorId} 
          existing={existing} 
          state={state} 
          setters={setters} 
        />
      </div>
      <div className="lg:col-span-1">
        <AiAssistantPanel 
          title={state.headline} 
          category="Morning Brief" 
          content={state.body || state.summary} 
          onInsertContent={handleInsertContent}
          onInsertTags={handleInsertTags}
        />
      </div>
    </div>
  );
}