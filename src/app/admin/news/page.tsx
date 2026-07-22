import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { Card, Badge, SectionTitle } from "@/components/ui";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage News | TradersTape Admin",
};

export default async function AdminNewsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");

  const posts = await prisma.newsPost.findMany({
    orderBy: { updatedAt: "desc" },
    include: { author: { select: { name: true } } },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <SectionTitle className="mb-0">News Posts</SectionTitle>
        <Link
          href="/admin/news/new"
          className="bg-accent-yellow text-ink font-black uppercase px-4 py-2 brutal-border text-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-transform"
        >
          + New Post
        </Link>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-3 border-ink">
                <th className="py-3 px-4 font-black uppercase text-sm">Title</th>
                <th className="py-3 px-4 font-black uppercase text-sm">Category</th>
                <th className="py-3 px-4 font-black uppercase text-sm">Author</th>
                <th className="py-3 px-4 font-black uppercase text-sm">Published</th>
                <th className="py-3 px-4 font-black uppercase text-sm">Date</th>
                <th className="py-3 px-4 font-black uppercase text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center font-bold opacity-60">
                    No news posts yet. Create your first one!
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr key={post.id} className="border-b border-ink/20">
                    <td className="py-3 px-4 font-black text-sm max-w-[250px] truncate">
                      {post.title}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="default">{post.category}</Badge>
                    </td>
                    <td className="py-3 px-4 font-bold text-sm">{post.author.name}</td>
                    <td className="py-3 px-4">
                      {post.isPublished ? (
                        <span className="text-accent-teal font-black">YES</span>
                      ) : (
                        <span className="opacity-40 font-bold">DRAFT</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-xs font-bold">
                      {post.publishedAt
                        ? new Date(post.publishedAt).toLocaleDateString("en-IN")
                        : "—"}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Link
                          href={`/admin/news/${post.id}/edit`}
                          className="text-xs font-black uppercase bg-accent-blue text-white px-2 py-1 brutal-border border-2 border-ink"
                        >
                          Edit
                        </Link>
                        <form
                          action={async () => {
                            "use server";
                            const { prisma: db } = await import("@/lib/prisma");
                            await db.newsPost.update({
                              where: { id: post.id },
                              data: {
                                isPublished: !post.isPublished,
                                publishedAt: !post.isPublished ? new Date() : null,
                              },
                            });
                          }}
                        >
                          <button
                            type="submit"
                            className="text-xs font-black uppercase bg-accent-yellow text-ink px-2 py-1 brutal-border border-2 border-ink"
                          >
                            {post.isPublished ? "Unpub" : "Pub"}
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