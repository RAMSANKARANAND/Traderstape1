export type AiAction =
  | "generate-news-draft"
  | "rewrite"
  | "generate-seo"
  | "generate-tags"
  | "summarize"
  | "generate-tape-view";

export interface AiRequest {
  action: AiAction;
  content?: string;
  title?: string;
  category?: string;
  tone?: string;
}

export interface AiResponse {
  success: boolean;
  mode: "mock" | "openai";
  message: string;
  data?: Record<string, string | string[]>;
}