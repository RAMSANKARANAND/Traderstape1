import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { Card, Badge, SectionTitle } from "@/components/ui";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage Levels | TradersTape Admin",
};

export default async function AdminLevelsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");

  const levels = await prisma.marketLevel.findMany({
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <SectionTitle className="mb-0">Market Levels</SectionTitle>
        <Link
          href="/admin/levels/new"
          className="bg-accent-yellow text-ink font-black uppercase px-4 py-2 brutal-border text-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-transform"
        >
          + New Level
        </Link>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-3 border-ink">
                <th className="py-3 px-4 font-black uppercase text-sm">Symbol</th>
                <th className="py-3 px-4 font-black uppercase text-sm">Type</th>
                <th className="py-3 px-4 font-black uppercase text-sm">Level</th>
                <th className="py-3 px-4 font-black uppercase text-sm">Direction</th>
                <th className="py-3 px-4 font-black uppercase text-sm">Published</th>
                <th className="py-3 px-4 font-black uppercase text-sm">Updated</th>
                <th className="py-3 px-4 font-black uppercase text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {levels.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center font-bold opacity-60">
                    No levels yet. Create your first one!
                  </td>
                </tr>
              ) : (
                levels.map((level) => (
                  <tr key={level.id} className="border-b border-ink/20">
                    <td className="py-3 px-4 font-black">{level.symbol}</td>
                    <td className="py-3 px-4 font-bold text-sm">{level.assetType}</td>
                    <td className="py-3 px-4 font-bold">{level.level}</td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          level.direction === "UP"
                            ? "up"
                            : level.direction === "DOWN"
                            ? "down"
                            : "flat"
                        }
                      >
                        {level.direction}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      {level.isPublished ? (
                        <span className="text-accent-teal font-black">YES</span>
                      ) : (
                        <span className="opacity-40 font-bold">DRAFT</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-xs font-bold">
                      {new Date(level.updatedAt).toLocaleDateString("en-IN")}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Link
                          href={`/admin/levels/${level.id}/edit`}
                          className="text-xs font-black uppercase bg-accent-blue text-white px-2 py-1 brutal-border border-2 border-ink"
                        >
                          Edit
                        </Link>
                        <form
                          action={async () => {
                            "use server";
                            const { prisma: db } = await import("@/lib/prisma");
                            await db.marketLevel.update({
                              where: { id: level.id },
                              data: { isPublished: !level.isPublished },
                            });
                          }}
                        >
                          <button
                            type="submit"
                            className="text-xs font-black uppercase bg-accent-yellow text-ink px-2 py-1 brutal-border border-2 border-ink"
                          >
                            {level.isPublished ? "Unpub" : "Publish"}
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}