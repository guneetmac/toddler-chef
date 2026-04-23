-- Add multi-category support: categories[] column alongside existing category
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS categories text[] DEFAULT '{}';

-- Backfill: seed categories from the existing single category column
UPDATE recipes SET categories = ARRAY[category] WHERE categories = '{}' OR categories IS NULL;
