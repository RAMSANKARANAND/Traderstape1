export type AiAction =
  | "generate-news-draft"
  | "rewrite"
  | "generate-seo"
  | "generate-tags"
  | "summarize"
  | "rewrite-summary"
  | "generate-tape-view"
  | "generate-morning-brief";

export interface AiRequest {
  action: AiAction;
  content?: string;
  title?: string;
  category?: string;
  tone?: string;
}

export interface AiResponse {
  success: boolean;
  mode: "mock" | "openai" | "cloudflare";
  message: string;
  data?: Record<string, string | string[]>;
}

export interface MorningBriefData {
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
}