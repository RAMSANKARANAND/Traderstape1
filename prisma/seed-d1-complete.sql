-- Complete seed for Cloudflare D1 (remote)
-- Run with: npx wrangler d1 execute traderstape --remote --file=./prisma/seed-d1-complete.sql

-- Password hashes (bcrypt 10 rounds):
-- admin123       → $2a$10$2iA742gfhcS5Ke1FXqGdWuhqg4YohzdQc96oOoaW8eJOQy3P458ey
-- editor123      → $2a$10$ILjlGYNgSHGrE9q.y9nbk.XRRX/2.zJBdbFtDzQeeX9UigdRn1h5.
-- contributor123 → $2a$10$9LBWdfGhLtAN5su.t5hY4uHUQLozbOCyeAX16zlO0t36zTCNrjSGu
-- system-generated-password-not-for-login → $2a$10$K8XvG5QZxY9mN2pL4vR6sO8uJ7wE1qA3zX5cV8bN2mL4kP6oR8sT

-- Users
INSERT OR IGNORE INTO User (id, name, email, passwordHash, role, isActive, createdAt, updatedAt)
VALUES ('cm00000000000000000000000', 'System', 'system@traderstape.com', '$2a$10$K8XvG5QZxY9mN2pL4vR6sO8uJ7wE1qA3zX5cV8bN2mL4kP6oR8sT', 'ADMIN', 0, datetime('now'), datetime('now'));

INSERT OR IGNORE INTO User (id, name, email, passwordHash, role, isActive, createdAt, updatedAt)
VALUES ('cm00000000000000000000001', 'Admin', 'admin@traderstape.com', '$2a$10$2iA742gfhcS5Ke1FXqGdWuhqg4YohzdQc96oOoaW8eJOQy3P458ey', 'ADMIN', 1, datetime('now'), datetime('now'));

INSERT OR IGNORE INTO User (id, name, email, passwordHash, role, isActive, createdAt, updatedAt)
VALUES ('cm00000000000000000000002', 'Editor', 'editor@traderstape.com', '$2a$10$ILjlGYNgSHGrE9q.y9nbk.XRRX/2.zJBdbFtDzQeeX9UigdRn1h5.', 'EDITOR', 1, datetime('now'), datetime('now'));

INSERT OR IGNORE INTO User (id, name, email, passwordHash, role, isActive, createdAt, updatedAt)
VALUES ('cm00000000000000000000003', 'Contributor', 'contributor@traderstape.com', '$2a$10$9LBWdfGhLtAN5su.t5hY4uHUQLozbOCyeAX16zlO0t36zTCNrjSGu', 'CONTRIBUTOR', 1, datetime('now'), datetime('now'));

-- Market Levels (delete existing first to avoid duplicates)
DELETE FROM MarketLevel;

INSERT INTO MarketLevel (id, assetType, symbol, level, note, direction, updatedBy, isPublished, updatedAt)
VALUES ('cm00000000000000000000101', 'STOCK_FNO', 'NIFTY', 24500, 'Key resistance at 24800', 'UP', 'cm00000000000000000000001', 1, datetime('now'));

INSERT INTO MarketLevel (id, assetType, symbol, level, note, direction, updatedBy, isPublished, updatedAt)
VALUES ('cm00000000000000000000102', 'STOCK_FNO', 'BANKNIFTY', 51200, 'Support at 50500', 'DOWN', 'cm00000000000000000000001', 1, datetime('now'));

INSERT INTO MarketLevel (id, assetType, symbol, level, note, direction, updatedBy, isPublished, updatedAt)
VALUES ('cm00000000000000000000103', 'STOCK_FNO', 'RELIANCE', 2850, 'Strong momentum', 'UP', 'cm00000000000000000000001', 1, datetime('now'));

INSERT INTO MarketLevel (id, assetType, symbol, level, note, direction, updatedBy, isPublished, updatedAt)
VALUES ('cm00000000000000000000104', 'STOCK_FNO', 'TCS', 3950, 'Consolidation zone', 'FLAT', 'cm00000000000000000000001', 1, datetime('now'));

INSERT INTO MarketLevel (id, assetType, symbol, level, note, direction, updatedBy, isPublished, updatedAt)
VALUES ('cm00000000000000000000105', 'FOREX', 'EUR/USD', 1.0850, 'Above 200 EMA', 'UP', 'cm00000000000000000000001', 1, datetime('now'));

INSERT INTO MarketLevel (id, assetType, symbol, level, note, direction, updatedBy, isPublished, updatedAt)
VALUES ('cm00000000000000000000106', 'FOREX', 'GBP/USD', 1.2650, 'Bearish divergence', 'DOWN', 'cm00000000000000000000001', 1, datetime('now'));

