-- Add structured summary fields to NewsPost
ALTER TABLE "NewsPost" ADD COLUMN "tldr" text;
ALTER TABLE "NewsPost" ADD COLUMN "keyFacts" text;
ALTER TABLE "NewsPost" ADD COLUMN "whyItMatters" text;
ALTER TABLE "NewsPost" ADD COLUMN "plainTitle" text;