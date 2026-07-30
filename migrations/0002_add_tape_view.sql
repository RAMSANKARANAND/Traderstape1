CREATE TABLE IF NOT EXISTS "TapeView" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "instrument" TEXT NOT NULL,
    "bias" TEXT NOT NULL,
    "support1" TEXT,
    "support2" TEXT,
    "support3" TEXT,
    "resistance1" TEXT,
    "resistance2" TEXT,
    "resistance3" TEXT,
    "keyLevelsToWatch" TEXT,
    "todayView" TEXT NOT NULL,
    "riskFactors" TEXT,
    "educationalDisclaimer" TEXT,
    "body" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "publishedAt" DATETIME,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "ogImageUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TapeView_authorId_fkey"
      FOREIGN KEY ("authorId") REFERENCES "User" ("id")
      ON DELETE RESTRICT
      ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "TapeView_slug_key" ON "TapeView"("slug");