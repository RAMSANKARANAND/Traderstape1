import { getSessionUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, SectionTitle, Button } from "@/components/ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Market Level | TradersTape Admin",
};

export default async function NewLevelPage() {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SectionTitle className="mb-8">New Market Level</SectionTitle>

      <Card>
        <form
          action={async (formData: FormData) => {
            "use server";
            const session = await getSessionUser();
            if (!session) redirect("/admin/login");

            await prisma.marketLevel.create({
              data: {
                symbol: formData.get("symbol") as string,
                assetType: formData.get("assetType") as "STOCK_FNO" | "FOREX",
                level: parseFloat(formData.get("level") as string),
                note: (formData.get("note") as string) || "",
                direction: formData.get("direction") as "UP" | "DOWN" | "FLAT",
                updatedBy: session.id,
                isPublished: formData.get("isPublished") === "on",
              },
            });
            redirect("/admin/levels");
          }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="symbol" className="block text-sm font-black uppercase mb-2">
                Symbol
              </label>
              <input
                id="symbol"
                name="symbol"
                type="text"
                required
                placeholder="e.g. NIFTY"
                className="w-full px-4 py-3 font-bold brutal-border bg-bg text-ink"
              />
            </div>
            <div>
              <label htmlFor="assetType" className="block text-sm font-black uppercase mb-2">
                Asset Type
              </label>
              <select
                id="assetType"
                name="assetType"
                required
                className="w-full px-4 py-3 font-bold brutal-border bg-bg text-ink"
              >
                <option value="STOCK_FNO">Stock F&O</option>
                <option value="FOREX">Forex</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="level" className="block text-sm font-black uppercase mb-2">
                Level / Price
              </label>
              <input
                id="level"
                name="level"
                type="text"
                required
                placeholder="e.g. 24500"
                className="w-full px-4 py-3 font-bold brutal-border bg-bg text-ink"
              />
            </div>
            <div>
              <label htmlFor="direction" className="block text-sm font-black uppercase mb-2">
                Direction
              </label>
              <select
                id="direction"
                name="direction"
                required
                className="w-full px-4 py-3 font-bold brutal-border bg-bg text-ink"
              >
                <option value="UP">Up ▲</option>
                <option value="DOWN">Down ▼</option>
                <option value="FLAT">Flat ◆</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="note" className="block text-sm font-black uppercase mb-2">
              Note (optional)
            </label>
            <textarea
              id="note"
              name="note"
              rows={3}
              placeholder="e.g. Key resistance level"
              className="w-full px-4 py-3 font-bold brutal-border bg-bg text-ink"
            />
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
              Create Level
            </Button>
            <Button type="button" variant="secondary" onClick={() => redirect("/admin/levels")}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}