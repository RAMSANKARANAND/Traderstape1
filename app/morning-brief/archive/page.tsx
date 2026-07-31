import { getPublishedMorningBriefs, countPublishedMorningBriefs } from "@/lib/db-raw";
import { Badge, Button } from "@/components/ui";
import Link from "next/link";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export default async function MorningBriefArchivePage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = Math.max(1, parseInt(searchParams.page || "1", 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;
  const [briefs, total] = await Promise.all([
    getPublishedMorningBriefs({ take: PAGE_SIZE, offset }),
    countPublishedMorningBriefs(),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-heading font-black uppercase">Morning Brief Archive</h1>
        <Link href="/morning-brief">
          <Button variant="secondary" size="sm">Latest Brief</Button>
        </Link>
      </div>

      {briefs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-body font-bold opacity-60">No archived briefs yet.</p>
        </div>
      )}

      <div className="space-y-4">
        {briefs.map((brief) => (
          <Link
            key={brief.id}
            href={`/morning-brief/${brief.slug}`}
            className="block brutal-card brutal-shadow p-4 border-ink hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[5px_5px_0_#111] transition-all duration-100"
          >
            <div className="flex items-center gap-3 mb-2">
              <Badge
                variant={
                  brief.sentiment === "Bullish"
                    ? "bullish"
                    : brief.sentiment === "Bearish"
                    ? "bearish"
                    : "neutral"
                }
                className="text-[10px]"
              >
                {brief.sentiment}
              </Badge>
              <span className="text-small font-bold uppercase opacity-60">
                {brief.publishedAt
                  ? new Date(brief.publishedAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : ""}
              </span>
              <span className="text-[10px] font-black uppercase opacity-40 ml-auto">
                {brief.confidence}% confidence
              </span>
            </div>
            <h3 className="text-card-title font-black uppercase leading-tight">{brief.headline}</h3>
            <p className="text-small font-bold opacity-70 mt-1 line-clamp-2">{brief.summary}</p>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          {page > 1 && (
            <Link
              href={`/morning-brief/archive?page=${page - 1}`}
              className="text-small font-black uppercase underline hover:text-accent-coral"
            >
              ← Previous
            </Link>
          )}
          <span className="text-small font-black uppercase opacity-60">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`/morning-brief/archive?page=${page + 1}`}
              className="text-small font-black uppercase underline hover:text-accent-coral"
            >
              Next →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}