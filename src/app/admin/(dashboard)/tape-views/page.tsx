import { getSessionUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { Card, Badge, SectionTitle } from "@/components/ui";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage Tape Views | TradersTape Admin",
};

interface TapeViewArticle {
  id: string;
  title: string;
  category: "STOCKS" | "CRYPTO" | "FOREX" | "COMMODITIES";
  author: string;
  status: "published" | "draft";
  publishedAt: string | null;
}

const placeholderArticles: TapeViewArticle[] = [
  {
    id: "1",
    title: "NIFTY Daily View",
    category: "STOCKS",
    author: "Editorial Team",
    status: "published",
    publishedAt: "2026-07-26T09:30:00+05:30",
  },
  {
    id: "2",
    title: "Bank Nifty Outlook",
    category: "STOCKS",
    author: "Editorial Team",
    status: "published",
    publishedAt: "2026-07-25T16:00:00+05:30",
  },
  {
    id: "3",
    title: "Gold (XAU/USD)",
    category: "COMMODITIES",
    author: "Editorial Team",
    status: "published",
    publishedAt: "2026-07-25T11:15:00+05:30",
  },
  {
    id: "4",
    title: "Silver",
    category: "COMMODITIES",
    author: "Editorial Team",
    status: "draft",
    publishedAt: null,
  },
  {
    id: "5",
    title: "Bitcoin",
    category: "CRYPTO",
    author: "Editorial Team",
    status: "published",
    publishedAt: "2026-07-24T10:00:00+05:30",
  },
  {
    id: "6",
    title: "USD/INR",
    category: "FOREX",
    author: "Editorial Team",
    status: "draft",
    publishedAt: null,
  },
  {
    id: "7",
    title: "Weekly Market Outlook",
    category: "STOCKS",
    author: "Editorial Team",
    status: "published",
    publishedAt: "2026-07-22T18:30:00+05:30",
  },
];

export default async function AdminTapeViewsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <SectionTitle className="mb-0">Tape Views</SectionTitle>
        <span className="text-xs font-black uppercase bg-accent-yellow text-ink px-3 py-2 brutal-border border-2 border-ink">
          Coming Soon
        </span>
      </div>

      <Card className="mb-6">
        <p className="text-sm font-bold opacity-70">
          This section is under construction. The management interface for Tape Views
          editorial articles will appear here once the feature is fully implemented.
          For now, this page displays placeholder records to preview the future layout.
        </p>
      </Card>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b-3 border-ink">
              <th className="py-3 px-4 font-black uppercase text-sm">Title</th>
              <th className="py-3 px-4 font-black uppercase text-sm">Category</th>
              <th className="py-3 px-4 font-black uppercase text-sm">Author</th>
              <th className="py-3 px-4 font-black uppercase text-sm">Status</th>
              <th className="py-3 px-4 font-black uppercase text-sm">Published At</th>
              <th className="py-3 px-4 font-black uppercase text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {placeholderArticles.map((article) => (
              <tr key={article.id} className="border-b border-ink/20 table-row-hover">
                <td className="py-3 px-4 font-black">{article.title}</td>
                <td className="py-3 px-4 font-bold text-sm">{article.category}</td>
                <td className="py-3 px-4 font-bold text-sm">{article.author}</td>
                <td className="py-3 px-4">
                  <Badge variant={article.status === "published" ? "up" : "flat"}>
                    {article.status === "published" ? "Published" : "Draft"}
                  </Badge>
                </td>
                <td className="py-3 px-4 text-xs font-bold">
                  {article.publishedAt
                    ? new Date(article.publishedAt).toLocaleDateString("en-IN")
                    : "—"}
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <span className="text-xs font-black uppercase bg-accent-yellow text-ink px-2 py-1 brutal-border border-2 border-ink opacity-50">
                      Edit
                    </span>
                    <span className="text-xs font-black uppercase bg-accent-teal text-white px-2 py-1 brutal-border border-2 border-ink opacity-50">
                      {article.status === "published" ? "Unpublish" : "Publish"}
                    </span>
                    <span className="text-xs font-black uppercase bg-accent-coral text-white px-2 py-1 brutal-border border-2 border-ink opacity-50">
                      Delete
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {placeholderArticles.length === 0 && (
          <p className="mt-4 text-sm font-bold">No tape view articles found.</p>
        )}
      </div>
    </div>
  );
}
