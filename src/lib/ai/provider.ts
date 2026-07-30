import type { AiRequest, AiResponse } from "./types";
import { generateWithCloudflare } from "./cloudflare";

const MOCK_RESPONSES: Record<string, (req: AiRequest) => AiResponse> = {
  "generate-news-draft": (req) => ({
    success: true,
    mode: "mock",
    message: "News draft generated successfully.",
    data: {
      content: `[Mock] ${req.title || "Market Update"}: Indian equity markets opened higher today, tracking positive global cues. The Nifty 50 index gained 0.5% in early trade, led by banking and IT stocks. Market participants are closely watching the RBI's monetary policy decision later this week.${req.content ? ` Key context: ${req.content}` : ""}`,
    },
  }),
  rewrite: (req) => ({
    success: true,
    mode: "mock",
    message: "Content rewritten successfully.",
    data: {
      content: `[Mock Rewrite] ${req.content || "Original content"} — Revised for clarity and professional tone.`,
    },
  }),
  "generate-seo": (req) => ({
    success: true,
    mode: "mock",
    message: "SEO metadata generated.",
    data: {
      seoTitle: `${req.title || "Market Update"} | TradersTape`,
      metaDescription: `Latest analysis on ${req.title || "financial markets"}. Expert insights and key levels from TradersTape.`,
      keywords: ["Nifty", "Stock Market", "Trading", "Finance", "India Markets"],
    },
  }),
  "generate-tags": (req) => ({
    success: true,
    mode: "mock",
    message: "Tags generated.",
    data: {
      tags: [
        req.category || "Markets",
        req.title || "Trading",
        "Nifty",
        "Stock Market",
        "Financial News",
        "Investment",
        "Economy",
      ],
    },
  }),
  summarize: (req) => ({
    success: true,
    mode: "mock",
    message: "Content summarized.",
    data: {
      summary: `[Mock Summary] ${req.content ? req.content.slice(0, 100) + "..." : "No content provided."} Key market movements and actionable insights summarized for quick reading.`,
    },
  }),
  "generate-tape-view": (req) => ({
    success: true,
    mode: "mock",
    message: "Tape view analysis generated.",
    data: {
      content: `[Mock Tape View] ${req.title || "Market Analysis"}\n\nMarket Overview:\nIndian markets are showing mixed signals with the Nifty consolidating near key resistance levels.\n\nKey Levels:\n- Support: 24,000\n- Resistance: 24,500\n- Pivot: 24,250\n\nSentiment: Neutral with a bullish bias\n\nRisk Factors:\n- Global interest rate decisions\n- Crude oil price movements\n- FII/DII flow data`,
    },
  }),
  "generate-morning-brief": () => ({
    success: true,
    mode: "mock",
    message: "Morning brief generated.",
    data: {
      content: `MARKET SENTIMENT\nBullish - Domestic equities are favoured amid easing yield pressures and upbeat earnings signals.\n\nAI CONFIDENCE\n78%\n\nTODAY'S FOCUS\n• RBI policy commentary\n• USD/INR stability\n• Banking stocks\n• Gold rally\n• IT earnings\n\nGLOBAL OVERVIEW\nUS Markets: Positive\nEurope: Cautious\nAsia: Mixed\n\nRISK EVENTS\nHigh: RBI policy\nMedium: US CPI\nLow: crude oil\n\nAI SUMMARY\nMarkets opened with a bullish undertone. Nifty holds above 24,000 with support building. RBI commentary will guide rates. Global cues are mixed but not disruptive.`,
    },
  }),
};

export function getAiProvider() {
  const cloudflareAccountId = process.env.WORKERS_AI_ACCOUNT_ID;
  const cloudflareApiToken = process.env.WORKERS_AI_API_TOKEN;
  const openaiApiKey = process.env.OPENAI_API_KEY;

  // Cloudflare Workers AI takes priority if configured
  if (cloudflareAccountId && cloudflareApiToken) {
    console.log("Selected AI Provider: cloudflare (credentials detected)");
    return {
      name: "cloudflare" as const,
      async generate(req: AiRequest): Promise<AiResponse> {
        try {
          return await generateWithCloudflare(req);
        } catch (err) {
          console.error("Cloudflare AI failed, falling back to mock:", err);
          const handler = MOCK_RESPONSES[req.action];
          if (!handler) {
            return {
              success: false,
              mode: "mock",
              message: `Unknown action: ${req.action}`,
            };
          }
          return handler(req);
        }
      },
    };
  }

  if (openaiApiKey) {
    console.log("Selected AI Provider: openai (credentials detected)");
    return {
      name: "openai" as const,
      async generate(req: AiRequest): Promise<AiResponse> {
        // Future: implement OpenAI integration here
        // Only the provider.ts file needs to change
        const handler = MOCK_RESPONSES[req.action];
        if (!handler) {
          return {
            success: false,
            mode: "openai",
            message: `Unknown action: ${req.action}`,
          };
        }
        return handler(req);
      },
    };
  }

  console.log("Selected AI Provider: mock (no Cloudflare credentials detected)");
  return {
    name: "mock" as const,
    async generate(req: AiRequest): Promise<AiResponse> {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      const handler = MOCK_RESPONSES[req.action];
      if (!handler) {
        return {
          success: false,
          mode: "mock",
          message: `Unknown action: ${req.action}`,
        };
      }

      return handler(req);
    },
  };
}
