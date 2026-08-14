import { NextRequest, NextResponse } from "next/server";
import { generateAiContent } from "@/lib/ai/service";
import type { AiRequest } from "@/lib/ai/types";
import { auth } from "@/lib/auth";
import { getKvNamespace, checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    // Rate limiting by IP using KV
    const ip = request.headers.get("cf-connecting-ip") || "unknown";
    const kv = await getKvNamespace();
    if (kv) {
      const rateLimit = await checkRateLimit(kv, ip, "ai", 10, 60);
      if (!rateLimit.allowed) {
        return NextResponse.json(
          { success: false, message: "Rate limit exceeded. Try again later." },
          { status: 429, headers: { "Retry-After": String(rateLimit.retryAfter) } }
        );
      }
    }

    // Auth guard
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    const userRole = (session.user as any).role;
    const allowedRoles = ["ADMIN", "EDITOR", "CONTRIBUTOR"];
    if (!allowedRoles.includes(userRole)) {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

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
    console.error("AI generate API error:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });
    return NextResponse.json(
      {
        success: false,
        mode: "mock",
        message: "Generation failed",
      },
      { status: 500 }
    );
  }
}