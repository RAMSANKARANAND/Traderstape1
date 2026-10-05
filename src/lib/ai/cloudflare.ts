import type { AiRequest, AiResponse, AiAssistantResult } from "./types";
import { NEWS_PROMPTS } from "./prompts/news";
import { SEO_PROMPTS } from "./prompts/seo";
import { TAPE_VIEW_PROMPTS } from "./prompts/tapeView";
import { MORNING_BRIEF_PROMPT } from "./prompts/morningBrief";
import { NEWS_ROUNDUP_PROMPT } from "./prompts/newsRoundup";

const CF_MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";

interface CfMessage {
  role: "system" | "user";
  content: string;
}

interface CfRunResponse {
  result?: { response?: string };
  success: boolean;
  errors?: { message: string }[];
}

async function callCloudflareAI(messages: CfMessage[], opts: { json?: boolean } = {}): Promise<unknown> {
  const accountId = process.env.WORKERS_AI_ACCOUNT_ID;
  const apiToken = process.env.WORKERS_AI_API_TOKEN;

  if (!accountId || !apiToken) {
    throw new Error("Cloudflare credentials are not configured");
  }

  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${CF_MODEL}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messages, max_tokens: 1024, ...(opts.json ? { response_format: { type: "json_object" } } : {}) }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Cloudflare AI request failed (${res.status}): ${text}`);
  }

  const json = (await res.json()) as CfRunResponse;

  if (!json.success || !json.result) {
    const errMsg =
      json.errors?.map((e) => e.message).join(", ") || "Unknown Cloudflare AI error";
    throw new Error(errMsg);
  }

  return json.result.response;
}

const JSON_SEO_INSTRUCTION =
  "\n\nRespond with ONLY valid JSON in this exact shape, no markdown fences, no commentary: " +
  '{"seoTitle": string, "metaDescription": string, "keywords": string[]}. ' +
  "seoTitle must be under 60 characters, metaDescription under 160 characters, keywords should have 5-7 items.";

const JSON_TAGS_INSTRUCTION =
  "\n\nRespond with ONLY valid JSON in this exact shape, no markdown fences, no commentary: " +
  '{"tags": string[]}.';

function getStringFromRaw(raw: unknown): string {
  if (typeof raw === "string") return raw;
  if (raw && typeof raw === "object" && "response" in raw && typeof raw.response === "string") {
    return raw.response;
  }
  return "";
}

function buildMessages(req: AiRequest): CfMessage[] {
  switch (req.action) {
    case "generate-news-draft": {
      const p = NEWS_PROMPTS["generate-news-draft"];
      return [
        { role: "system", content: p.system },
        { role: "user", content: p.user({ title: req.title, category: req.category, content: req.content }) },
      ];
    }
    case "rewrite": {
      const p = NEWS_PROMPTS.rewrite;
      return [
        { role: "system", content: p.system },
        { role: "user", content: p.user({ content: req.content, tone: req.tone }) },
      ];
    }
    case "summarize": {
      const p = NEWS_PROMPTS.summarize;
      return [
        { role: "system", content: p.system },
        { role: "user", content: p.user({ content: req.content }) },
      ];
    }
    case "generate-tape-view": {
      const p = TAPE_VIEW_PROMPTS["generate-tape-view"];
      return [
        { role: "system", content: p.system },
        { role: "user", content: p.user({ title: req.title, content: req.content }) },
      ];
    }
    case "generate-seo": {
      const p = SEO_PROMPTS["generate-seo"];
      return [
        { role: "system", content: p.system },
        {
          role: "user",
          content: p.user({ title: req.title, content: req.content, category: req.category }) + JSON_SEO_INSTRUCTION,
        },
      ];
    }
    case "generate-tags": {
      const p = NEWS_PROMPTS["generate-tags"];
      return [
        { role: "system", content: p.system },
        {
          role: "user",
          content: p.user({ title: req.title, content: req.content, category: req.category }) + JSON_TAGS_INSTRUCTION,
        },
      ];
    }
    case "generate-morning-brief": {
      const p = MORNING_BRIEF_PROMPT;
      return [
        { role: "system", content: p.system },
        { role: "user", content: p.user() },
      ];
    }
    case "generate-news-roundup-summary": {
      const p = NEWS_ROUNDUP_PROMPT["generate-news-roundup-summary"];
      return [
        { role: "system", content: p.system },
        { role: "user", content: p.user({ title: req.title, category: req.category, content: req.content }) },
      ];
    }
    case "generate-tape-insight": {
      return [
        {
          role: "system",
          content:
            "You are a markets desk editor for TradersTape, a markets news site for Indian and global traders. " +
            "Write a market insight from the market data and headlines provided. " +
            "Rules: exactly 2 or 3 complete sentences, 40-70 words total. " +
            "Sentence 1: how Indian markets (Nifty 50, Sensex, Bank Nifty) are moving, with percentages. " +
            "Sentence 2: the most notable global, currency, commodity or crypto move, with percentages. " +
            "Sentence 3 (optional): what the headlines suggest for traders. " +
            "Use plain names, never ticker codes: ^NSEI = Nifty 50, ^BSESN = Sensex, ^NSEBANK = Bank Nifty, ^GSPC = S&P 500, " +
            "^IXIC = Nasdaq, ^DJI = Dow Jones, ^FTSE = FTSE 100, GC=F = gold, SI=F = silver, CL=F = crude oil. " +
            "Only use numbers that appear in the data. No investment advice, no price targets. " +
            "sentiment: Bullish if Indian indices are mostly up, Bearish if mostly down, Neutral if flat or mixed. " +
            'Format example only, do not reuse its facts: {"insight": "Nifty 50 rose 0.6% and Sensex gained 0.5%, led by metal stocks, while Bank Nifty slipped 0.2%. Crude oil climbed 1.8% as the dollar firmed against the yen. <one line on the most relevant headline>.", "sentiment": "Bullish"} ' +
            'Respond with ONLY valid JSON, no markdown fences, no commentary: {"insight": string, "sentiment": "Bullish" | "Bearish" | "Neutral"}.',
        },
        { role: "user", content: req.content || "" },
      ];
    }
    default:
      return [
        { role: "system", content: "You are a helpful assistant for TradersTape." },
        { role: "user", content: req.content || "" },
      ];
  }
}

function stripJsonFences(text: string): string {
  return text.replace(/```json/gi, "").replace(/```/g, "").trim();
}

function normalizeNewlines(text: string): string {
  return text.replace(/\\n/g, "\n");
}

export async function generateWithCloudflare(req: AiRequest): Promise<AiResponse> {
  const messages = buildMessages(req);
  const raw = await callCloudflareAI(messages, { json: req.action === "generate-news-roundup-summary" || req.action === "generate-tape-insight" });
  const safeRaw = getStringFromRaw(raw);

  switch (req.action) {
    case "generate-news-draft":
      return {
        success: true,
        mode: "cloudflare",
        message: "News draft generated successfully.",
        data: { content: normalizeNewlines(safeRaw) },
      };
    case "rewrite":
      return {
        success: true,
        mode: "cloudflare",
        message: "Content rewritten successfully.",
        data: { content: normalizeNewlines(safeRaw) },
      };
    case "summarize":
      return {
        success: true,
        mode: "cloudflare",
        message: "Content summarized.",
        data: { summary: normalizeNewlines(safeRaw) },
      };
    case "generate-tape-view":
      return {
        success: true,
        mode: "cloudflare",
        message: "Tape view analysis generated.",
        data: { content: normalizeNewlines(safeRaw) },
      };
    case "generate-seo": {
      try {
        const parsed = JSON.parse(stripJsonFences(safeRaw)) as {
          seoTitle: string;
          metaDescription: string;
          keywords: string[];
        };
        return {
          success: true,
          mode: "cloudflare",
          message: "SEO metadata generated.",
          data: {
            seoTitle: parsed.seoTitle,
            metaDescription: parsed.metaDescription,
            keywords: parsed.keywords,
          },
        };
      } catch {
        return {
          success: false,
          mode: "cloudflare",
          message: "Failed to parse SEO metadata from AI response.",
        };
      }
    }
    case "generate-tags": {
      try {
        const parsed = JSON.parse(stripJsonFences(safeRaw)) as { tags: string[] };
        return {
          success: true,
          mode: "cloudflare",
          message: "Tags generated.",
          data: { tags: parsed.tags },
        };
      } catch {
        return {
          success: false,
          mode: "cloudflare",
          message: "Failed to parse tags from AI response.",
        };
      }
    }
    case "generate-morning-brief": {
      return {
        success: true,
        mode: "cloudflare",
        message: "Morning brief generated.",
        data: { content: normalizeNewlines(safeRaw) },
      };
    }
case "generate-news-roundup-summary": {
      const validCats = ["Stocks", "Crypto", "Forex", "Geopolitical"];

      // Helper: extract structured fields from a parsed object
      function extractStructured(obj: Record<string, unknown>): AiAssistantResult | null {
        const summary = obj.summary;
        const category = obj.category;
        if (
          typeof summary !== "string" ||
          summary.trim() === "" ||
          typeof category !== "string" ||
          !validCats.includes(category)
        ) {
          return null;
        }
        const result: AiAssistantResult = {
          summary,
          category,
        };
        // Optional fields — only set if present and valid
        if (typeof obj.tldr === "string" && obj.tldr.trim() !== "") result.tldr = obj.tldr;
        if (typeof obj.whyItMatters === "string" && obj.whyItMatters.trim() !== "") result.whyItMatters = obj.whyItMatters;
        if (typeof obj.plainTitle === "string" && obj.plainTitle.trim() !== "") result.plainTitle = obj.plainTitle;
        if (Array.isArray(obj.keyFacts) && obj.keyFacts.every((f: unknown) => typeof f === "string" && f.trim() !== "")) {
          result.keyFacts = obj.keyFacts as string[];
        }
        return result;
      }

      // Case 1: raw is already a structured object (Cloudflare AI returns objects directly)
      if (raw && typeof raw === "object" && !Array.isArray(raw)) {
        const obj = raw as Record<string, unknown>;
        // The model may wrap the structured data in a "response" key
        const inner = (obj.response && typeof obj.response === "object") ? (obj.response as Record<string, unknown>) : obj;
        const extracted = extractStructured(inner);
        if (extracted) {
          return {
            success: true,
            mode: "cloudflare",
            message: "News roundup summary generated.",
            data: extracted,
          };
        }
        return {
          success: false,
          mode: "cloudflare",
          message: "AI returned null or invalid summary/category.",
        };
      }

      // Case 2: raw is a string that needs JSON parsing
      if (typeof raw === "string") {
        try {
          const parsed = JSON.parse(stripJsonFences(raw)) as Record<string, unknown>;
          const extracted = extractStructured(parsed);
          if (extracted) {
            return {
              success: true,
              mode: "cloudflare",
              message: "News roundup summary generated.",
              data: extracted,
            };
          }
          return {
            success: false,
            mode: "cloudflare",
            message: "Invalid response from AI for news roundup summary.",
          };
        } catch (err) {
          console.error("[AI DEBUG] String parse failed:", err);
          return {
            success: false,
            mode: "cloudflare",
            message: "Failed to parse news roundup summary from AI response.",
          };
        }
      }

      return {
        success: false,
        mode: "cloudflare",
        message: "Unexpected AI response shape for news roundup summary.",
      };
    }
    case "generate-tape-insight": {
      const validSentiments = ["Bullish", "Bearish", "Neutral"];
      let obj: Record<string, unknown> | null = null;
      if (raw && typeof raw === "object" && !Array.isArray(raw)) {
        const r = raw as Record<string, unknown>;
        obj = r.response && typeof r.response === "object" ? (r.response as Record<string, unknown>) : r;
      }
      if ((!obj || typeof obj.insight !== "string") && safeRaw) {
        try {
          obj = JSON.parse(stripJsonFences(safeRaw)) as Record<string, unknown>;
        } catch {
          obj = { insight: safeRaw.trim(), sentiment: "Neutral" };
        }
      }
      const insight = obj && typeof obj.insight === "string" ? obj.insight.trim() : "";
      if (!insight) {
        return { success: false, mode: "cloudflare", message: "AI returned empty tape insight." };
      }
      const s = obj && typeof obj.sentiment === "string" ? obj.sentiment : "Neutral";
      const sentiment = validSentiments.includes(s) ? s : "Neutral";
      return { success: true, mode: "cloudflare", message: "Tape insight generated.", data: { insight, sentiment } };
    }
    default:
      return {
        success: false,
        mode: "cloudflare",
        message: `Unknown action: ${req.action}`,
      };
  }
}
