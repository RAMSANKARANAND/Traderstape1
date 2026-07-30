import { NextRequest, NextResponse } from "next/server";
import { generateAiContent } from "@/lib/ai/service";
import type { AiRequest } from "@/lib/ai/types";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as AiRequest;

    // Validate action
    const validActions = [
      "generate-news-draft",
      "rewrite",
      "generate-seo",
      "generate-tags",
      "summarize",
      "generate-tape-view",
      "generate-morning-brief",
    ];

    if (!body.action || !validActions.includes(body.action)) {
      return NextResponse.json(
        {
          success: false,
          mode: "mock",
          message: `Invalid action. Must be one of: ${validActions.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const result = await generateAiContent(body);

    return NextResponse.json(result, {
      status: result.success ? 200 : 500,
    });
  } catch (error) {
    console.error("AI generate API error:", error);
    return NextResponse.json(
      {
        success: false,
        mode: "mock",
        message: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}