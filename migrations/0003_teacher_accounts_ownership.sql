-- Akun guru individual dan batas kepemilikan data. Migrasi ini hanya diterapkan saat perintah D1 local dijalankan.
CREATE TABLE IF NOT EXISTS teacher_accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  google_sub TEXT NOT NULL UNIQUE,
  google_email TEXT NOT NULL COLLATE NOCASE UNIQUE,
  username TEXT NOT NULL COLLATE NOCASE UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_teacher_accounts_username ON teacher_accounts(username);
ALTER TABLE group_tokens ADD COLUMN owner_id TEXT NOT NULL DEFAULT 'legacy';
ALTER TABLE submissions ADD COLUMN owner_id TEXT NOT NULL DEFAULT 'legacy';
CREATE INDEX IF NOT EXISTS group_tokens_owner_idx ON group_tokens(owner_id, updated_at);
CREATE INDEX IF NOT EXISTS submissions_owner_idx ON submissions(owner_id, updated_at);

CREATE TABLE IF NOT EXISTS teacher_app_settings (
  owner_id TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (owner_id, key)
);
CREATE INDEX IF NOT EXISTS teacher_app_settings_owner_idx ON teacher_app_settings(owner_id);
