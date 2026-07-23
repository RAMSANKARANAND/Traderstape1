import { getSessionUser } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, SectionTitle, Button } from "@/components/ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New News Post | TradersTape Admin",
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export default async function NewNewsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SectionTitle className="mb-8">New News Post</SectionTitle>

      <Card>
        <form
          action={async (formData: FormData) => {
            "use server";
            const session = await getSessionUser();
            if (!session) redirect("/admin/login");

            const title = formData.get("title") as string;
            const slug = slugify(title);

            await prisma.newsPost.create({
              data: {
                title,
                slug,
                category: formData.get("category") as "STOCKS" | "CRYPTO" | "FOREX" | "GEOPOLITICAL",
                summary: formData.get("summary") as string,
                body: formData.get("body") as string,
                authorId: session.id,
                seoTitle: (formData.get("seoTitle") as string) || null,
                seoDescription: (formData.get("seoDescription") as string) || null,
                ogImageUrl: (formData.get("ogImageUrl") as string) || null,
                isPublished: formData.get("isPublished") === "on",
                publishedAt: formData.get("isPublished") === "on" ? new Date() : null,
              },
            });
            redirect("/admin/news");
          }}
          className="space-y-6"
        >
          <div>
            <label htmlFor="title" className="block text-sm font-black uppercase mb-2">
              Title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              placeholder="e.g. Nifty Breaks 25000 for First Time"
              className="w-full px-4 py-3 font-bold brutal-border bg-bg text-ink"
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-black uppercase mb-2">
              Category
            </label>
            <select
              id="category"
              name="category"
              required
              className="w-full px-4 py-3 font-bold brutal-border bg-bg text-ink"
            >
              <option value="STOCKS">Stocks</option>
              <option value="CRYPTO">Crypto</option>
              <option value="FOREX">Forex</option>
              <option value="GEOPOLITICAL">Geopolitical</option>
            </select>
          </div>

          <div>
            <label htmlFor="summary" className="block text-sm font-black uppercase mb-2">
              Summary
            </label>
            <textarea
              id="summary"
              name="summary"
              rows={3}
              required
              placeholder="Brief summary of the article..."
              className="w-full px-4 py-3 font-bold brutal-border bg-bg text-ink"
            />
          </div>

          <div>
            <label htmlFor="body" className="block text-sm font-black uppercase mb-2">
              Body (Markdown-style: ## for headings, - for lists)
            </label>
            <textarea
              id="body"
              name="body"
              rows={12}
              required
              placeholder="Write your article here..."
              className="w-full px-4 py-3 font-bold brutal-border bg-bg text-ink font-mono"
            />
          </div>

          <div className="border-t-3 border-ink pt-6">
            <h3 className="font-black uppercase mb-4">SEO Settings (Optional)</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="seoTitle" className="block text-sm font-black uppercase mb-2">
                  SEO Title
                </label>
                <input
                  id="seoTitle"
                  name="seoTitle"
                  type="text"
                  placeholder="Leave blank to use article title"
                  className="w-full px-4 py-3 font-bold brutal-border bg-bg text-ink"
                />
              </div>
              <div>
                <label htmlFor="seoDescription" className="block text-sm font-black uppercase mb-2">
                  SEO Description
                </label>
                <textarea
                  id="seoDescription"
                  name="seoDescription"
                  rows={2}
                  placeholder="Leave blank to use summary"
                  className="w-full px-4 py-3 font-bold brutal-border bg-bg text-ink"
                />
              </div>
              <div>
                <label htmlFor="ogImageUrl" className="block text-sm font-black uppercase mb-2">
                  OG Image URL
                </label>
                <input
                  id="ogImageUrl"
                  name="ogImageUrl"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-3 font-bold brutal-border bg-bg text-ink"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              id="isPublished"
              name="isPublished"
              type="checkbox"
              className="w-5 h-5 brutal-border"
            />
            <label htmlFor="isPublished" className="font-black uppercase text-sm">
              Publish immediately
            </label>
          </div>

          <div className="flex gap-4">
            <Button type="submit" variant="primary">
              Create Post
            </Button>
            <Link href="/admin/news">
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}