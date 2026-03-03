/*
  # Add Meal Type Column to Recipes

  1. Changes
    - Add `meal_type` column to recipes table with predefined options
    - Allow NULL values for backward compatibility with existing recipes
    - Add index for filtering performance

  2. Values
    - pasta, pancakes, muffins, curries, paratha
    - Can be customized by users when adding recipes
*/

-- Add meal_type column
ALTER TABLE recipes 
ADD COLUMN IF NOT EXISTS meal_type text;

-- Add check constraint for valid meal types (optional, allows NULL)
ALTER TABLE recipes 
ADD CONSTRAINT valid_meal_type 
CHECK (meal_type IS NULL OR meal_type IN ('pasta', 'pancakes', 'muffins', 'curries', 'paratha'));

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_recipes_meal_type ON recipes(meal_type);