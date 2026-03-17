import type { Category } from '../types/recipe';

const KEYWORDS: Record<Category, string[]> = {
  breakfast: [
    'breakfast', 'morning', 'pancake', 'waffle', 'oatmeal', 'porridge',
    'toast', 'egg', 'scramble', 'cereal', 'granola', 'smoothie', 'yogurt',
    'muffin', 'french toast', 'overnight oats', 'frittata', 'omelette',
  ],
  lunch: [
    'lunch', 'sandwich', 'wrap', 'salad', 'soup', 'quesadilla', 'noodle',
    'bowl', 'lunchbox', 'midday', 'roll',
  ],
  snacks: [
    'snack', 'bite', 'finger food', 'cookie', 'biscuit', 'cracker',
    'dip', 'hummus', 'fruit', 'bar', 'ball', 'bliss ball', 'energy ball',
    'popsicle', 'ice cream', 'treat', 'mini', 'toddler snack',
  ],
  dinner: [
    'dinner', 'supper', 'pasta', 'rice', 'curry', 'stir fry', 'chicken',
    'beef', 'fish', 'salmon', 'meatball', 'casserole', 'roast', 'stew',
    'taco', 'burrito', 'pizza', 'pie', 'bake', 'paratha', 'dal', 'lentil',
  ],
};

export function guessCategory(text: string): Category {
  const lower = text.toLowerCase();
  const scores: Record<Category, number> = {
    breakfast: 0,
    lunch: 0,
    snacks: 0,
    dinner: 0,
  };

  for (const [category, keywords] of Object.entries(KEYWORDS) as [Category, string[]][]) {
    for (const keyword of keywords) {
      if (lower.includes(keyword)) {
        scores[category]++;
      }
    }
  }

  const best = (Object.entries(scores) as [Category, number][])
    .sort((a, b) => b[1] - a[1])[0];

  return best[1] > 0 ? best[0] : 'dinner';
}
