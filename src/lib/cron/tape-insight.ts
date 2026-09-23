import { getMarketQuotes } from "@/lib/market/service";
import { getPublishedNewsPosts } from "@/lib/db-raw";
import { generateAiContent } from "@/lib/ai/service";
import { generateId } from "@/lib/db-raw";
import type { AiRequest, AiResponse } from "@/lib/ai/types";
import { getD1 } from "@/lib/db-raw";

export interface TapeInsightResult {
  success: true;
  insight: string;
  id: string;
}

export async function runTapeInsight(): Promise<{ success: true; insight: string; id: string } | { success: false; error: string }> {
  try {
    // Fetch current market data (quotes)
    const marketQuotes = await getMarketQuotes();
    // Fetch recent headlines (latest 5 published news posts)
    const recentNews = await getPublishedNewsPosts({ take: 5 });

    // Prepare market data summary for AI prompt
    const marketSummary = marketQuotes
      .map(
        (q) =>
          `${q.symbol}: ${q.price.toFixed(2)} (${q.changePercent >= 0 ? "+" : ""}${q.changePercent.toFixed(2)}%)`
      )
      .join(", ");

    // Prepare recent headlines summary
    const headlinesSummary = recentNews
      .map((n) => n.title)
      .join("; ");

    // Compose prompt for AI
    const aiReq: AiRequest = {
      action: "generate-tape-insight",
      title: "Market Snapshot",
      content: `Market Data: ${marketSummary}\nRecent Headlines: ${headlinesSummary}`,
      // We don't have a category for tape insight; we can leave empty or use a custom category.
      // The action doesn't require category; we can omit.
    };

    const aiRes = await generateAiContent(aiReq);
    if (!aiRes.success) {
      return { success: false, error: aiRes.message };
    }

    const insightText = (aiRes.data as { insight?: string })?.insight;
    if (!insightText) {
      return { success: false, error: "AI returned empty insight" };
    }

    // Save to D1
    const d1 = await getD1();
    const id = generateId();
    const now = new Date().toISOString();
    await d1
      .prepare(
        `INSERT INTO TapeInsight (id, sentiment, summary, createdAt) VALUES (?, ?, ?, ?)`
      )
      .bind(id, "Neutral", insightText, now)
      .run();

    return { success: true, insight: insightText, id };
  } catch (error) {
    console.error("[Tape Insight Cron] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}