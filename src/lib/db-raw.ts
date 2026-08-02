/**
 * Direct Cloudflare D1 query helpers.
 *
 * This module replaces Prisma Client for all runtime queries in the deployed
 * Worker. Prisma is kept only for local dev tooling (studio, migrations, seed).
 *
 * D1 returns dates as ISO strings and booleans as 0/1 integers; the helpers
 * below normalize rows back to the shapes the components expect.
 */

import { getCloudflareContext } from "@opennextjs/cloudflare";

// ─────────────────────────────────────────────────────────────────────────────
// Types — mirror the Prisma models so call sites stay typed
// ─────────────────────────────────────────────────────────────────────────────

export type Role = "ADMIN" | "EDITOR" | "CONTRIBUTOR";
export type AssetType = "STOCK_FNO" | "FOREX" | "CRYPTO";
export type Direction = "UP" | "DOWN" | "FLAT";
export type NewsCategory = "STOCKS" | "CRYPTO" | "FOREX" | "GEOPOLITICAL";
export type TapeViewCategory =
  | "NSE"
  | "FOREX"
  | "CRYPTO"
  | "COMMODITIES"
  | "GLOBAL_MARKETS"
  | "WEEKLY_OUTLOOK"
  | "SPECIAL_REPORT";
export type TapeViewBias = "BULLISH" | "BEARISH" | "NEUTRAL";

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MarketLevel {
  id: string;
  assetType: AssetType;
  symbol: string;
  level: number;
  note: string | null;
  direction: Direction;
  updatedBy: string;
  updatedAt: Date;
  isPublished: boolean;
}

