import { NextRequest, NextResponse } from "next/server";
import { getD1 } from "@/lib/db-raw";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const d1 = await getD1();
    const result = await d1
      .prepare(
        `SELECT id, sentiment, summary, createdAt FROM TapeInsight ORDER BY createdAt DESC LIMIT 1`
      )
      .first();

    if (!result) {
      return NextResponse.json({
        success: false,
        insight: "Market insight data is being generated. Please check back shortly.",
      });
    }

    return NextResponse.json({
      success: true,
      insight: result.summary as string,
      id: result.id as string,
      createdAt: result.createdAt as string,
    });
  } catch (error) {
    console.error("[Tape Insight API] Error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}