INSERT INTO MarketLevel (id, assetType, symbol, level, note, direction, updatedBy, isPublished, updatedAt)
VALUES ('cm00000000000000000000107', 'FOREX', 'USD/JPY', 154.50, 'BoJ intervention zone', 'UP', 'cm00000000000000000000001', 1, datetime('now'));

-- News Posts
INSERT OR REPLACE INTO NewsPost (id, title, slug, category, summary, body, authorId, publishedAt, isPublished, isBreaking, isFeatured, isTrending, isEditorPick, createdAt, updatedAt)
VALUES ('cm00000000000000000000201', 'Nifty Breaks 24500 as Bulls Regain Control', 'nifty-breaks-24500-bulls-regain-control', 'STOCKS', 'The Nifty 50 index surged past the 24500 mark on strong buying across sectors, signaling renewed bullish momentum.', '## Market Overview\n\nThe Nifty 50 index closed above the psychologically important 24500 level for the first time this month, driven by broad-based buying in banking, IT, and auto stocks.\n\n## Key Drivers\n\n- Strong FII inflows of ₹2,500 crore\n- Positive global cues from US markets\n- Easing crude oil prices\n\n## Technical Outlook\n\nThe index has formed a bullish flag pattern on the daily chart, suggesting further upside potential. Key resistance is now at 24800, while support has moved up to 24200.\n\n*This is for educational purposes only. Not financial advice.*', 'cm00000000000000000000002', datetime('now'), 1, 0, 0, 0, 0, datetime('now'), datetime('now'));

INSERT OR REPLACE INTO NewsPost (id, title, slug, category, summary, body, authorId, publishedAt, isPublished, isBreaking, isFeatured, isTrending, isEditorPick, createdAt, updatedAt)
VALUES ('cm00000000000000000000202', 'EUR/USD Tests Key Resistance at 1.0900', 'eur-usd-tests-key-resistance', 'FOREX', 'The euro continues its rally against the dollar as ECB signals potential rate hold.', '## Forex Update\n\nThe EUR/USD pair is testing the critical 1.0900 resistance level after a week of steady gains.\n\n## Fundamental Factors\n\n- ECB President hints at maintaining current rates\n- US jobless claims come in higher than expected\n- Eurozone manufacturing PMI shows improvement\n\n## Technical Levels\n\n- Resistance: 1.0900, 1.0950\n- Support: 1.0800, 1.0750\n\nThe pair remains in an uptrend but is overbought on the daily RSI.\n\n*This is for educational purposes only. Not financial advice.*', 'cm00000000000000000000002', datetime('now'), 1, 0, 0, 0, 0, datetime('now'), datetime('now'));

INSERT OR REPLACE INTO NewsPost (id, title, slug, category, summary, body, authorId, publishedAt, isPublished, isBreaking, isFeatured, isTrending, isEditorPick, createdAt, updatedAt)
VALUES ('cm00000000000000000000203', 'Bitcoin Volatility Spikes on Regulatory News', 'bitcoin-volatility-regulatory-news', 'CRYPTO', 'Crypto markets see increased volatility as multiple countries announce new regulatory frameworks.', '## Crypto Market Update\n\nBitcoin experienced a 5% intraday swing as regulatory news from both the US and EU created uncertainty in the crypto markets.\n\n## Key Developments\n\n- US SEC announces new crypto custody rules\n- EU MiCA implementation timeline clarified\n- Institutional inflows remain strong despite volatility\n\n## Market Impact\n\nBitcoin is currently trading at $67,500, with Ethereum at $3,450. Altcoins have seen mixed performance.\n\n*This is for educational purposes only. Not financial advice.*', 'cm00000000000000000000002', datetime('now'), 1, 0, 0, 0, 0, datetime('now'), datetime('now'));

INSERT OR REPLACE INTO NewsPost (id, title, slug, category, summary, body, authorId, publishedAt, isPublished, isBreaking, isFeatured, isTrending, isEditorPick, createdAt, updatedAt)
VALUES ('cm00000000000000000000204', 'Geopolitical Tensions Impact Oil Markets', 'geopolitical-tensions-oil-markets', 'GEOPOLITICAL', 'Rising tensions in the Middle East push crude oil prices higher, impacting global markets.', '## Geopolitical Analysis\n\nEscalating tensions in the Middle East have pushed Brent crude above $85 per barrel, creating ripple effects across global financial markets.\n\n## Market Impact\n\n- Oil & gas stocks rally on higher prices\n- Airline stocks decline on fuel cost concerns\n\n- Safe-haven assets like gold see increased demand\n\n## What to Watch\n\n- Diplomatic efforts in the coming days\n- OPEC+ response to price movements\n- Impact on central bank rate decisions\n\n*This is for educational purposes only. Not financial advice.*', 'cm00000000000000000000002', datetime('now'), 1, 0, 0, 0, 0, datetime('now'), datetime('now'));