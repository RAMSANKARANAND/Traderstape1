import type { AiAction } from "./types";

export const AVAILABLE_AI_ACTIONS: Array<{
  id: AiAction;
  label: string;
  description: string;
  fields: string[];
}> = [
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
];
