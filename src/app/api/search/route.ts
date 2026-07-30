import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const runtime = "edge";

interface SearchResult {
  id: string;
  title: string;
  slug: string;
  category: string;
  publishedAt: string | null;
  excerpt: string;
  type: "NEWS" | "TAPE VIEW" | "MORNING BRIEF";
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");

  if (!query || query.length < 2) {
    return NextResponse.json([]);
  }

  try {
    const { env } = getCloudflareContext();
    const db = env.traderstape;
    const searchTerm = `%${query}%`;

    // Search NewsPost
    const newsResults = await db.prepare(`
      SELECT 
        id, 
        title, 
        slug, 
        category, 
        publishedAt, 
        summary as excerpt, 
        'NEWS' as type 
      FROM NewsPost 
      WHERE (title LIKE ? OR summary LIKE ? OR body LIKE ? OR category LIKE ? OR slug LIKE ?)
      AND isPublished = 1
    `).bind(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm).all();

    // Search TapeView
    const tapeResults = await db.prepare(`
      SELECT 
        id, 
        title, 
        slug, 
        category, 
        publishedAt, 
        todayView as excerpt, 
        'TAPE VIEW' as type 
      FROM TapeView 
      WHERE (title LIKE ? OR body LIKE ? OR category LIKE ? OR instrument LIKE ? OR slug LIKE ?)
      AND isPublished = 1
    `).bind(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm).all();

    // Search MorningBrief
    const briefResults = await db.prepare(`
      SELECT 
        id, 
        headline as title, 
        slug, 
        'MORNING BRIEF' as category, 
        publishedAt, 
        summary as excerpt, 
        'MORNING BRIEF' as type 
      FROM MorningBrief 
      WHERE (headline LIKE ? OR summary LIKE ? OR body LIKE ? OR slug LIKE ?)
      AND isPublished = 1
    `).bind(searchTerm, searchTerm, searchTerm, searchTerm).all();

    // Combine and cast results
    const allResults = [
      ...(newsResults.results as unknown as SearchResult[]),
      ...(tapeResults.results as unknown as SearchResult[]),
      ...(briefResults.results as unknown as SearchResult[]),
    ]
      .sort((a, b) => {
        const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
        const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 20);

    return NextResponse.json(allResults);
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}