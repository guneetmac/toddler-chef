/*
  # Add Recipe Insert Rate Limiting

  1. Changes
    - Add trigger function to limit recipe inserts to 50 per user per day
    - Raises an exception if the limit is exceeded

  2. Security
    - Prevents spam inserts via the API
    - Applies to all authenticated users
*/

CREATE OR REPLACE FUNCTION check_recipe_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
  recipe_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO recipe_count
  FROM recipes
  WHERE user_id = auth.uid()
    AND created_at > NOW() - INTERVAL '1 day';

  IF recipe_count >= 50 THEN
    RAISE EXCEPTION 'Rate limit exceeded: maximum 50 recipes per day';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER enforce_recipe_rate_limit
  BEFORE INSERT ON recipes
  FOR EACH ROW
  EXECUTE FUNCTION check_recipe_rate_limit();
