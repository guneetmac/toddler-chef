-- Seed sample toddler dinner recipes for guest browsing (user_id = NULL = shared)

INSERT INTO recipes (title, url, prep_time, ingredients, ingredients_with_quantities, category, difficulty_tier, one_sentence_summary, staple_tags, steps, meal_type, user_id)
VALUES

(
  'Cheesy Broccoli Pasta',
  'https://manual-entry.local/sample-1',
  20,
  ARRAY['200g pasta', '1 cup broccoli florets', '1 cup shredded cheddar', '1/2 cup whole milk', '1 tbsp butter', 'pinch of salt'],
  '[{"item":"pasta","quantity":"200g"},{"item":"broccoli florets","quantity":"1 cup"},{"item":"shredded cheddar","quantity":"1 cup"},{"item":"whole milk","quantity":"1/2 cup"},{"item":"butter","quantity":"1 tbsp"}]',
  'dinner',
  'Quick',
  'A creamy, veggie-packed pasta that toddlers love — ready in 20 minutes with hidden broccoli in every bite.',
  ARRAY['Pasta','Cheese'],
  ARRAY[
    'Cook pasta according to package instructions. Add broccoli to the pot in the last 3 minutes of cooking.',
    'Drain pasta and broccoli, reserving 1/4 cup pasta water.',
    'Return to pot over low heat. Add butter, milk, and cheese.',
    'Stir until cheese melts into a creamy sauce, adding pasta water to loosen if needed.',
    'Season with a pinch of salt and serve warm.'
  ],
  'pasta',
  NULL
),

(
  'Hidden Veggie Chicken Meatballs',
  'https://manual-entry.local/sample-2',
  30,
  ARRAY['300g ground chicken', '1/2 cup grated zucchini', '1/4 cup grated carrot', '1 egg', '3 tbsp breadcrumbs', '2 tbsp grated parmesan', '1 tsp olive oil'],
  '[{"item":"ground chicken","quantity":"300g"},{"item":"grated zucchini","quantity":"1/2 cup"},{"item":"grated carrot","quantity":"1/4 cup"},{"item":"egg","quantity":"1"},{"item":"breadcrumbs","quantity":"3 tbsp"},{"item":"grated parmesan","quantity":"2 tbsp"}]',
  'dinner',
  'Medium',
  'Soft, juicy chicken meatballs packed with hidden zucchini and carrot — perfect with pasta, rice, or on their own.',
  ARRAY['Chicken','Eggs','Carrots'],
  ARRAY[
    'Preheat oven to 200°C (400°F). Line a baking tray with parchment paper.',
    'Squeeze grated zucchini in a clean towel to remove excess moisture.',
    'Mix chicken, zucchini, carrot, egg, breadcrumbs, and parmesan until combined.',
    'Roll into small balls (about 3cm diameter) and place on the tray.',
    'Brush lightly with olive oil and bake for 18–20 minutes until golden and cooked through.',
    'Serve with your toddler''s favourite dipping sauce or alongside pasta.'
  ],
  NULL,
  NULL
),

(
  'Sweet Potato & Lentil Dal',
  'https://manual-entry.local/sample-3',
  35,
  ARRAY['1 medium sweet potato, diced', '1/2 cup red lentils', '1 cup coconut milk', '1 cup vegetable broth', '1/2 tsp cumin', '1/2 tsp turmeric', '1 tbsp olive oil'],
  '[{"item":"sweet potato","quantity":"1 medium"},{"item":"red lentils","quantity":"1/2 cup"},{"item":"coconut milk","quantity":"1 cup"},{"item":"vegetable broth","quantity":"1 cup"},{"item":"cumin","quantity":"1/2 tsp"},{"item":"turmeric","quantity":"1/2 tsp"}]',
  'dinner',
  'Medium',
  'A warming, mildly spiced dal loaded with iron-rich lentils and naturally sweet sweet potato — great for baby-led weaning too.',
  ARRAY['Sweet Potato'],
  ARRAY[
    'Heat olive oil in a saucepan over medium heat. Add cumin and turmeric, stir for 30 seconds.',
    'Add diced sweet potato and stir to coat in the spices.',
    'Rinse lentils and add to the pan along with coconut milk and vegetable broth.',
    'Bring to a boil, then reduce heat and simmer for 20–25 minutes until lentils and sweet potato are very soft.',
    'Mash slightly for younger toddlers or leave chunky for older ones.',
    'Serve with soft rice or flatbread.'
  ],
  'curries',
  NULL
),

