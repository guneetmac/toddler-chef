/*
  # Fix RLS Security Issues

  1. Security Changes
    - Drop the insecure "Anyone can insert recipes" policy (WITH CHECK true)
    - Create a more restrictive policy that validates recipe data before insertion
    - Ensure only valid recipe data can be inserted
    
  2. Changes Made
    - Remove unrestricted INSERT policy
    - Add policy that checks for required fields and valid data
    - Validates category is one of the allowed values
    - Ensures prep_time is positive and reasonable (1-240 minutes)
    - Ensures title and url are not empty
    - Ensures ingredients array has at least one item
*/

DROP POLICY IF EXISTS "Anyone can insert recipes" ON recipes;

CREATE POLICY "Validated recipe insertion"
  ON recipes FOR INSERT
  TO anon
  WITH CHECK (
    title IS NOT NULL AND 
    title != '' AND 
    url IS NOT NULL AND 
    url != '' AND 
    prep_time > 0 AND 
    prep_time <= 240 AND
    category IN ('breakfast', 'lunch', 'dinner') AND
    array_length(ingredients, 1) > 0
  );