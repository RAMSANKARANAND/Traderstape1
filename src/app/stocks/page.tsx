import { prisma } from "@/lib/prisma";
import { SectionTitle, Badge, Card } from "@/components/ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Stock F&O Levels",
  description: "Live stock F&O levels, support and resistance for Nifty, Bank Nifty, and individual stocks. For educational purposes only.",
  openGraph: {
    title: "Stock F&O Levels | TradersTape",
    description: "Live stock F&O levels, support and resistance for Nifty, Bank Nifty, and individual stocks.",
  },
};

export default async function StocksPage() {
  const levels = await prisma.marketLevel.findMany({
    where: { isPublished: true, assetType: "STOCK_FNO" },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SectionTitle className="mb-2">Stock F&O Levels</SectionTitle>
      <p className="text-sm font-bold opacity-60 mb-8 uppercase tracking-wide">
        Key support and resistance levels for educational purposes
      </p>

      {levels.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-lg font-black uppercase">No levels available yet</p>
          <p className="text-sm font-bold opacity-60 mt-2">Check back soon for updated market levels.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {levels.map((level) => (
            <Card key={level.id} accent={level.direction === "UP" ? "teal" : level.direction === "DOWN" ? "coral" : "yellow"}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-black uppercase">{level.symbol}</h3>
                <Badge variant={level.direction.toLowerCase() as "up" | "down" | "flat"}>
                  {level.direction === "UP" ? "▲ BULL" : level.direction === "DOWN" ? "▼ BEAR" : "◆ FLAT"}
                </Badge>
              </div>
              <div className="text-3xl font-black mb-2">{level.level}</div>
              {level.note && (
                <p className="text-sm font-bold opacity-70">{level.note}</p>
              )}
              <p className="text-xs font-bold opacity-50 mt-3">
                Updated: {new Date(level.updatedAt).toLocaleString("en-IN")}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}