CREATE TABLE IF NOT EXISTS "rateLimit" (
  id TEXT PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  count INTEGER NOT NULL,
  "lastRequest" BIGINT NOT NULL
);

ALTER TABLE "rateLimit" ADD COLUMN IF NOT EXISTS id TEXT;
UPDATE "rateLimit" SET id = key WHERE id IS NULL;
ALTER TABLE "rateLimit" ALTER COLUMN id SET NOT NULL;

DO $$
DECLARE
  contrainte_primaire RECORD;
BEGIN
  FOR contrainte_primaire IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = '"rateLimit"'::regclass AND contype = 'p'
  LOOP
    EXECUTE format(
      'ALTER TABLE "rateLimit" DROP CONSTRAINT %I',
      contrainte_primaire.conname
    );
  END LOOP;
  ALTER TABLE "rateLimit" ADD PRIMARY KEY (id);
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "rateLimit_key_idx"
  ON "rateLimit" (key);
CREATE INDEX IF NOT EXISTS "rateLimit_lastRequest_idx"
  ON "rateLimit" ("lastRequest");
