/*
  # Allow anonymous users to read shared recipes

  Guests (not logged in) can browse shared recipes (user_id IS NULL) read-only.
  They cannot insert, update, or delete anything.
*/

CREATE POLICY "Anon can read shared recipes"
  ON recipes FOR SELECT
  TO anon
  USING (user_id IS NULL);
