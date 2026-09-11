-- AlterTable
ALTER TABLE "NewsPost" ADD COLUMN "sourceName" TEXT;

-- CreateIndex
CREATE INDEX "MarketLevel_isPublished_assetType_idx" ON "MarketLevel"("isPublished", "assetType");

-- CreateIndex
CREATE INDEX "MarketLevel_symbol_isPublished_idx" ON "MarketLevel"("symbol", "isPublished");

-- CreateIndex
CREATE INDEX "MarketLevel_updatedAt_idx" ON "MarketLevel"("updatedAt" DESC);

-- CreateIndex
CREATE INDEX "MorningBrief_isPublished_publishedAt_idx" ON "MorningBrief"("isPublished", "publishedAt" DESC);

-- CreateIndex
CREATE INDEX "MorningBrief_createdAt_idx" ON "MorningBrief"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "MorningBrief_authorId_idx" ON "MorningBrief"("authorId");

-- CreateIndex
CREATE INDEX "NewsPost_isPublished_publishedAt_idx" ON "NewsPost"("isPublished", "publishedAt" DESC);

-- CreateIndex
CREATE INDEX "NewsPost_category_isPublished_publishedAt_idx" ON "NewsPost"("category", "isPublished", "publishedAt" DESC);

-- CreateIndex
CREATE INDEX "NewsPost_isBreaking_isPublished_publishedAt_idx" ON "NewsPost"("isBreaking", "isPublished", "publishedAt" DESC);

-- CreateIndex
CREATE INDEX "NewsPost_isFeatured_isPublished_publishedAt_idx" ON "NewsPost"("isFeatured", "isPublished", "publishedAt" DESC);

-- CreateIndex
CREATE INDEX "NewsPost_isTrending_isPublished_publishedAt_idx" ON "NewsPost"("isTrending", "isPublished", "publishedAt" DESC);

-- CreateIndex
CREATE INDEX "NewsPost_isEditorPick_isPublished_publishedAt_idx" ON "NewsPost"("isEditorPick", "isPublished", "publishedAt" DESC);

-- CreateIndex
CREATE INDEX "NewsPost_updatedAt_idx" ON "NewsPost"("updatedAt" DESC);

-- CreateIndex
CREATE INDEX "NewsPost_authorId_idx" ON "NewsPost"("authorId");

-- CreateIndex
CREATE INDEX "TapeView_isPublished_publishedAt_idx" ON "TapeView"("isPublished", "publishedAt" DESC);

-- CreateIndex
CREATE INDEX "TapeView_category_isPublished_publishedAt_idx" ON "TapeView"("category", "isPublished", "publishedAt" DESC);

-- CreateIndex
CREATE INDEX "TapeView_instrument_isPublished_publishedAt_idx" ON "TapeView"("instrument", "isPublished", "publishedAt" DESC);

-- CreateIndex
CREATE INDEX "TapeView_authorId_idx" ON "TapeView"("authorId");

-- CreateIndex
CREATE INDEX "TapeView_updatedAt_idx" ON "TapeView"("updatedAt" DESC);
