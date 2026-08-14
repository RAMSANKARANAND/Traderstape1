import { getMarketQuotes } from "@/lib/market/service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const quotes = await getMarketQuotes();

    if (quotes.length === 0) {
      console.error("[Market API] No quotes returned from providers");
      return Response.json(
        { success: false, message: "Market data temporarily unavailable." },
        { status: 503 }
      );
    }

    const updatedAt = new Date().toISOString();

    return Response.json(
      { success: true, updatedAt, quotes },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
  } catch (error) {
    console.error("[Market API] Error fetching quotes:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    return Response.json(
      {
        success: false,
        message: "Market data temporarily unavailable.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 }
    );
  }
}