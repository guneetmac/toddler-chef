/*
  # Create recipes table for Toddler Chef app

  1. New Tables
    - `recipes`
      - `id` (uuid, primary key)
      - `title` (text) - Recipe name
      - `url` (text) - Instagram/TikTok URL
      - `prep_time` (integer) - Time in minutes
      - `ingredients` (text array) - List of ingredients
      - `category` (text) - breakfast, lunch, or dinner
      - `created_at` (timestamptz) - Creation timestamp

  2. Security
    - Enable RLS on `recipes` table
    - Add policy for public read access (MVP doesn't require auth)
    - Add policy for public insert access (MVP doesn't require auth)
*/

CREATE TABLE IF NOT EXISTS recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  url text NOT NULL,
  prep_time integer NOT NULL,
  ingredients text[] NOT NULL DEFAULT '{}',
  category text NOT NULL CHECK (category IN ('breakfast', 'lunch', 'dinner')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read recipes"
  ON recipes FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can insert recipes"
  ON recipes FOR INSERT
  TO anon
  WITH CHECK (true);