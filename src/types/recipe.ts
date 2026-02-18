export interface Recipe {
  id: string;
  title: string;
  url: string;
  prep_time: number;
  ingredients: string[];
  category: 'breakfast' | 'lunch' | 'dinner';
  created_at: string;
  difficulty_tier: 'Quick' | 'Medium' | 'Project';
  one_sentence_summary: string | null;
  ingredients_with_quantities: Array<{ item: string; quantity: string }>;
  staple_tags: string[];
}

export type Category = 'breakfast' | 'lunch' | 'dinner';

export const COMMON_INGREDIENTS = [
  'Eggs',
  'Sweet Potato',
  'Spinach',
  'Oats',
  'Banana',
  'Avocado',
  'Chicken',
  'Cheese',
  'Yogurt',
  'Pasta'
] as const;
