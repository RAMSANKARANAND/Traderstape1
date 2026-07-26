import { getDbAsync } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { Card, SectionTitle } from "@/components/ui";
import TapeViewsTable from "./TapeViewsTable";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage Tape Views | TradersTape Admin",
};

export default async function AdminTapeViewsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");

  const prisma = await getDbAsync();
  const tapeViews = await prisma.tapeView.findMany({
    orderBy: { updatedAt: "desc" },
    include: { author: { select: { name: true } } },
  });

  const normalizedTapeViews = tapeViews.map((tv) => ({
    id: tv.id,
    title: tv.title,
    category: tv.category as any,
    instrument: tv.instrument,
    bias: tv.bias as any,
    author: tv.author,
    isPublished: tv.isPublished,
    publishedAt: tv.publishedAt ? tv.publishedAt.toISOString() : null,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <SectionTitle className="mb-0">Tape Views</SectionTitle>
        <Link
          href="/admin/tape-views/new"
          className="text-xs font-black uppercase bg-accent-yellow text-ink px-3 py-2 brutal-border border-2 border-ink hover:translate-x-0.5 hover:translate-y-0.5 transition-transform"
        >
          + New Tape View
        </Link>
      </div>

      <Card>
        <TapeViewsTable tapeViews={normalizedTapeViews} userRole={user.role} />
      </Card>
    </div>
  );
}