import { getAllMorningBriefs } from "@/lib/db-raw";
import { getSessionUser } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Badge, Button } from "@/components/ui";
import { togglePublish, deleteBrief } from "./actions";

export const dynamic = "force-dynamic";

export default async function MorningBriefAdminPage() {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");

  const briefs = await getAllMorningBriefs();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-heading font-black uppercase">Morning Brief</h1>
        <Link href="/admin/morning-brief/new">
          <Button variant="primary" size="sm">New Brief</Button>
        </Link>
      </div>

      <div className="brutal-card brutal-shadow border-ink overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b-3 border-ink bg-bg-surface">
              <th className="p-3 text-small font-black uppercase">Headline</th>
              <th className="p-3 text-small font-black uppercase">Date</th>
              <th className="p-3 text-small font-black uppercase">Sentiment</th>
              <th className="p-3 text-small font-black uppercase">Status</th>
              <th className="p-3 text-small font-black uppercase">Updated</th>
              <th className="p-3 text-small font-black uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {briefs.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-small font-bold opacity-60">
                  No morning briefs yet. Create your first one.
                </td>
              </tr>
            )}
            {briefs.map((brief) => (
              <tr key={brief.id} className="border-b-2 border-ink/10 table-row-hover">
                <td className="p-3 text-small font-bold">{brief.headline}</td>
                <td className="p-3 text-small font-bold">
                  {brief.publishedAt
                    ? new Date(brief.publishedAt).toLocaleDateString("en-GB")
                    : brief.createdAt.toLocaleDateString("en-GB")}
                </td>
                <td className="p-3">
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
                </td>
                <td className="p-3">
                  <Badge variant={brief.isPublished ? "bullish" : "default"} className="text-[10px]">
                    {brief.isPublished ? "Published" : "Draft"}
                  </Badge>
                </td>
                <td className="p-3 text-small font-bold">
                  {new Date(brief.updatedAt).toLocaleDateString("en-GB")}
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <form action={togglePublish}>
                      <input type="hidden" name="id" value={brief.id} />
                      <button
                        type="submit"
                        className="text-[11px] font-black uppercase underline hover:text-accent-coral"
                      >
                        {brief.isPublished ? "Unpublish" : "Publish"}
                      </button>
                    </form>
                    <Link
                      href={`/admin/morning-brief/${brief.id}/edit`}
                      className="text-[11px] font-black uppercase underline hover:text-accent-coral"
                    >
                      Edit
                    </Link>
                    <form action={deleteBrief}>
                      <input type="hidden" name="id" value={brief.id} />
                      <button
                        type="submit"
                        className="text-[11px] font-black uppercase underline text-bear hover:opacity-80"
                      >
                        Delete
                      </button>
                    </form>
                    {brief.isPublished && (
                      <Link
                        href={`/morning-brief/${brief.slug}`}
                        className="text-[11px] font-black uppercase underline hover:text-accent-coral"
                      >
                        Preview
                      </Link>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}