export interface NewsPost {
  id: string;
  title: string;
  slug: string;
  category: NewsCategory;
  summary: string;
  body: string;
  authorId: string;
  publishedAt: Date | null;
  isPublished: boolean;
  isBreaking: boolean;
  isFeatured: boolean;
  isTrending: boolean;
  isEditorPick: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  ogImageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewsPostWithAuthor extends NewsPost {
  author: { name: string };
}

export interface TapeView {
  id: string;
  title: string;
  slug: string;
  category: TapeViewCategory;
  instrument: string;
  bias: TapeViewBias;
  support1: string | null;
  support2: string | null;
  support3: string | null;
  resistance1: string | null;
  resistance2: string | null;
  resistance3: string | null;
  keyLevelsToWatch: string | null;
  todayView: string;
  riskFactors: string | null;
  educationalDisclaimer: string | null;
  body: string;
  authorId: string;
  publishedAt: Date | null;
  isPublished: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  ogImageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TapeViewWithAuthor extends TapeView {
  author: { name: string };
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal helpers — D1 row normalization
// ─────────────────────────────────────────────────────────────────────────────

/** Get the D1 binding from the Cloudflare context. */
async function getD1() {
  const { env } = await getCloudflareContext({ async: true });
  return env.traderstape as D1Database;
}

/** Convert a D1 integer (0/1) to a boolean. */
function toBool(v: unknown): boolean {
  return v === 1 || v === true || v === "1" || v === "true";
}

/** Convert a D1 date string (or null) to a Date object (or null). */
function toDate(v: unknown): Date | null {
  if (v === null || v === undefined || v === "") return null;
  return new Date(v as string);
}

/** Generate a CUID-like ID (sufficient for D1 inserts). */
export function generateId(): string {
  return "c" + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

// ─────────────────────────────────────────────────────────────────────────────
// User queries
// ─────────────────────────────────────────────────────────────────────────────

export async function getUserByEmail(email: string): Promise<User | null> {
  const d1 = await getD1();
  const row = await d1
    .prepare("SELECT * FROM User WHERE email = ?")
    .bind(email)
    .first();
  if (!row) return null;
  return {
    id: row.id as string,
    name: row.name as string,
    email: row.email as string,
    passwordHash: row.passwordHash as string,
    role: row.role as Role,
    isActive: toBool(row.isActive),
    createdAt: toDate(row.createdAt)!,
    updatedAt: toDate(row.updatedAt)!,
  };
}

export async function getAllUsers(): Promise<User[]> {
  const d1 = await getD1();
  const result = await d1
    .prepare("SELECT * FROM User ORDER BY createdAt DESC")
    .all();
  return (result.results || []).map((row) => ({
    id: row.id as string,
    name: row.name as string,
    email: row.email as string,
    passwordHash: row.passwordHash as string,
    role: row.role as Role,
    isActive: toBool(row.isActive),
    createdAt: toDate(row.createdAt)!,
    updatedAt: toDate(row.updatedAt)!,
  }));
}

export async function toggleUserActive(id: string, isActive: boolean): Promise<void> {
  const d1 = await getD1();
  await d1
    .prepare("UPDATE User SET isActive = ?, updatedAt = ? WHERE id = ?")
    .bind(isActive ? 1 : 0, new Date().toISOString(), id)
    .run();
}

export async function countUsers(): Promise<number> {
  const d1 = await getD1();
  const row = await d1.prepare("SELECT COUNT(*) as count FROM User").first();
  return (row?.count as number) || 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// MarketLevel queries
// ─────────────────────────────────────────────────────────────────────────────

export async function getPublishedMarketLevels(
  assetType?: AssetType,
): Promise<MarketLevel[]> {
  const d1 = await getD1();
  let stmt: D1PreparedStatement;
  if (assetType) {
    stmt = d1
      .prepare(
        "SELECT * FROM MarketLevel WHERE isPublished = 1 AND assetType = ? ORDER BY updatedAt DESC",
      )
      .bind(assetType);
  } else {
    stmt = d1.prepare(
      "SELECT * FROM MarketLevel WHERE isPublished = 1 ORDER BY updatedAt DESC",
    );
  }
  const result = await stmt.all();
  return (result.results || []).map((row) => ({
    id: row.id as string,
    assetType: row.assetType as AssetType,
    symbol: row.symbol as string,
    level: row.level as number,
    note: (row.note as string) || null,
    direction: row.direction as Direction,
    updatedBy: row.updatedBy as string,
    updatedAt: toDate(row.updatedAt)!,
    isPublished: toBool(row.isPublished),
  }));
}

export async function getAllMarketLevels(): Promise<MarketLevel[]> {
  const d1 = await getD1();
  const result = await d1
    .prepare("SELECT * FROM MarketLevel ORDER BY updatedAt DESC")
    .all();
  return (result.results || []).map((row) => ({
    id: row.id as string,
    assetType: row.assetType as AssetType,
    symbol: row.symbol as string,
    level: row.level as number,
    note: (row.note as string) || null,
    direction: row.direction as Direction,
    updatedBy: row.updatedBy as string,
    updatedAt: toDate(row.updatedAt)!,
    isPublished: toBool(row.isPublished),
  }));
}

export async function createMarketLevel(data: {
  assetType: AssetType;
  symbol: string;
  level: number;
  note: string;
  direction: Direction;
  updatedBy: string;
  isPublished: boolean;
}): Promise<void> {
  const d1 = await getD1();
  const id = generateId();
  const now = new Date().toISOString();
  await d1
    .prepare(
      `INSERT INTO MarketLevel (id, assetType, symbol, level, note, direction, updatedBy, updatedAt, isPublished)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      id,
      data.assetType,
      data.symbol,
      data.level,
      data.note || null,
      data.direction,
      data.updatedBy,
      now,
      data.isPublished ? 1 : 0,
    )
    .run();
}

export async function updateMarketLevelPublish(
  id: string,
  isPublished: boolean,
): Promise<void> {
  const d1 = await getD1();
  await d1
    .prepare("UPDATE MarketLevel SET isPublished = ?, updatedAt = ? WHERE id = ?")
    .bind(isPublished ? 1 : 0, new Date().toISOString(), id)
    .run();
}

export async function deleteMarketLevel(id: string): Promise<void> {
  const d1 = await getD1();
  await d1.prepare("DELETE FROM MarketLevel WHERE id = ?").bind(id).run();
}

export async function countMarketLevels(): Promise<number> {
  const d1 = await getD1();
  const row = await d1.prepare("SELECT COUNT(*) as count FROM MarketLevel").first();
  return (row?.count as number) || 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// NewsPost queries
// ─────────────────────────────────────────────────────────────────────────────

export async function getPublishedNewsPosts(
  options?: { category?: NewsCategory; take?: number },
): Promise<NewsPostWithAuthor[]> {
  const d1 = await getD1();
  let stmt: D1PreparedStatement;
  const take = options?.take;

  if (options?.category) {
    const sql = `SELECT n.*, u.name as authorName
       FROM NewsPost n
       LEFT JOIN User u ON n.authorId = u.id
       WHERE n.isPublished = 1 AND n.category = ?
       ORDER BY n.publishedAt DESC${take ? ` LIMIT ${take}` : ""}`;
    stmt = d1.prepare(sql).bind(options.category);
  } else {
    const sql = `SELECT n.*, u.name as authorName
       FROM NewsPost n
       LEFT JOIN User u ON n.authorId = u.id
       WHERE n.isPublished = 1
       ORDER BY n.publishedAt DESC${take ? ` LIMIT ${take}` : ""}`;
    stmt = d1.prepare(sql);
  }
  const result = await stmt.all();
  return (result.results || []).map((row) => ({
    id: row.id as string,
    title: row.title as string,
    slug: row.slug as string,
    category: row.category as NewsCategory,
    summary: row.summary as string,
    body: row.body as string,
    authorId: row.authorId as string,
    publishedAt: toDate(row.publishedAt),
    isPublished: toBool(row.isPublished),
    isBreaking: toBool(row.isBreaking),
    isFeatured: toBool(row.isFeatured),
    isTrending: toBool(row.isTrending),
    isEditorPick: toBool(row.isEditorPick),
    seoTitle: (row.seoTitle as string) || null,
    seoDescription: (row.seoDescription as string) || null,
    ogImageUrl: (row.ogImageUrl as string) || null,
    createdAt: toDate(row.createdAt)!,
    updatedAt: toDate(row.updatedAt)!,
    author: { name: (row.authorName as string) || "Unknown" },
  }));
}

export async function getNewsPostBySlug(
  slug: string,
  requirePublished = false,
): Promise<NewsPostWithAuthor | null> {
  const d1 = await getD1();
  const sql = requirePublished
    ? `SELECT n.*, u.name as authorName
       FROM NewsPost n
       LEFT JOIN User u ON n.authorId = u.id
       WHERE n.slug = ? AND n.isPublished = 1`
    : `SELECT n.*, u.name as authorName
       FROM NewsPost n
       LEFT JOIN User u ON n.authorId = u.id
       WHERE n.slug = ?`;
  const row = await d1.prepare(sql).bind(slug).first();
  if (!row) return null;
  return {
    id: row.id as string,
    title: row.title as string,
    slug: row.slug as string,
    category: row.category as NewsCategory,
    summary: row.summary as string,
    body: row.body as string,
    authorId: row.authorId as string,
    publishedAt: toDate(row.publishedAt),
    isPublished: toBool(row.isPublished),
    isBreaking: toBool(row.isBreaking),
    isFeatured: toBool(row.isFeatured),
    isTrending: toBool(row.isTrending),
    isEditorPick: toBool(row.isEditorPick),
    seoTitle: (row.seoTitle as string) || null,
    seoDescription: (row.seoDescription as string) || null,
    ogImageUrl: (row.ogImageUrl as string) || null,
    createdAt: toDate(row.createdAt)!,
    updatedAt: toDate(row.updatedAt)!,
    author: { name: (row.authorName as string) || "Unknown" },
  };
}

export async function getNewsPostById(id: string): Promise<NewsPost | null> {
  const d1 = await getD1();
  const row = await d1.prepare("SELECT * FROM NewsPost WHERE id = ?").bind(id).first();
  if (!row) return null;
  return {
    id: row.id as string,
    title: row.title as string,
    slug: row.slug as string,
    category: row.category as NewsCategory,
    summary: row.summary as string,
    body: row.body as string,
    authorId: row.authorId as string,
    publishedAt: toDate(row.publishedAt),
    isPublished: toBool(row.isPublished),
    isBreaking: toBool(row.isBreaking),
    isFeatured: toBool(row.isFeatured),
    isTrending: toBool(row.isTrending),
    isEditorPick: toBool(row.isEditorPick),
    seoTitle: (row.seoTitle as string) || null,
    seoDescription: (row.seoDescription as string) || null,
    ogImageUrl: (row.ogImageUrl as string) || null,
    createdAt: toDate(row.createdAt)!,
    updatedAt: toDate(row.updatedAt)!,
  };
}

export async function getAllNewsPosts(): Promise<NewsPostWithAuthor[]> {
  const d1 = await getD1();
  const result = await d1
    .prepare(
      `SELECT n.*, u.name as authorName
       FROM NewsPost n
       LEFT JOIN User u ON n.authorId = u.id
       ORDER BY n.updatedAt DESC`,
    )
    .all();
  return (result.results || []).map((row) => ({
    id: row.id as string,
    title: row.title as string,
    slug: row.slug as string,
    category: row.category as NewsCategory,
    summary: row.summary as string,
    body: row.body as string,
    authorId: row.authorId as string,
    publishedAt: toDate(row.publishedAt),
    isPublished: toBool(row.isPublished),
    isBreaking: toBool(row.isBreaking),
    isFeatured: toBool(row.isFeatured),
    isTrending: toBool(row.isTrending),
    isEditorPick: toBool(row.isEditorPick),
    seoTitle: (row.seoTitle as string) || null,
    seoDescription: (row.seoDescription as string) || null,
    ogImageUrl: (row.ogImageUrl as string) || null,
    createdAt: toDate(row.createdAt)!,
    updatedAt: toDate(row.updatedAt)!,
    author: { name: (row.authorName as string) || "Unknown" },
  }));
}

export async function getPublishedNewsSlugs(): Promise<
  { slug: string; updatedAt: Date }[]
> {
  const d1 = await getD1();
  const result = await d1
    .prepare("SELECT slug, updatedAt FROM NewsPost WHERE isPublished = 1")
    .all();
  return (result.results || []).map((row) => ({
    slug: row.slug as string,
    updatedAt: toDate(row.updatedAt)!,
  }));
}

export async function createNewsPost(data: {
  title: string;
  slug: string;
  category: NewsCategory;
  summary: string;
  body: string;
  authorId: string;
  seoTitle: string | null;
  seoDescription: string | null;
  ogImageUrl: string | null;
  isPublished: boolean;
  publishedAt: Date | null;
}): Promise<void> {
  const d1 = await getD1();
  const id = generateId();
  const now = new Date().toISOString();
  await d1
    .prepare(
      `INSERT INTO NewsPost (id, title, slug, category, summary, body, authorId, publishedAt, isPublished, isBreaking, isFeatured, isTrending, isEditorPick, seoTitle, seoDescription, ogImageUrl, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, 0, ?, ?, ?, ?, ?)`,
    )
    .bind(
      id,
      data.title,
      data.slug,
      data.category,
      data.summary,
      data.body,
      data.authorId,
      data.publishedAt ? data.publishedAt.toISOString() : null,
      data.isPublished ? 1 : 0,
      data.seoTitle,
      data.seoDescription,
      data.ogImageUrl,
      now,
      now,
    )
    .run();
}

export async function updateNewsPost(
  id: string,
  data: {
    title: string;
    category: NewsCategory;
    summary: string;
    body: string;
    seoTitle: string | null;
    seoDescription: string | null;
    ogImageUrl: string | null;
    isPublished: boolean;
    publishedAt: Date | null;
  },
): Promise<void> {
  const d1 = await getD1();
  const now = new Date().toISOString();
  await d1
    .prepare(
      `UPDATE NewsPost SET title = ?, category = ?, summary = ?, body = ?, seoTitle = ?, seoDescription = ?, ogImageUrl = ?, isPublished = ?, publishedAt = ?, updatedAt = ? WHERE id = ?`,
    )
    .bind(
      data.title,
      data.category,
      data.summary,
      data.body,
      data.seoTitle,
      data.seoDescription,
      data.ogImageUrl,
      data.isPublished ? 1 : 0,
      data.publishedAt ? data.publishedAt.toISOString() : null,
      now,
      id,
    )
    .run();
}

export async function toggleNewsPublish(
  id: string,
): Promise<{ isPublished: boolean } | null> {
  const d1 = await getD1();
  const row = await d1
    .prepare("SELECT isPublished FROM NewsPost WHERE id = ?")
    .bind(id)
    .first();
  if (!row) return null;
  const current = toBool(row.isPublished);
  const now = new Date().toISOString();
  await d1
    .prepare("UPDATE NewsPost SET isPublished = ?, publishedAt = ?, updatedAt = ? WHERE id = ?")
    .bind(current ? 0 : 1, current ? null : now, now, id)
    .run();
  return { isPublished: !current };
}

export async function bulkDeleteNews(ids: string[]): Promise<number> {
  const d1 = await getD1();
  const placeholders = ids.map(() => "?").join(", ");
  const result = await d1
    .prepare(`DELETE FROM NewsPost WHERE id IN (${placeholders})`)
    .bind(...ids)
    .run();
  return result.meta?.changes || ids.length;
}

export async function countNewsPosts(): Promise<number> {
  const d1 = await getD1();
  const row = await d1.prepare("SELECT COUNT(*) as count FROM NewsPost").first();
  return (row?.count as number) || 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// TapeView queries
// ─────────────────────────────────────────────────────────────────────────────

export async function getLatestTapeView(): Promise<TapeView | null> {
  const d1 = await getD1();
  const row = await d1
    .prepare(
      "SELECT * FROM TapeView WHERE isPublished = 1 ORDER BY publishedAt DESC LIMIT 1",
    )
    .first();
  if (!row) return null;
  return normalizeTapeView(row);
}

export async function getPublishedTapeViews(
  options?: { category?: TapeViewCategory },
): Promise<TapeView[]> {
  const d1 = await getD1();
  let stmt: D1PreparedStatement;
  if (options?.category) {
    stmt = d1
      .prepare(
        "SELECT * FROM TapeView WHERE isPublished = 1 AND category = ? ORDER BY publishedAt DESC",
      )
      .bind(options.category);
  } else {
    stmt = d1.prepare(
      "SELECT * FROM TapeView WHERE isPublished = 1 ORDER BY publishedAt DESC",
    );
  }
  const result = await stmt.all();
  return (result.results || []).map((row) => normalizeTapeView(row));
}

export async function getTapeViewBySlug(
  slug: string,
  requirePublished = false,
): Promise<TapeViewWithAuthor | null> {
  const d1 = await getD1();
  const sql = requirePublished
    ? `SELECT t.*, u.name as authorName
       FROM TapeView t
       LEFT JOIN User u ON t.authorId = u.id
       WHERE t.slug = ? AND t.isPublished = 1`
    : `SELECT t.*, u.name as authorName
       FROM TapeView t
       LEFT JOIN User u ON t.authorId = u.id
       WHERE t.slug = ?`;
  const row = await d1.prepare(sql).bind(slug).first();
  if (!row) return null;
  return {
    ...normalizeTapeView(row),
    author: { name: (row.authorName as string) || "Unknown" },
  };
}

export async function getTapeViewById(id: string): Promise<TapeView | null> {
  const d1 = await getD1();
  const row = await d1.prepare("SELECT * FROM TapeView WHERE id = ?").bind(id).first();
  if (!row) return null;
  return normalizeTapeView(row);
}

export async function getAllTapeViews(): Promise<TapeViewWithAuthor[]> {
  const d1 = await getD1();
  const result = await d1
    .prepare(
      `SELECT t.*, u.name as authorName
       FROM TapeView t
       LEFT JOIN User u ON t.authorId = u.id
       ORDER BY t.updatedAt DESC`,
    )
    .all();
  return (result.results || []).map((row) => ({
    ...normalizeTapeView(row),
    author: { name: (row.authorName as string) || "Unknown" },
  }));
}

export async function getRelatedTapeViews(
  category: TapeViewCategory,
  excludeId: string,
  take = 3,
): Promise<TapeView[]> {
  const d1 = await getD1();
  const result = await d1
    .prepare(
      `SELECT id, title, slug, category, instrument, bias, todayView
       FROM TapeView
       WHERE category = ? AND isPublished = 1 AND id != ?
       LIMIT ?`,
    )
    .bind(category, excludeId, take)
    .all();
  return (result.results || []).map((row) => ({
    id: row.id as string,
    title: row.title as string,
    slug: row.slug as string,
    category: row.category as TapeViewCategory,
    instrument: row.instrument as string,
    bias: row.bias as TapeViewBias,
    support1: null,
    support2: null,
    support3: null,
    resistance1: null,
    resistance2: null,
    resistance3: null,
    keyLevelsToWatch: null,
    todayView: row.todayView as string,
    riskFactors: null,
    educationalDisclaimer: null,
    body: "",
    authorId: "",
    publishedAt: null,
    isPublished: true,
    seoTitle: null,
    seoDescription: null,
    ogImageUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
}

export async function createTapeView(data: {
  title: string;
  slug: string;
  category: TapeViewCategory;
  instrument: string;
  bias: TapeViewBias;
  support1: string | null;
  support2: string | null;
  support3: string | null;
  resistance1: string | null;
  resistance2: string | null;
  resistance3: string | null;
  keyLevelsToWatch: string | null;
  todayView: string;
  riskFactors: string | null;
  educationalDisclaimer: string | null;
  body: string;
  authorId: string;
  seoTitle: string | null;
  seoDescription: string | null;
  ogImageUrl: string | null;
  isPublished: boolean;
  publishedAt: Date | null;
}): Promise<void> {
  const d1 = await getD1();
  const id = generateId();
  const now = new Date().toISOString();
  await d1
    .prepare(
      `INSERT INTO TapeView (id, title, slug, category, instrument, bias, support1, support2, support3, resistance1, resistance2, resistance3, keyLevelsToWatch, todayView, riskFactors, educationalDisclaimer, body, authorId, publishedAt, isPublished, seoTitle, seoDescription, ogImageUrl, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      id,
      data.title,
      data.slug,
      data.category,
      data.instrument,
      data.bias,
      data.support1,
      data.support2,
      data.support3,
      data.resistance1,
      data.resistance2,
      data.resistance3,
      data.keyLevelsToWatch,
      data.todayView,
      data.riskFactors,
      data.educationalDisclaimer,
      data.body,
      data.authorId,
      data.publishedAt ? data.publishedAt.toISOString() : null,
      data.isPublished ? 1 : 0,
      data.seoTitle,
      data.seoDescription,
      data.ogImageUrl,
      now,
      now,
    )
    .run();
}

export async function updateTapeView(
  id: string,
  data: {
    title: string;
    category: TapeViewCategory;
    instrument: string;
    bias: TapeViewBias;
    support1: string | null;
    support2: string | null;
    support3: string | null;
    resistance1: string | null;
    resistance2: string | null;
    resistance3: string | null;
    keyLevelsToWatch: string | null;
    todayView: string;
    riskFactors: string | null;
    educationalDisclaimer: string | null;
    body: string;
    seoTitle: string | null;
    seoDescription: string | null;
    ogImageUrl: string | null;
    isPublished: boolean;
    publishedAt: Date | null;
  },
): Promise<void> {
  const d1 = await getD1();
  const now = new Date().toISOString();
  await d1
    .prepare(
      `UPDATE TapeView SET title = ?, category = ?, instrument = ?, bias = ?, support1 = ?, support2 = ?, support3 = ?, resistance1 = ?, resistance2 = ?, resistance3 = ?, keyLevelsToWatch = ?, todayView = ?, riskFactors = ?, educationalDisclaimer = ?, body = ?, seoTitle = ?, seoDescription = ?, ogImageUrl = ?, isPublished = ?, publishedAt = ?, updatedAt = ? WHERE id = ?`,
    )
    .bind(
      data.title,
      data.category,
      data.instrument,
      data.bias,
      data.support1,
      data.support2,
      data.support3,
      data.resistance1,
      data.resistance2,
      data.resistance3,
      data.keyLevelsToWatch,
      data.todayView,
      data.riskFactors,
      data.educationalDisclaimer,
      data.body,
      data.seoTitle,
      data.seoDescription,
      data.ogImageUrl,
      data.isPublished ? 1 : 0,
      data.publishedAt ? data.publishedAt.toISOString() : null,
      now,
      id,
    )
    .run();
}

export async function toggleTapeViewPublish(
  id: string,
): Promise<{ isPublished: boolean } | null> {
  const d1 = await getD1();
  const row = await d1
    .prepare("SELECT isPublished FROM TapeView WHERE id = ?")
    .bind(id)
    .first();
  if (!row) return null;
  const current = toBool(row.isPublished);
  const now = new Date().toISOString();
  await d1
    .prepare("UPDATE TapeView SET isPublished = ?, publishedAt = ?, updatedAt = ? WHERE id = ?")
    .bind(current ? 0 : 1, current ? null : now, now, id)
    .run();
  return { isPublished: !current };
}

export async function bulkDeleteTapeViews(ids: string[]): Promise<number> {
  const d1 = await getD1();
  const placeholders = ids.map(() => "?").join(", ");
  const result = await d1
    .prepare(`DELETE FROM TapeView WHERE id IN (${placeholders})`)
    .bind(...ids)
    .run();
  return result.meta?.changes || ids.length;
}

// ─────────────────────────────────────────────────────────────────────────────
// MorningBrief queries
// ─────────────────────────────────────────────────────────────────────────────

export interface MorningBrief {
  id: string;
  headline: string;
  slug: string;
  sentiment: string;
  confidence: number;
  focusPoints: string[];
  riskEvents: Array<{ level: string; title: string; description: string }>;
  globalUs: string;
  globalEurope: string;
  globalAsia: string;
  summary: string;
  body: string;
  authorId: string;
  publishedAt: Date | null;
  isPublished: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  ogImageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface MorningBriefWithAuthor extends MorningBrief {
  author: { name: string };
}

function normalizeMorningBrief(row: Record<string, unknown>): MorningBrief {
  return {
    id: row.id as string,
    headline: row.headline as string,
    slug: row.slug as string,
    sentiment: row.sentiment as string,
    confidence: row.confidence as number,
    focusPoints: JSON.parse((row.focusPoints as string) || "[]"),
    riskEvents: JSON.parse((row.riskEvents as string) || "[]"),
    globalUs: (row.globalUs as string) || "",
    globalEurope: (row.globalEurope as string) || "",
    globalAsia: (row.globalAsia as string) || "",
    summary: row.summary as string,
    body: (row.body as string) || "",
    authorId: row.authorId as string,
    publishedAt: toDate(row.publishedAt),
    isPublished: toBool(row.isPublished),
    seoTitle: (row.seoTitle as string) || null,
    seoDescription: (row.seoDescription as string) || null,
    ogImageUrl: (row.ogImageUrl as string) || null,
    createdAt: toDate(row.createdAt)!,
    updatedAt: toDate(row.updatedAt)!,
  };
}

export async function getLatestPublishedMorningBrief(): Promise<MorningBriefWithAuthor | null> {
  const d1 = await getD1();
  const row = await d1
    .prepare(
      `SELECT m.*, u.name as authorName
       FROM MorningBrief m
       LEFT JOIN User u ON m.authorId = u.id
       WHERE m.isPublished = 1
       ORDER BY m.publishedAt DESC LIMIT 1`,
    )
    .first();
  if (!row) return null;
  return { ...normalizeMorningBrief(row), author: { name: (row.authorName as string) || "Unknown" } };
}

export async function getPublishedMorningBriefs(options?: { take?: number; offset?: number }): Promise<MorningBriefWithAuthor[]> {
  const d1 = await getD1();
  const take = options?.take ?? 20;
  const offset = options?.offset ?? 0;
  const result = await d1
    .prepare(
      `SELECT m.*, u.name as authorName
       FROM MorningBrief m
       LEFT JOIN User u ON m.authorId = u.id
       WHERE m.isPublished = 1
       ORDER BY m.publishedAt DESC
       LIMIT ? OFFSET ?`,
    )
    .bind(take, offset)
    .all();
  return (result.results || []).map((row) => ({
    ...normalizeMorningBrief(row),
    author: { name: (row.authorName as string) || "Unknown" },
  }));
}

export async function getMorningBriefBySlug(slug: string, requirePublished = false): Promise<MorningBriefWithAuthor | null> {
  const d1 = await getD1();
  const sql = requirePublished
    ? `SELECT m.*, u.name as authorName
       FROM MorningBrief m
       LEFT JOIN User u ON m.authorId = u.id
       WHERE m.slug = ? AND m.isPublished = 1`
    : `SELECT m.*, u.name as authorName
       FROM MorningBrief m
       LEFT JOIN User u ON m.authorId = u.id
       WHERE m.slug = ?`;
  const row = await d1.prepare(sql).bind(slug).first();
  if (!row) return null;
  return { ...normalizeMorningBrief(row), author: { name: (row.authorName as string) || "Unknown" } };
}

export async function getMorningBriefById(id: string): Promise<MorningBrief | null> {
  const d1 = await getD1();
  const row = await d1.prepare("SELECT * FROM MorningBrief WHERE id = ?").bind(id).first();
  if (!row) return null;
  return normalizeMorningBrief(row);
}

export async function getAllMorningBriefs(): Promise<MorningBriefWithAuthor[]> {
  const d1 = await getD1();
  const result = await d1
    .prepare(
      `SELECT m.*, u.name as authorName
       FROM MorningBrief m
       LEFT JOIN User u ON m.authorId = u.id
       ORDER BY m.updatedAt DESC`,
    )
    .all();
  return (result.results || []).map((row) => ({
    ...normalizeMorningBrief(row),
    author: { name: (row.authorName as string) || "Unknown" },
  }));
}

export async function createMorningBrief(data: {
  headline: string;
  slug: string;
  sentiment: string;
  confidence: number;
  focusPoints: string[];
  riskEvents: Array<{ level: string; title: string; description: string }>;
  globalUs: string;
  globalEurope: string;
  globalAsia: string;
  summary: string;
  body: string;
  authorId: string;
  seoTitle: string | null;
  seoDescription: string | null;
  ogImageUrl: string | null;
  isPublished: boolean;
  publishedAt: Date | null;
}): Promise<void> {
  const d1 = await getD1();
  const id = generateId();
  const now = new Date().toISOString();
  await d1
    .prepare(
      `INSERT INTO MorningBrief (id, headline, slug, sentiment, confidence, focusPoints, riskEvents, globalUs, globalEurope, globalAsia, summary, body, authorId, publishedAt, isPublished, seoTitle, seoDescription, ogImageUrl, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      id,
      data.headline,
      data.slug,
      data.sentiment,
      data.confidence,
      JSON.stringify(data.focusPoints),
      JSON.stringify(data.riskEvents),
      data.globalUs,
      data.globalEurope,
      data.globalAsia,
      data.summary,
      data.body,
      data.authorId,
      data.publishedAt ? data.publishedAt.toISOString() : null,
      data.isPublished ? 1 : 0,
      data.seoTitle,
      data.seoDescription,
      data.ogImageUrl,
      now,
      now,
    )
    .run();
}

export async function updateMorningBrief(
  id: string,
  data: {
    headline: string;
    sentiment: string;
    confidence: number;
    focusPoints: string[];
    riskEvents: Array<{ level: string; title: string; description: string }>;
    globalUs: string;
    globalEurope: string;
    globalAsia: string;
    summary: string;
    body: string;
    seoTitle: string | null;
    seoDescription: string | null;
    ogImageUrl: string | null;
    isPublished: boolean;
    publishedAt: Date | null;
  },
): Promise<void> {
  const d1 = await getD1();
  const now = new Date().toISOString();
  await d1
    .prepare(
      `UPDATE MorningBrief SET headline = ?, sentiment = ?, confidence = ?, focusPoints = ?, riskEvents = ?, globalUs = ?, globalEurope = ?, globalAsia = ?, summary = ?, body = ?, seoTitle = ?, seoDescription = ?, ogImageUrl = ?, isPublished = ?, publishedAt = ?, updatedAt = ? WHERE id = ?`,
    )
    .bind(
      data.headline,
      data.sentiment,
      data.confidence,
      JSON.stringify(data.focusPoints),
      JSON.stringify(data.riskEvents),
      data.globalUs,
      data.globalEurope,
      data.globalAsia,
      data.summary,
      data.body,
      data.seoTitle,
      data.seoDescription,
      data.ogImageUrl,
      data.isPublished ? 1 : 0,
      data.publishedAt ? data.publishedAt.toISOString() : null,
      now,
      id,
    )
    .run();
}

export async function toggleMorningBriefPublish(id: string): Promise<{ isPublished: boolean } | null> {
  const d1 = await getD1();
  const row = await d1.prepare("SELECT isPublished FROM MorningBrief WHERE id = ?").bind(id).first();
  if (!row) return null;
  const current = toBool(row.isPublished);
  const now = new Date().toISOString();
  await d1
    .prepare("UPDATE MorningBrief SET isPublished = ?, publishedAt = ?, updatedAt = ? WHERE id = ?")
    .bind(current ? 0 : 1, current ? null : now, now, id)
    .run();
  return { isPublished: !current };
}

export async function deleteMorningBrief(id: string): Promise<void> {
  const d1 = await getD1();
  await d1.prepare("DELETE FROM MorningBrief WHERE id = ?").bind(id).run();
}

export async function countPublishedMorningBriefs(): Promise<number> {
  const d1 = await getD1();
  const row = await d1.prepare("SELECT COUNT(*) as count FROM MorningBrief WHERE isPublished = 1").first();
  return (row?.count as number) || 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal: normalize a D1 row to a TapeView
// ─────────────────────────────────────────────────────────────────────────────

function normalizeTapeView(row: Record<string, unknown>): TapeView {
  return {
    id: row.id as string,
    title: row.title as string,
    slug: row.slug as string,
    category: row.category as TapeViewCategory,
    instrument: row.instrument as string,
    bias: row.bias as TapeViewBias,
    support1: (row.support1 as string) || null,
    support2: (row.support2 as string) || null,
    support3: (row.support3 as string) || null,
    resistance1: (row.resistance1 as string) || null,
    resistance2: (row.resistance2 as string) || null,
    resistance3: (row.resistance3 as string) || null,
    keyLevelsToWatch: (row.keyLevelsToWatch as string) || null,
    todayView: row.todayView as string,
    riskFactors: (row.riskFactors as string) || null,
    educationalDisclaimer: (row.educationalDisclaimer as string) || null,
    body: row.body as string,
    authorId: row.authorId as string,
    publishedAt: toDate(row.publishedAt),
    isPublished: toBool(row.isPublished),
    seoTitle: (row.seoTitle as string) || null,
    seoDescription: (row.seoDescription as string) || null,
    ogImageUrl: (row.ogImageUrl as string) || null,
    createdAt: toDate(row.createdAt)!,
    updatedAt: toDate(row.updatedAt)!,
  };
}