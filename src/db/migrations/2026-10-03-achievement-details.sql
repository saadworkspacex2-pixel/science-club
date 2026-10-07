-- Optional normalized columns for richer Olympiad/achievement records.
-- The app can also store this metadata in the existing settings key/value table,
-- so this migration is not required for the feature to work.

ALTER TABLE achievements
  ADD COLUMN IF NOT EXISTS organizer_info text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS olympiad_website text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS map_embed_url text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS participants jsonb NOT NULL DEFAULT '[]'::jsonb;
