/*
  # Simplify Recipe Insert Policy

  1. Changes
    - Drop the overly strict insert policy
    - Create a new, simpler policy that allows inserts with basic validation
    - Keep the SELECT policy unchanged

  2. Security
    - Still requires basic fields (title, url, category)
    - Allows empty ingredients array (for cases where extraction fails)
    - Validates category is one of the allowed values
*/

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Validated recipe insertion" ON recipes;

-- Create a simpler insert policy
CREATE POLICY "Allow recipe insertion with basic validation"
  ON recipes
  FOR INSERT
  TO anon
  WITH CHECK (
    title IS NOT NULL 
    AND title <> '' 
    AND url IS NOT NULL 
    AND url <> ''
    AND category IN ('breakfast', 'lunch', 'dinner', 'snacks')
  );