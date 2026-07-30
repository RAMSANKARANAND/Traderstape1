-- CreateTable
CREATE TABLE IF NOT EXISTS "MorningBrief" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "headline" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sentiment" TEXT NOT NULL DEFAULT 'Neutral',
    "confidence" INTEGER NOT NULL DEFAULT 0,
    "focusPoints" TEXT NOT NULL DEFAULT '[]',
    "riskEvents" TEXT NOT NULL DEFAULT '[]',
    "globalUs" TEXT NOT NULL DEFAULT '',
    "globalEurope" TEXT NOT NULL DEFAULT '',
    "globalAsia" TEXT NOT NULL DEFAULT '',
    "summary" TEXT NOT NULL,
    "body" TEXT NOT NULL DEFAULT '',
    "authorId" TEXT NOT NULL,
    "publishedAt" DATETIME,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "ogImageUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MorningBrief_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "MorningBrief_slug_key" ON "MorningBrief"("slug");