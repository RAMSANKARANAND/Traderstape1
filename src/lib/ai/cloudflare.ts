import type { AiRequest, AiResponse } from "./types";
import { NEWS_PROMPTS } from "./prompts/news";
import { SEO_PROMPTS } from "./prompts/seo";
import { TAPE_VIEW_PROMPTS } from "./prompts/tapeView";

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

async function callCloudflareAI(messages: CfMessage[]): Promise<string> {
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
    body: JSON.stringify({ messages }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Cloudflare AI request failed (${res.status}): ${text}`);
  }

  const json = (await res.json()) as CfRunResponse;

  if (!json.success || !json.result?.response) {
    const errMsg =
      json.errors?.map((e) => e.message).join(", ") || "Unknown Cloudflare AI error";
    throw new Error(errMsg);
  }

  return json.result.response.trim();
}

// JSON output is layered on top of the existing prompt content so structured
// actions (seo, tags) can be parsed reliably, without rewriting the prompts
// that already live in src/lib/ai/prompts/.
const JSON_SEO_INSTRUCTION =
  '\n\nRespond with ONLY valid JSON in this exact shape, no markdown fences, no commentary: ' +
  '{"seoTitle": string, "metaDescription": string, "keywords": string[]}. ' +
  "seoTitle must be under 60 characters, metaDescription under 160 characters, keywords should have 5-7 items.";

const JSON_TAGS_INSTRUCTION =
  '\n\nRespond with ONLY valid JSON in this exact shape, no markdown fences, no commentary: ' +
  '{"tags": string[]}.';

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

export async function generateWithCloudflare(req: AiRequest): Promise<AiResponse> {
  const messages = buildMessages(req);
  const raw = await callCloudflareAI(messages);

  switch (req.action) {
    case "generate-news-draft":
      return {
        success: true,
        mode: "cloudflare",
        message: "News draft generated successfully.",
        data: { content: raw },
      };
    case "rewrite":
      return {
        success: true,
        mode: "cloudflare",
        message: "Content rewritten successfully.",
        data: { content: raw },
      };
    case "summarize":
      return {
        success: true,
        mode: "cloudflare",
        message: "Content summarized.",
        data: { summary: raw },
      };
    case "generate-tape-view":
      return {
        success: true,
        mode: "cloudflare",
        message: "Tape view analysis generated.",
        data: { content: raw },
      };
    case "generate-seo": {
      try {
        const parsed = JSON.parse(stripJsonFences(raw)) as {
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
        const parsed = JSON.parse(stripJsonFences(raw)) as { tags: string[] };
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
    default:
      return {
        success: false,
        mode: "cloudflare",
        message: `Unknown action: ${req.action}`,
      };
  }
}