(
  'Salmon & Pea Rice Bowl',
  'https://manual-entry.local/sample-4',
  25,
  ARRAY['1 salmon fillet', '1 cup cooked rice', '1/2 cup frozen peas', '1/2 avocado', '1 tsp soy sauce (low sodium)', '1 tsp sesame oil', 'squeeze of lemon'],
  '[{"item":"salmon fillet","quantity":"1"},{"item":"cooked rice","quantity":"1 cup"},{"item":"frozen peas","quantity":"1/2 cup"},{"item":"avocado","quantity":"1/2"},{"item":"soy sauce","quantity":"1 tsp"},{"item":"sesame oil","quantity":"1 tsp"}]',
  'dinner',
  'Quick',
  'An omega-3 packed bowl with flaky salmon, creamy avocado, and sweet peas over rice — nutritious and ready in 25 minutes.',
  ARRAY['Avocado','Rice'],
  ARRAY[
    'Cook rice according to package instructions.',
    'Season salmon with a squeeze of lemon. Pan-fry in a little oil for 3–4 minutes each side until cooked through.',
    'Cook peas in boiling water for 2 minutes, then drain.',
    'Flake salmon into bite-sized pieces, removing any bones.',
    'Mix soy sauce and sesame oil together in a small bowl.',
    'Assemble bowl: rice, salmon, peas, and sliced avocado. Drizzle with the dressing.'
  ],
  NULL,
  NULL
),

(
  'Banana Oat Pancakes',
  'https://manual-entry.local/sample-5',
  15,
  ARRAY['2 ripe bananas', '2 eggs', '1/2 cup rolled oats', '1/2 tsp cinnamon', '1 tsp coconut oil'],
  '[{"item":"ripe bananas","quantity":"2"},{"item":"eggs","quantity":"2"},{"item":"rolled oats","quantity":"1/2 cup"},{"item":"cinnamon","quantity":"1/2 tsp"}]',
  'breakfast',
  'Quick',
  'Three-ingredient banana pancakes that are naturally sweet, gluten-free, and perfect for tiny hands to pick up.',
  ARRAY['Banana','Eggs','Oats'],
  ARRAY[
    'Blend bananas, eggs, oats, and cinnamon until smooth. Let batter rest for 2 minutes.',
    'Heat coconut oil in a non-stick pan over medium-low heat.',
    'Pour small circles of batter (about 2 tbsp each) into the pan.',
    'Cook for 2–3 minutes until bubbles form, then flip and cook 1–2 minutes more.',
    'Serve with fresh fruit or a small drizzle of honey (for toddlers over 1 year).'
  ],
  'pancakes',
  NULL
),

(
  'Mini Veggie Egg Muffins',
  'https://manual-entry.local/sample-6',
  25,
  ARRAY['4 eggs', '1/4 cup diced bell pepper', '1/4 cup baby spinach, chopped', '2 tbsp grated cheese', '2 tbsp milk', 'pinch of salt'],
  '[{"item":"eggs","quantity":"4"},{"item":"diced bell pepper","quantity":"1/4 cup"},{"item":"baby spinach","quantity":"1/4 cup"},{"item":"grated cheese","quantity":"2 tbsp"},{"item":"milk","quantity":"2 tbsp"}]',
  'snacks',
  'Quick',
  'Protein-packed mini egg muffins stuffed with colourful veggies — make ahead and refrigerate for up to 3 days.',
  ARRAY['Eggs','Spinach','Cheese'],
  ARRAY[
    'Preheat oven to 180°C (350°F). Grease a mini muffin tin.',
    'Whisk eggs and milk together in a bowl. Season with a pinch of salt.',
    'Stir in bell pepper, spinach, and cheese.',
    'Pour into muffin cups, filling about 3/4 full.',
    'Bake for 12–15 minutes until puffed and set in the centre.',
    'Cool slightly before serving. Store leftovers in the fridge for up to 3 days.'
  ],
  'muffins',
  NULL
);
