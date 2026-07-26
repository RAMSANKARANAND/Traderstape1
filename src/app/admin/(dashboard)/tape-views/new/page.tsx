import { getSessionUser } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getDbAsync } from "@/lib/prisma";
import { Card, SectionTitle, Button } from "@/components/ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Tape View | TradersTape Admin",
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

const categories = [
  { value: "NSE", label: "NSE" },
  { value: "FOREX", label: "Forex" },
  { value: "CRYPTO", label: "Crypto" },
  { value: "COMMODITIES", label: "Commodities" },
  { value: "GLOBAL_MARKETS", label: "Global Markets" },
  { value: "WEEKLY_OUTLOOK", label: "Weekly Outlook" },
  { value: "SPECIAL_REPORT", label: "Special Report" },
];

const instruments = [
  { value: "NIFTY 50", label: "NIFTY 50" },
  { value: "BANK NIFTY", label: "BANK NIFTY" },
  { value: "FINNIFTY", label: "FINNIFTY" },
  { value: "SENSEX", label: "SENSEX" },
  { value: "USD/INR", label: "USD/INR" },
  { value: "EUR/USD", label: "EUR/USD" },
  { value: "GBP/USD", label: "GBP/USD" },
  { value: "USD/JPY", label: "USD/JPY" },
  { value: "BTC", label: "BTC" },
  { value: "ETH", label: "ETH" },
  { value: "XAU/USD", label: "XAU/USD" },
  { value: "Silver", label: "Silver" },
  { value: "Crude Oil", label: "Crude Oil" },
  { value: "Natural Gas", label: "Natural Gas" },
];

const biases = [
  { value: "BULLISH", label: "Bullish" },
  { value: "BEARISH", label: "Bearish" },
  { value: "NEUTRAL", label: "Neutral" },
];

