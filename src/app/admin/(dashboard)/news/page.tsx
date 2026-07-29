import { getAllNewsPosts } from "@/lib/db-raw";
import { getSessionUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { Card, Badge, SectionTitle, Button } from "@/components/ui";
import NewsTable from "./NewsTable";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage News | TradersTape Admin",
};

export default async function AdminNewsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");

  const posts = await getAllNewsPosts();

  const normalizedPosts = posts.map((post) => ({
    id: post.id,
    title: post.title,
    category: post.category === "GEOPOLITICAL" ? "GEOPOLITICS" : (post.category as any),
    author: post.author,
    isPublished: post.isPublished,
    publishedAt: post.publishedAt ? post.publishedAt.toISOString() : null,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <SectionTitle className="mb-0">News Posts</SectionTitle>
        <Link
          href="/admin/news/new"
          className="text-xs font-black uppercase bg-accent-yellow text-ink px-3 py-2 brutal-border border-2 border-ink hover:translate-x-0.5 hover:translate-y-0.5 transition-transform"
        >
          + New Post
        </Link>
      </div>

      <Card>
        <NewsTable posts={normalizedPosts} userRole={user.role} />
      </Card>
    </div>
  );
}