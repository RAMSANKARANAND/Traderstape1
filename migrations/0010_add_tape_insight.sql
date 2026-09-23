-- Migration number: 0010        2026-09-14T20:00:00.000Z
-- Create table for AI-generated tape insight

CREATE TABLE IF NOT EXISTS "TapeInsight" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sentiment" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