export default async function NewTapeViewPage() {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SectionTitle className="mb-8">New Tape View</SectionTitle>

      <Card>
        <form
          action={async (formData: FormData) => {
            "use server";
            const session = await getSessionUser();
            if (!session) redirect("/admin/login");

            const title = formData.get("title") as string;
            const slug = slugify(title);

            const prisma = await getDbAsync();
            await prisma.tapeView.create({
              data: {
                title,
                slug,
                category: formData.get("category") as any,
                instrument: formData.get("instrument") as string,
                bias: formData.get("bias") as any,
                support1: (formData.get("support1") as string) || null,
                support2: (formData.get("support2") as string) || null,
                support3: (formData.get("support3") as string) || null,
                resistance1: (formData.get("resistance1") as string) || null,
                resistance2: (formData.get("resistance2") as string) || null,
                resistance3: (formData.get("resistance3") as string) || null,
                keyLevelsToWatch: (formData.get("keyLevelsToWatch") as string) || null,
                todayView: formData.get("todayView") as string,
                riskFactors: (formData.get("riskFactors") as string) || null,
                educationalDisclaimer: (formData.get("educationalDisclaimer") as string) || null,
                body: formData.get("body") as string,
                authorId: session.id,
                seoTitle: (formData.get("seoTitle") as string) || null,
                seoDescription: (formData.get("seoDescription") as string) || null,
                ogImageUrl: (formData.get("ogImageUrl") as string) || null,
                isPublished: formData.get("isPublished") === "on",
                publishedAt: formData.get("isPublished") === "on" ? new Date() : null,
              },
            });
            redirect("/admin/tape-views");
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
              placeholder="e.g. NIFTY Daily View: Support at 24,800"
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
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="instrument" className="block text-sm font-black uppercase mb-2">
              Instrument
            </label>
            <select
              id="instrument"
              name="instrument"
              required
              className="w-full px-4 py-3 font-bold brutal-border bg-bg text-ink"
            >
              {instruments.map((inst) => (
                <option key={inst.value} value={inst.value}>
                  {inst.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="bias" className="block text-sm font-black uppercase mb-2">
              Bias
            </label>
            <select
              id="bias"
              name="bias"
              required
              className="w-full px-4 py-3 font-bold brutal-border bg-bg text-ink"
            >
              {biases.map((b) => (
                <option key={b.value} value={b.value}>
                  {b.label}
                </option>
              ))}
            </select>
          </div>

          <div className="border-t-3 border-ink pt-6">
            <h3 className="font-black uppercase mb-4">Technical Levels</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="support1" className="block text-xs font-black uppercase mb-1">
                  Support 1
                </label>
                <input
                  id="support1"
                  name="support1"
                  type="text"
                  placeholder="e.g. 24,800"
                  className="w-full px-4 py-2 font-bold brutal-border bg-bg text-ink"
                />
              </div>
              <div>
                <label htmlFor="support2" className="block text-xs font-black uppercase mb-1">
                  Support 2
                </label>
                <input
                  id="support2"
                  name="support2"
                  type="text"
                  placeholder="e.g. 24,700"
                  className="w-full px-4 py-2 font-bold brutal-border bg-bg text-ink"
                />
              </div>
              <div>
                <label htmlFor="support3" className="block text-xs font-black uppercase mb-1">
                  Support 3
                </label>
                <input
                  id="support3"
                  name="support3"
                  type="text"
                  placeholder="e.g. 24,600"
                  className="w-full px-4 py-2 font-bold brutal-border bg-bg text-ink"
                />
              </div>
              <div>
                <label htmlFor="resistance1" className="block text-xs font-black uppercase mb-1">
                  Resistance 1
                </label>
                <input
                  id="resistance1"
                  name="resistance1"
                  type="text"
                  placeholder="e.g. 25,100"
                  className="w-full px-4 py-2 font-bold brutal-border bg-bg text-ink"
                />
              </div>
              <div>
                <label htmlFor="resistance2" className="block text-xs font-black uppercase mb-1">
                  Resistance 2
                </label>
                <input
                  id="resistance2"
                  name="resistance2"
                  type="text"
                  placeholder="e.g. 25,200"
                  className="w-full px-4 py-2 font-bold brutal-border bg-bg text-ink"
                />
              </div>
              <div>
                <label htmlFor="resistance3" className="block text-xs font-black uppercase mb-1">
                  Resistance 3
                </label>
                <input
                  id="resistance3"
                  name="resistance3"
                  type="text"
                  placeholder="e.g. 25,300"
                  className="w-full px-4 py-2 font-bold brutal-border bg-bg text-ink"
                />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="keyLevelsToWatch" className="block text-sm font-black uppercase mb-2">
              Key Levels to Watch
            </label>
            <input
              id="keyLevelsToWatch"
              name="keyLevelsToWatch"
              type="text"
              placeholder="e.g. 24,800 (S1), 25,100 (R1)"
              className="w-full px-4 py-3 font-bold brutal-border bg-bg text-ink"
            />
          </div>

          <div>
            <label htmlFor="todayView" className="block text-sm font-black uppercase mb-2">
              Today's Market View
            </label>
            <textarea
              id="todayView"
              name="todayView"
              rows={4}
              required
              placeholder="Today's market view and key observations..."
              className="w-full px-4 py-3 font-bold brutal-border bg-bg text-ink"
            />
          </div>

          <div>
            <label htmlFor="riskFactors" className="block text-sm font-black uppercase mb-2">
              Risk Factors
            </label>
            <textarea
              id="riskFactors"
              name="riskFactors"
              rows={3}
              placeholder="Key risk factors to consider..."
              className="w-full px-4 py-3 font-bold brutal-border bg-bg text-ink"
            />
          </div>

          <div>
            <label htmlFor="educationalDisclaimer" className="block text-sm font-black uppercase mb-2">
              Educational Disclaimer
            </label>
            <textarea
              id="educationalDisclaimer"
              name="educationalDisclaimer"
              rows={2}
              placeholder="This content is for educational purposes only..."
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
              placeholder="Write your full editorial analysis here..."
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
                  placeholder="Leave blank to use today's view"
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
              Create Tape View
            </Button>
            <Link href="/admin/tape-views">
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
