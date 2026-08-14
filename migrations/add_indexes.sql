CREATE INDEX IF NOT EXISTS idx_newspost_pub_date ON NewsPost(isPublished, publishedAt DESC);
CREATE INDEX IF NOT EXISTS idx_newspost_cat_pub_date ON NewsPost(category, isPublished, publishedAt DESC);
CREATE INDEX IF NOT EXISTS idx_newspost_breaking ON NewsPost(isBreaking, isPublished, publishedAt DESC);
CREATE INDEX IF NOT EXISTS idx_newspost_featured ON NewsPost(isFeatured, isPublished, publishedAt DESC);
CREATE INDEX IF NOT EXISTS idx_newspost_trending ON NewsPost(isTrending, isPublished, publishedAt DESC);
CREATE INDEX IF NOT EXISTS idx_newspost_editorpick ON NewsPost(isEditorPick, isPublished, publishedAt DESC);
CREATE INDEX IF NOT EXISTS idx_newspost_updated ON NewsPost(updatedAt DESC);
CREATE INDEX IF NOT EXISTS idx_newspost_author ON NewsPost(authorId);
