"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge, Button } from "@/components/ui";
import { createMorningBrief, updateMorningBrief } from "@/lib/db-raw";
import type { MorningBrief } from "@/lib/db-raw";

type MorningBriefFormData = Omit<MorningBrief, "id" | "authorId" | "createdAt" | "updatedAt">;

interface MorningBriefEditorProps {
  authorId: string;
  existing?: MorningBrief;
  state?: {
    headline: string;
    slug: string;
    sentiment: string;
    confidence: number;
    focusPoints: string[];
    riskEvents: Array<{ level: string; title: string; description: string }>;
    globalUs: string;
    globalEurope: string;
    globalAsia: string;
    summary: string;
    body: string;
    seoTitle: string;
    seoDescription: string;
    isPublished: boolean;
  };
  setters?: {
    setHeadline: (v: string) => void;
    setSlug: (v: string) => void;
    setSentiment: (v: string) => void;
    setConfidence: (v: number) => void;
    setFocusPoints: (v: string[]) => void;
    setRiskEvents: (v: Array<{ level: string; title: string; description: string }>) => void;
    setGlobalUs: (v: string) => void;
    setGlobalEurope: (v: string) => void;
    setGlobalAsia: (v: string) => void;
    setSummary: (v: string) => void;
    setBody: (v: string) => void;
    setSeoTitle: (v: string) => void;
    setSeoDescription: (v: string) => void;
    setIsPublished: (v: boolean) => void;
  };
  onSubmit?: (data: MorningBriefFormData) => Promise<void> | void;
}

