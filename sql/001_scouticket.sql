CREATE TABLE IF NOT EXISTS scouticket_group_data (
  organization_id TEXT PRIMARY KEY REFERENCES organization(id) ON DELETE CASCADE,
  units JSONB NOT NULL DEFAULT '[]'::jsonb,
  treasury_email TEXT NOT NULL DEFAULT '',
  treasury_verification JSONB NOT NULL DEFAULT '{"status":"pending"}'::jsonb
);

CREATE TABLE IF NOT EXISTS scouticket_user_unit_preference (
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  organization_id TEXT NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
  unit_id TEXT NOT NULL,
  PRIMARY KEY (user_id, organization_id)
);
