-- Optional per-entity SEO overrides for detail pages.
-- Additive with defaults so existing rows and behaviour are unchanged:
-- when seo_title / seo_description are blank the page keeps deriving its
-- metadata from name/role/bio or title/subtitle exactly as before.

ALTER TABLE members
  ADD COLUMN IF NOT EXISTS seo_title text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS seo_description text NOT NULL DEFAULT '';

ALTER TABLE achievements
  ADD COLUMN IF NOT EXISTS seo_title text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS seo_description text NOT NULL DEFAULT '';

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS seo_title text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS seo_description text NOT NULL DEFAULT '';