export function MorningBriefEditor({
  authorId,
  existing,
  state,
  setters,
  onSubmit,
}: MorningBriefEditorProps) {
  const router = useRouter();
  const isEdit = !!existing;

  // Internal state for uncontrolled mode
  const [internalHeadline, setInternalHeadline] = useState(existing?.headline || "");
  const [internalSlug, setInternalSlug] = useState(existing?.slug || "");
  const [internalSentiment, setInternalSentiment] = useState(existing?.sentiment || "Neutral");
  const [internalConfidence, setInternalConfidence] = useState(existing?.confidence ?? 78);
  const [internalFocusPoints, setInternalFocusPoints] = useState<string[]>(existing?.focusPoints || []);
  const [internalRiskEvents, setInternalRiskEvents] = useState<Array<{ level: string; title: string; description: string }>>(
    existing?.riskEvents || []
  );
  const [internalGlobalUs, setInternalGlobalUs] = useState(existing?.globalUs || "Positive");
  const [internalGlobalEurope, setInternalGlobalEurope] = useState(existing?.globalEurope || "Cautious");
  const [internalGlobalAsia, setInternalGlobalAsia] = useState(existing?.globalAsia || "Mixed");
  const [internalSummary, setInternalSummary] = useState(existing?.summary || "");
  const [internalBody, setInternalBody] = useState(existing?.body || "");
  const [internalSeoTitle, setInternalSeoTitle] = useState(existing?.seoTitle || "");
  const [internalSeoDescription, setInternalSeoDescription] = useState(existing?.seoDescription || "");
  const [internalIsPublished, setInternalIsPublished] = useState(existing?.isPublished || false);

  // Local inputs for adding items
  const [focusInput, setFocusInput] = useState("");
  const [riskInput, setRiskInput] = useState("");

  // Resolve values: use state prop if available, otherwise internal state
  const headline = state?.headline !== undefined ? state.headline : internalHeadline;
  const slug = state?.slug !== undefined ? state.slug : internalSlug;
  const sentiment = state?.sentiment !== undefined ? state.sentiment : internalSentiment;
  const confidence = state?.confidence !== undefined ? state.confidence : internalConfidence;
  const focusPoints = state?.focusPoints !== undefined ? state.focusPoints : internalFocusPoints;
  const riskEvents = state?.riskEvents !== undefined ? state.riskEvents : internalRiskEvents;
  const globalUs = state?.globalUs !== undefined ? state.globalUs : internalGlobalUs;
  const globalEurope = state?.globalEurope !== undefined ? state.globalEurope : internalGlobalEurope;
  const globalAsia = state?.globalAsia !== undefined ? state.globalAsia : internalGlobalAsia;
  const summary = state?.summary !== undefined ? state.summary : internalSummary;
  const body = state?.body !== undefined ? state.body : internalBody;
  const seoTitle = state?.seoTitle !== undefined ? state.seoTitle : internalSeoTitle;
  const seoDescription = state?.seoDescription !== undefined ? state.seoDescription : internalSeoDescription;
  const isPublished = state?.isPublished !== undefined ? state.isPublished : internalIsPublished;

  // Resolve setters: use setters prop if available, otherwise internal setter
  const setHeadline = setters?.setHeadline || setInternalHeadline;
  const setSlug = setters?.setSlug || setInternalSlug;
  const setSentiment = setters?.setSentiment || setInternalSentiment;
  const setConfidence = setters?.setConfidence || setInternalConfidence;
  const setFocusPoints = setters?.setFocusPoints || setInternalFocusPoints;
  const setRiskEvents = setters?.setRiskEvents || setInternalRiskEvents;
  const setGlobalUs = setters?.setGlobalUs || setInternalGlobalUs;
  const setGlobalEurope = setters?.setGlobalEurope || setInternalGlobalEurope;
  const setGlobalAsia = setters?.setGlobalAsia || setInternalGlobalAsia;
  const setSummary = setters?.setSummary || setInternalSummary;
  const setBody = setters?.setBody || setInternalBody;
  const setSeoTitle = setters?.setSeoTitle || setInternalSeoTitle;
  const setSeoDescription = setters?.setSeoDescription || setInternalSeoDescription;
  const setIsPublished = setters?.setIsPublished || setInternalIsPublished;

  const addFocus = () => {
    if (focusInput.trim()) {
      setFocusPoints([...focusPoints, focusInput.trim()]);
      setFocusInput("");
    }
  };

  const removeFocus = (i: number) => {
    setFocusPoints(focusPoints.filter((_, idx) => idx !== i));
  };

  const addRisk = () => {
    if (riskInput.trim()) {
      setRiskEvents([...riskEvents, { level: "Medium", title: riskInput.trim(), description: "" }]);
      setRiskInput("");
    }
  };

  const removeRisk = (i: number) => {
    setRiskEvents(riskEvents.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      headline,
      slug: slug || headline.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      sentiment,
      confidence,
      focusPoints,
      riskEvents,
      globalUs,
      globalEurope,
      globalAsia,
      summary,
      body,
      seoTitle: seoTitle || null,
      seoDescription: seoDescription || null,
      ogImageUrl: null,
      isPublished,
      publishedAt: isPublished ? new Date() : null,
    };

    if (onSubmit) {
      await onSubmit(data);
    } else {
      // Fallback to original behavior (for backward compatibility)
      try {
        if (isEdit && existing) {
          await updateMorningBrief(existing.id, data);
        } else {
          await createMorningBrief({ ...data, authorId });
        }
        router.push("/admin/morning-brief");
        router.refresh();
      } catch (err) {
        console.error("Save failed:", err);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-heading font-black uppercase mb-6">
        {isEdit ? "Edit Morning Brief" : "New Morning Brief"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Headline */}
        <div>
          <label className="block text-small font-black uppercase mb-1">Headline</label>
          <input
            type="text"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            className="w-full brutal-border p-3 text-body font-bold bg-white"
            required
          />
        </div>

        {/* Slug */}
        <div>
          <label className="block text-small font-black uppercase mb-1">Slug</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full brutal-border p-3 text-body font-bold bg-white"
          />
        </div>

        {/* Sentiment + Confidence */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-small font-black uppercase mb-1">Market Sentiment</label>
            <select
              value={sentiment}
              onChange={(e) => setSentiment(e.target.value)}
              className="w-full brutal-border p-3 text-body font-bold bg-white"
            >
              <option value="Bullish">Bullish</option>
              <option value="Neutral">Neutral</option>
              <option value="Bearish">Bearish</option>
            </select>
          </div>
          <div>
            <label className="block text-small font-black uppercase mb-1">AI Confidence (0-100)</label>
            <input
              type="number"
              min={0}
              max={100}
              value={confidence}
              onChange={(e) => setConfidence(Number(e.target.value))}
              className="w-full brutal-border p-3 text-body font-bold bg-white"
            />
          </div>
        </div>

        {/* Today's Focus */}
        <div>
          <label className="block text-small font-black uppercase mb-1">Today's Focus</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={focusInput}
              onChange={(e) => setFocusInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addFocus())}
              className="flex-1 brutal-border p-2 text-small font-bold bg-white"
              placeholder="Add focus point..."
            />
            <Button type="button" variant="secondary" size="sm" onClick={addFocus}>Add</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {focusPoints.map((point, i) => (
              <Badge key={i} variant="default" className="text-[10px] cursor-pointer" onClick={() => removeFocus(i)}>
                {point} ✕
              </Badge>
            ))}
          </div>
        </div>

        {/* Risk Events */}
        <div>
          <label className="block text-small font-black uppercase mb-1">Risk Events</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={riskInput}
              onChange={(e) => setRiskInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addRisk())}
              className="flex-1 brutal-border p-2 text-small font-bold bg-white"
              placeholder="Add risk event..."
            />
            <Button type="button" variant="secondary" size="sm" onClick={addRisk}>Add</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {riskEvents.map((risk, i) => (
              <Badge key={i} variant="default" className="text-[10px] cursor-pointer" onClick={() => removeRisk(i)}>
                {risk.title} ✕
              </Badge>
            ))}
          </div>
        </div>

        {/* Global Overview */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-small font-black uppercase mb-1">US Markets</label>
            <input
              type="text"
              value={globalUs}
              onChange={(e) => setGlobalUs(e.target.value)}
              className="w-full brutal-border p-2 text-small font-bold bg-white"
            />
          </div>
          <div>
            <label className="block text-small font-black uppercase mb-1">Europe</label>
            <input
              type="text"
              value={globalEurope}
              onChange={(e) => setGlobalEurope(e.target.value)}
              className="w-full brutal-border p-2 text-small font-bold bg-white"
            />
          </div>
          <div>
            <label className="block text-small font-black uppercase mb-1">Asia</label>
            <input
              type="text"
              value={globalAsia}
              onChange={(e) => setGlobalAsia(e.target.value)}
              className="w-full brutal-border p-2 text-small font-bold bg-white"
            />
          </div>
        </div>

        {/* Summary */}
        <div>
          <label className="block text-small font-black uppercase mb-1">AI Summary</label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={4}
            className="w-full brutal-border p-3 text-body font-bold bg-white"
            required
          />
        </div>

        {/* Body */}
        <div>
          <label className="block text-small font-black uppercase mb-1">Full Body (optional)</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={8}
            className="w-full brutal-border p-3 text-body font-bold bg-white"
          />
        </div>

        {/* SEO */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-small font-black uppercase mb-1">SEO Title</label>
            <input
              type="text"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              className="w-full brutal-border p-2 text-small font-bold bg-white"
            />
          </div>
          <div>
            <label className="block text-small font-black uppercase mb-1">SEO Description</label>
            <input
              type="text"
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              className="w-full brutal-border p-2 text-small font-bold bg-white"
            />
          </div>
        </div>

        {/* Publish toggle */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="w-5 h-5"
            />
            <span className="text-small font-black uppercase">Publish</span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-4 border-t-3 border-ink">
          <Button type="submit" variant="primary" size="md">
            {isEdit ? "Update Brief" : "Save Brief"}
          </Button>
          <Button type="button" variant="secondary" size="md" onClick={() => router.push("/admin/morning-brief")}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}