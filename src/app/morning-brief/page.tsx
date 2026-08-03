import { getLatestPublishedMorningBrief } from "@/lib/db-raw";
import { MorningMarketBriefCard } from "@/components/ai/MorningMarketBriefCard";
import Link from "next/link";
import { Badge, Button } from "@/components/ui";
import ReactMarkdown from "react-markdown";

function normalizeBodyContent(content: string): string {
  return content.replace(/\\n/g, "\n");
}

export const dynamic = "force-dynamic";

export default async function MorningBriefPage() {
  const brief = await getLatestPublishedMorningBrief();

  if (!brief) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h1 className="text-heading font-black uppercase mb-4">Morning Market Brief</h1>
        <p className="text-body font-bold opacity-60">No brief available yet.</p>
      </div>
    );
  }

  const briefData = {
    sentiment: brief.sentiment,
    confidence: brief.confidence,
    focusPoints: brief.focusPoints as readonly string[],
    globalOverview: {
      us: brief.globalUs,
      europe: brief.globalEurope,
      asia: brief.globalAsia,
    },
    riskEvents: brief.riskEvents as ReadonlyArray<{ level: "High" | "Medium" | "Low"; title: string; description: string }>,
    summary: brief.summary,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-heading font-black uppercase">Morning Market Brief</h1>
        <Link href="/morning-brief/archive">
          <Button variant="secondary" size="sm">Archive</Button>
        </Link>
      </div>

      <div className="max-w-3xl mx-auto">
        <MorningMarketBriefCard
          data={briefData}
          lastUpdated={brief.publishedAt
            ? new Date(brief.publishedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
            : undefined}
        />

{brief.body && (
          <div className="mt-6 brutal-card brutal-shadow p-5 border-ink">
            <h2 className="text-card-title font-black uppercase mb-3">Full Analysis</h2>
            <div className="text-body font-bold leading-relaxed whitespace-pre-wrap text-base">
              <div className="prose-invert text-base leading-6">
                <ReactMarkdown>
                  {normalizeBodyContent(brief.body)}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        )}

        {brief.seoTitle && (
          <div className="mt-4 text-small font-bold opacity-60">
            <p>SEO: {brief.seoTitle}</p>
            {brief.seoDescription && <p>{brief.seoDescription}</p>}
          </div>
        )}
      </div>
    </div>
  );
}