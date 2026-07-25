-- Seed users for Cloudflare D1
-- Passwords are pre-hashed with bcrypt (10 rounds):
-- Admin123!       → $2a$10$2iA742gfhcS5Ke1FXqGdWuhqg4YohzdQc96oOoaW8eJOQy3P458ey
-- Editor123!      → $2a$10$ILjlGYNgSHGrE9q.y9nbk.XRRX/2.zJBdbFtDzQeeX9UigdRn1h5.
-- Contributor123! → $2a$10$9LBWdfGhLtAN5su.t5hY4uHUQLozbOCyeAX16zlO0t36zTCNrjSGu

INSERT OR IGNORE INTO User (id, name, email, passwordHash, role, isActive, createdAt, updatedAt)
VALUES ('cm00000000000000000000001', 'Admin', 'admin@traderstape.com', '$2a$10$2iA742gfhcS5Ke1FXqGdWuhqg4YohzdQc96oOoaW8eJOQy3P458ey', 'ADMIN', 1, datetime('now'), datetime('now'));

INSERT OR IGNORE INTO User (id, name, email, passwordHash, role, isActive, createdAt, updatedAt)
VALUES ('cm00000000000000000000002', 'Editor', 'editor@traderstape.com', '$2a$10$ILjlGYNgSHGrE9q.y9nbk.XRRX/2.zJBdbFtDzQeeX9UigdRn1h5.', 'EDITOR', 1, datetime('now'), datetime('now'));

INSERT OR IGNORE INTO User (id, name, email, passwordHash, role, isActive, createdAt, updatedAt)
VALUES ('cm00000000000000000000003', 'Contributor', 'contributor@traderstape.com', '$2a$10$9LBWdfGhLtAN5su.t5hY4uHUQLozbOCyeAX16zlO0t36zTCNrjSGu', 'CONTRIBUTOR', 1, datetime('now'), datetime('now'));