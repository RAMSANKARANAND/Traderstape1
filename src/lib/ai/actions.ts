import type { AiAction } from "./types";

export const AVAILABLE_AI_ACTIONS: Array<{
  id: AiAction;
  label: string;
  description: string;
  fields: string[];
}> = [
  {
    id: "generate-news-draft",
    label: "News Draft",
    description: "Generate a full news article draft from title and category",
    fields: ["body"],
  },
  {
    id: "rewrite",
    label: "Rewrite",
    description: "Rewrite existing content for clarity and professionalism",
    fields: ["body"],
  },
  {
    id: "generate-seo",
    label: "SEO",
    description: "Generate SEO title and meta description",
    fields: ["seoTitle", "seoDescription"],
  },
  {
    id: "generate-tags",
    label: "Tags",
    description: "Generate relevant tags for the article",
    fields: ["tags"],
  },
  {
    id: "summarize",
    label: "Summary",
    description: "Generate a concise summary of the article",
    fields: ["summary"],
  },
  {
    id: "generate-tape-view",
    label: "Tape View",
    description: "Generate a market analysis view",
    fields: ["body"],
  },
];