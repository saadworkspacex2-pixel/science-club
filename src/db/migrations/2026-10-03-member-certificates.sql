-- Optional normalized storage for public certificate metadata.
-- The current app also stores certificate metadata in the existing settings
-- key/value table when this column has not been applied, so this migration is
-- not required for the certificate upload feature.
ALTER TABLE members
  ADD COLUMN IF NOT EXISTS certificates jsonb NOT NULL DEFAULT '[]'::jsonb;
