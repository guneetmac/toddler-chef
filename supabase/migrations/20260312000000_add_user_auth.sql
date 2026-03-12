/*
  # Add User Authentication

  1. Changes
    - Add user_id column to recipes (nullable for existing shared recipes)
    - Drop old permissive anon policies
    - Add per-user RLS policies (authenticated only)
    - Add trigger to auto-set user_id on insert
    - Drop the valid_meal_type check constraint (blocks custom meal types)

  2. Existing recipes
    - Kept with user_id = NULL, visible to all authenticated users as shared recipes
*/

-- Add user_id column (nullable so existing recipes are preserved as shared)
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop old permissive policies
DROP POLICY IF EXISTS "Anyone can read recipes" ON recipes;
DROP POLICY IF EXISTS "Anyone can insert recipes" ON recipes;
DROP POLICY IF EXISTS "Allow recipe insertion with basic validation" ON recipes;

-- Drop the meal_type check constraint (blocks custom meal types added at runtime)
ALTER TABLE recipes DROP CONSTRAINT IF EXISTS valid_meal_type;

-- New RLS policies (authenticated users only)
CREATE POLICY "Users read own and shared recipes"
  ON recipes FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users insert own recipes"
  ON recipes FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users update own recipes"
  ON recipes FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users delete own recipes"
  ON recipes FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Trigger to auto-set user_id on insert so app code doesn't need to pass it
CREATE OR REPLACE FUNCTION set_recipe_user_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.user_id = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER recipes_set_user_id
  BEFORE INSERT ON recipes
  FOR EACH ROW
  EXECUTE FUNCTION set_recipe_user_id();
