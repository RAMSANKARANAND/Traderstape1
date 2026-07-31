import { getMarketQuotes } from "@/lib/market/service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const quotes = await getMarketQuotes();

    if (quotes.length === 0) {
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
  } catch {
    return Response.json(
      { success: false, message: "Market data temporarily unavailable." },
      { status: 503 }
    );
  }
}