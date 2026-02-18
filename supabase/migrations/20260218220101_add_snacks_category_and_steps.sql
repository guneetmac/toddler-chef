/*
  # Add Snacks Category and Recipe Steps

  1. Changes
    - Add 'snacks' as a valid category option
    - Add 'steps' column to store cooking instructions
    - Update existing check constraint to include snacks

  2. New Columns
    - `steps` (text array) - Array of cooking instruction steps

  3. Notes
    - Existing recipes will have NULL steps (which is fine)
    - The category constraint is updated to include 'snacks'
*/

-- Add steps column to store cooking instructions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'recipes' AND column_name = 'steps'
  ) THEN
    ALTER TABLE recipes ADD COLUMN steps text[];
  END IF;
END $$;

-- Drop the old category constraint if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE constraint_name = 'recipes_category_check'
  ) THEN
    ALTER TABLE recipes DROP CONSTRAINT recipes_category_check;
  END IF;
END $$;

-- Add new constraint that includes snacks
ALTER TABLE recipes ADD CONSTRAINT recipes_category_check 
  CHECK (category IN ('breakfast', 'lunch', 'dinner', 'snacks'));
