-- Existing classes are the session records; preserve their stable IDs and access codes.
-- Existing group links are backfilled only when their JSON classId matches a real class.
ALTER TABLE group_tokens ADD COLUMN session_id TEXT REFERENCES classes(id) ON DELETE RESTRICT;
UPDATE group_tokens
SET session_id = json_extract(data, '$.classId')
WHERE json_extract(data, '$.classId') IN (SELECT id FROM classes);
CREATE INDEX IF NOT EXISTS group_tokens_session_idx ON group_tokens(session_id, updated_at);
