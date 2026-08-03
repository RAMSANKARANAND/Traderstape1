export type AiAction =
  | "generate-news-draft"
  | "rewrite"
  | "generate-seo"
  | "generate-tags"
  | "summarize"
  | "rewrite-summary"
  | "generate-tape-view"
  | "generate-morning-brief"
  | "generate-news-roundup-summary";

export interface AiRequest {
  action: AiAction;
  content?: string;
  title?: string;
  category?: string;
  tone?: string;
  briefContext?: MorningBriefContext;
}

export interface AiAssistantResult {
  content?: string;
  summary?: string;
  seoTitle?: string;
  metaDescription?: string;
  tags?: string[];
  keywords?: string[];
  category?: string;
}

export interface AiResponse {
  success: boolean;
  mode: "mock" | "openai" | "cloudflare";
  message: string;
  data?: AiAssistantResult;
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

export interface MorningBriefContext {
  marketSentiment: string;
  marketPulse: string;
  marketQuotes: ReadonlyArray<{
    symbol: string;
    name: string;
    price: string;
    changePercent: string;
    direction: string;
    marketState?: string;
  }>;
  latestNews: ReadonlyArray<{
    title: string;
    category: string;
    summary: string;
    publishedAt?: string;
  }>;
  latestTapeViews: ReadonlyArray<{
    title: string;
    category: string;
    instrument: string;
    bias: string;
    todayView: string;
    keyLevelsToWatch?: string | null;
    riskFactors?: string | null;
  }>;
}