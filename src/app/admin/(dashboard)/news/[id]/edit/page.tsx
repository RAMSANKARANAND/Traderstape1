import { getSessionUser } from "@/lib/session";
import { redirect, notFound } from "next/navigation";
import { getDbAsync } from "@/lib/prisma";
import { Card, SectionTitle, Button } from "@/components/ui";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit News Post | TradersTape Admin",
};

export default async function EditNewsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");

  const { id } = await params;
  const prisma = await getDbAsync();
  const post = await prisma.newsPost.findUnique({ where: { id } });
  if (!post) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SectionTitle className="mb-8">Edit News Post</SectionTitle>

      <Card>
        <form
          action={async (formData: FormData) => {
            "use server";
            const session = await getSessionUser();
            if (!session) redirect("/admin/login");
            const db = await getDbAsync();

            await db.newsPost.update({
              where: { id },
              data: {
                title: formData.get("title") as string,
                category: formData.get("category") as "STOCKS" | "CRYPTO" | "FOREX" | "GEOPOLITICAL",
                summary: formData.get("summary") as string,
                body: formData.get("body") as string,
                seoTitle: (formData.get("seoTitle") as string) || null,
                seoDescription: (formData.get("seoDescription") as string) || null,
                ogImageUrl: (formData.get("ogImageUrl") as string) || null,
                isPublished: formData.get("isPublished") === "on",
                publishedAt: formData.get("isPublished") === "on" ? (post.publishedAt || new Date()) : null,
              },
            });
            redirect("/admin/news");
          }}
          className="space-y-6"
        >
          <div>
            <label htmlFor="title" className="block text-sm font-black uppercase mb-2">Title</label>
            <input id="title" name="title" type="text" required defaultValue={post.title}
              className="w-full px-4 py-3 font-bold brutal-border bg-bg text-ink" />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-black uppercase mb-2">Category</label>
            <select id="category" name="category" required defaultValue={post.category}
              className="w-full px-4 py-3 font-bold brutal-border bg-bg text-ink">
              <option value="STOCKS">Stocks</option>
              <option value="CRYPTO">Crypto</option>
              <option value="FOREX">Forex</option>
              <option value="GEOPOLITICAL">Geopolitical</option>
            </select>
          </div>

          <div>
            <label htmlFor="summary" className="block text-sm font-black uppercase mb-2">Summary</label>
            <textarea id="summary" name="summary" rows={3} required defaultValue={post.summary}
              className="w-full px-4 py-3 font-bold brutal-border bg-bg text-ink" />
          </div>

          <div>
            <label htmlFor="body" className="block text-sm font-black uppercase mb-2">Body</label>
            <textarea id="body" name="body" rows={12} required defaultValue={post.body}
              className="w-full px-4 py-3 font-bold brutal-border bg-bg text-ink font-mono" />
          </div>

          <div className="border-t-3 border-ink pt-6">
            <h3 className="font-black uppercase mb-4">SEO Settings (Optional)</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="seoTitle" className="block text-sm font-black uppercase mb-2">SEO Title</label>
                <input id="seoTitle" name="seoTitle" type="text" defaultValue={post.seoTitle || ""}
                  className="w-full px-4 py-3 font-bold brutal-border bg-bg text-ink" />
              </div>
              <div>
                <label htmlFor="seoDescription" className="block text-sm font-black uppercase mb-2">SEO Description</label>
                <textarea id="seoDescription" name="seoDescription" rows={2} defaultValue={post.seoDescription || ""}
                  className="w-full px-4 py-3 font-bold brutal-border bg-bg text-ink" />
              </div>
              <div>
                <label htmlFor="ogImageUrl" className="block text-sm font-black uppercase mb-2">OG Image URL</label>
                <input id="ogImageUrl" name="ogImageUrl" type="url" defaultValue={post.ogImageUrl || ""}
                  className="w-full px-4 py-3 font-bold brutal-border bg-bg text-ink" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input id="isPublished" name="isPublished" type="checkbox" defaultChecked={post.isPublished}
              className="w-5 h-5 brutal-border" />
            <label htmlFor="isPublished" className="font-black uppercase text-sm">Published</label>
          </div>

          <div className="flex gap-4">
            <Button type="submit" variant="primary">Save Changes</Button>
            <Link href="/admin/news">
              <Button type="button" variant="secondary">Cancel</Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}