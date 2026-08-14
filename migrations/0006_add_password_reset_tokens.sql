-- Migration number: 0006
-- Migration name: add_password_reset_tokens

CREATE TABLE PasswordResetToken (
	id TEXT PRIMARY KEY,
	userId TEXT NOT NULL,
	token TEXT NOT NULL UNIQUE,
	expiresAt DATETIME NOT NULL,
	usedAt DATETIME,
	createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (userId) REFERENCES User(id)
);
CREATE INDEX idx_passwordresettoken_token ON PasswordResetToken(token);
CREATE INDEX idx_passwordresettoken_userid ON PasswordResetToken(userId);