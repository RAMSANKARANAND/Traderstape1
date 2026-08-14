import { NextRequest, NextResponse } from "next/server";
import { runNewsRoundup } from "@/lib/cron/news-roundup";

export const maxDuration = 300; // 5 minutes for cron

// This HTTP route is kept for manual triggering and testing.
// It requires the CRON_SECRET header for authentication.
// The native Cloudflare scheduled() handler in worker.ts handles the hourly
// automated runs without requiring HTTP auth.

export async function GET(request: NextRequest) {
  const cronSecret = request.headers.get("x-cron-secret");
  if (!process.env.CRON_SECRET || cronSecret !== process.env.CRON_SECRET) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const result = await runNewsRoundup();
    return NextResponse.json(result);
  } catch (error) {
    console.error("[News Roundup Cron] Error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
