export interface Recipe {
  id: string;
  title: string;
  url: string;
  prep_time: number;
  ingredients: string[];
  category: 'breakfast' | 'lunch' | 'dinner' | 'snacks';
  meal_type: MealType | null;
  created_at: string;
  difficulty_tier: 'Quick' | 'Medium' | 'Project';
  one_sentence_summary: string | null;
  ingredients_with_quantities: Array<{ item: string; quantity: string }>;
  staple_tags: string[];
  steps: string[] | null;
}

export type Category = 'breakfast' | 'lunch' | 'dinner' | 'snacks';
export type MealType = 'pasta' | 'pancakes' | 'muffins' | 'curries' | 'paratha';

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
