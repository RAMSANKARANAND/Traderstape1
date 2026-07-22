import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create admin user
  const adminPasswordHash = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@traderstape.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@traderstape.com",
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
    },
  });
  console.log(`Created admin user: ${admin.email}`);

  // Create editor user
  const editorPasswordHash = await bcrypt.hash("editor123", 12);
  const editor = await prisma.user.upsert({
    where: { email: "editor@traderstape.com" },
    update: {},
    create: {
      name: "Editor",
      email: "editor@traderstape.com",
      passwordHash: editorPasswordHash,
      role: Role.EDITOR,
    },
  });
  console.log(`Created editor user: ${editor.email}`);

  // Create contributor user
  const contributorPasswordHash = await bcrypt.hash("contributor123", 12);
  const contributor = await prisma.user.upsert({
    where: { email: "contributor@traderstape.com" },
    update: {},
    create: {
      name: "Contributor",
      email: "contributor@traderstape.com",
      passwordHash: contributorPasswordHash,
      role: Role.CONTRIBUTOR,
    },
  });
  console.log(`Created contributor user: ${contributor.email}`);

  // Create sample market levels
  const marketLevels = [
    { assetType: "STOCK_FNO" as const, symbol: "NIFTY", level: 24500, direction: "UP" as const, note: "Key resistance at 24800", isPublished: true },
    { assetType: "STOCK_FNO" as const, symbol: "BANKNIFTY", level: 51200, direction: "DOWN" as const, note: "Support at 50500", isPublished: true },
    { assetType: "STOCK_FNO" as const, symbol: "RELIANCE", level: 2850, direction: "UP" as const, note: "Strong momentum", isPublished: true },
    { assetType: "STOCK_FNO" as const, symbol: "TCS", level: 3950, direction: "FLAT" as const, note: "Consolidation zone", isPublished: true },
    { assetType: "FOREX" as const, symbol: "EUR/USD", level: 1.0850, direction: "UP" as const, note: "Above 200 EMA", isPublished: true },
    { assetType: "FOREX" as const, symbol: "GBP/USD", level: 1.2650, direction: "DOWN" as const, note: "Bearish divergence", isPublished: true },
    { assetType: "FOREX" as const, symbol: "USD/JPY", level: 154.50, direction: "UP" as const, note: "BoJ intervention zone", isPublished: true },
  ];

  // Delete existing levels to avoid duplicates on re-run
  await prisma.marketLevel.deleteMany();

  for (const level of marketLevels) {
    await prisma.marketLevel.create({
      data: {
        ...level,
        updatedBy: admin.id,
      },
    });
  }
  console.log(`Created ${marketLevels.length} market levels`);

  // Create sample news posts
  const newsPosts = [
    {
      title: "Nifty Breaks 24500 as Bulls Regain Control",
      slug: "nifty-breaks-24500-bulls-regain-control",
      category: "STOCKS" as const,
      summary: "The Nifty 50 index surged past the 24500 mark on strong buying across sectors, signaling renewed bullish momentum.",
      body: `## Market Overview\n\nThe Nifty 50 index closed above the psychologically important 24500 level for the first time this month, driven by broad-based buying in banking, IT, and auto stocks.\n\n## Key Drivers\n\n- Strong FII inflows of ₹2,500 crore\n- Positive global cues from US markets\n- Easing crude oil prices\n\n## Technical Outlook\n\nThe index has formed a bullish flag pattern on the daily chart, suggesting further upside potential. Key resistance is now at 24800, while support has moved up to 24200.\n\n*This is for educational purposes only. Not financial advice.*`,
      isPublished: true,
      publishedAt: new Date(),
    },
    {
      title: "EUR/USD Tests Key Resistance at 1.0900",
      slug: "eur-usd-tests-key-resistance",
      category: "FOREX" as const,
      summary: "The euro continues its rally against the dollar as ECB signals potential rate hold.",
      body: `## Forex Update\n\nThe EUR/USD pair is testing the critical 1.0900 resistance level after a week of steady gains.\n\n## Fundamental Factors\n\n- ECB President hints at maintaining current rates\n- US jobless claims come in higher than expected\n- Eurozone manufacturing PMI shows improvement\n\n## Technical Levels\n\n- Resistance: 1.0900, 1.0950\n- Support: 1.0800, 1.0750\n\nThe pair remains in an uptrend but is overbought on the daily RSI.\n\n*This is for educational purposes only. Not financial advice.*`,
      isPublished: true,
      publishedAt: new Date(),
    },
    {
      title: "Bitcoin Volatility Spikes on Regulatory News",
      slug: "bitcoin-volatility-regulatory-news",
      category: "CRYPTO" as const,
      summary: "Crypto markets see increased volatility as multiple countries announce new regulatory frameworks.",
      body: `## Crypto Market Update\n\nBitcoin experienced a 5% intraday swing as regulatory news from both the US and EU created uncertainty in the crypto markets.\n\n## Key Developments\n\n- US SEC announces new crypto custody rules\n- EU MiCA implementation timeline clarified\n- Institutional inflows remain strong despite volatility\n\n## Market Impact\n\nBitcoin is currently trading at $67,500, with Ethereum at $3,450. Altcoins have seen mixed performance.\n\n*This is for educational purposes only. Not financial advice.*`,
      isPublished: true,
      publishedAt: new Date(),
    },
    {
      title: "Geopolitical Tensions Impact Oil Markets",
      slug: "geopolitical-tensions-oil-markets",
      category: "GEOPOLITICAL" as const,
      summary: "Rising tensions in the Middle East push crude oil prices higher, impacting global markets.",
      body: `## Geopolitical Analysis\n\nEscalating tensions in the Middle East have pushed Brent crude above $85 per barrel, creating ripple effects across global financial markets.\n\n## Market Impact\n\n- Oil & gas stocks rally on higher prices\n- Airline stocks decline on fuel cost concerns\n- Safe-haven assets like gold see increased demand\n\n## What to Watch\n\n- Diplomatic efforts in the coming days\n- OPEC+ response to price movements\n- Impact on central bank rate decisions\n\n*This is for educational purposes only. Not financial advice.*`,
      isPublished: true,
      publishedAt: new Date(),
    },
  ];

  for (const post of newsPosts) {
    await prisma.newsPost.upsert({
      where: { slug: post.slug },
      update: {
        title: post.title,
        category: post.category,
        summary: post.summary,
        body: post.body,
        isPublished: post.isPublished,
        publishedAt: post.publishedAt,
        authorId: editor.id,
      },
      create: {
        ...post,
        authorId: editor.id,
      },
    });
  }
  console.log(`Created ${newsPosts.length} news posts`);

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });