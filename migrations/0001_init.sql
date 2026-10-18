-- Skema D1 (SQLite) untuk Ruang Misi KPK. Aman dijalankan berulang.
CREATE TABLE IF NOT EXISTS group_tokens (
  id          TEXT PRIMARY KEY,
  code        TEXT NOT NULL UNIQUE,        -- selalu huruf besar
  status      TEXT NOT NULL,               -- available | claimed | disabled | resubmit_allowed
  claimed_by  TEXT,                        -- id sesi (submission) yang memegang ID ini
  data        TEXT NOT NULL,               -- JSON lengkap token
  updated_at  INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS submissions (
  id          TEXT PRIMARY KEY,
  group_code  TEXT,                        -- huruf besar, untuk pencarian sesi milik kelompok
  data        TEXT NOT NULL,               -- JSON lengkap jawaban + evaluasi
  updated_at  INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS submissions_group_code_idx ON submissions (group_code);

-- Batu nisan sesi yang dihapus guru. Sesi dengan id di sini tidak boleh disimpan lagi,
-- sehingga data siswa yang masih membuka halaman tidak "hidup kembali".
CREATE TABLE IF NOT EXISTS revoked_sessions (
  submission_id TEXT PRIMARY KEY,
  group_code    TEXT,
  revoked_at    INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS app_settings (
  key         TEXT PRIMARY KEY,
  value       TEXT NOT NULL,               -- JSON
  updated_at  INTEGER NOT NULL
);
