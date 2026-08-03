import type { AiAction } from "./types";

export const AVAILABLE_AI_ACTIONS: Array<{
  id: AiAction;
  label: string;
  description: string;
  fields: string[];
}> = [
  {
    id: "generate-morning-brief",
    label: "Generate Morning Brief",
    description: "Generate a complete morning brief draft",
    fields: ["headline", "sentiment", "confidence", "focusPoints", "riskEvents", "globalUs", "globalEurope", "globalAsia", "summary", "body", "seoTitle", "seoDescription"],
  },
  {
    id: "generate-tape-view",
    label: "Generate Analysis",
    description: "Generate a full market analysis from title and category",
    fields: ["body", "todayView"],
  },
  {
    id: "rewrite",
    label: "Rewrite Analysis",
    description: "Rewrite existing analysis for clarity and professionalism",
    fields: ["body"],
  },
  {
    id: "rewrite-summary",
    label: "Rewrite Summary",
    description: "Rewrite the summary for better impact",
    fields: ["summary"],
  },
  {
    id: "summarize",
    label: "Summarize",
    description: "Generate a concise summary of the analysis",
    fields: ["todayView"],
  },
  {
    id: "generate-seo",
    label: "Generate SEO",
    description: "Generate SEO title and meta description",
    fields: ["seoTitle", "seoDescription"],
  },
  {
    id: "generate-news-draft",
    label: "Generate News Draft",
    description: "Generate a news draft from title and category",
    fields: ["title", "category", "content"],
  },
  {
    id: "generate-news-roundup-summary",
    label: "Generate News Roundup Summary",
    description: "Generate a short factual summary and category for a news roundup item",
    fields: ["title", "category", "content"],
  },
];
