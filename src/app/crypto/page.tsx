import { prisma } from "@/lib/prisma";
import { SectionTitle, Badge, Card } from "@/components/ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Crypto Levels",
  description: "Cryptocurrency market levels and analysis. Bitcoin, Ethereum, and altcoin support and resistance. For educational purposes only.",
  openGraph: {
    title: "Crypto Levels | TradersTape",
    description: "Cryptocurrency market levels and analysis. Bitcoin, Ethereum, and altcoin support and resistance.",
  },
};

export default async function CryptoPage() {
  // Crypto uses the same MarketLevel model with a crypto-specific asset type
  // For now, we show a placeholder since crypto levels can be added via admin
  const levels = await prisma.marketLevel.findMany({
    where: { isPublished: true, assetType: "STOCK_FNO" },
    orderBy: { updatedAt: "desc" },
    take: 0, // No crypto levels in seed data yet
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SectionTitle className="mb-2">Crypto Levels</SectionTitle>
      <p className="text-sm font-bold opacity-60 mb-8 uppercase tracking-wide">
        Cryptocurrency market levels for educational purposes
      </p>

      <Card className="text-center py-12" accent="yellow">
        <p className="text-lg font-black uppercase">Crypto Levels Coming Soon</p>
        <p className="text-sm font-bold opacity-60 mt-2">
          We're adding crypto market levels. Check back soon or explore our stock and forex levels.
        </p>
      </Card>
    </div>
  );
}