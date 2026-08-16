import { useState } from 'react';
import { X, ChefHat } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { extractRecipe } from '../lib/recipeExtractor';
import { guessCategory } from '../lib/categoryGuesser';
import type { Category } from '../types/recipe';

function toggleCategory(current: Category[], value: Category): Category[] {
  if (current.includes(value)) {
    // don't allow deselecting the last category
    if (current.length === 1) return current;
    return current.filter(c => c !== value);
  }
  return [...current, value];
}

interface StructuredRecipe {
  name: string;
  description: string;
  totalTimeMinutes: number;
  ingredients: string[];
  steps: string[];
}

interface ImportModalProps {
  importUrl: string;
  importText: string;
  structured: StructuredRecipe | null;
  onComplete: () => void;
  onDismiss: () => void;
}

const CATEGORIES: { value: Category; label: string; icon: string }[] = [
  { value: 'breakfast', label: 'Breakfast', icon: '🌅' },
  { value: 'lunch', label: 'Lunch', icon: '☀️' },
  { value: 'dinner', label: 'Dinner', icon: '🌙' },
  { value: 'snacks', label: 'Snacks', icon: '🍪' },
];

const STAPLES = ['Eggs','Oats','Sweet Potato','Spinach','Banana','Chicken','Cheese','Yogurt','Pasta','Avocado','Honey','Berries','Rice','Beans','Carrots'];

function findStaplesFromList(ingredients: string[]): string[] {
  const combined = ingredients.join(' ').toLowerCase();
  return STAPLES.filter(s => combined.includes(s.toLowerCase()));
}

export function ImportModal({ importUrl, importText, structured, onComplete, onDismiss }: ImportModalProps) {
  const sourceUrl = importUrl || `https://manual-entry.local/${Date.now()}`;

  // Use structured data when available, otherwise extract from text
  const extracted = structured
    ? null
    : extractRecipe(sourceUrl, importText || `Recipe from ${importUrl}`, 'dinner');

  const initialTitle = structured?.name ?? extracted?.recipe_name ?? '';
  const guessed = guessCategory(importText || importUrl);
  const [title, setTitle] = useState(initialTitle);
  const [categories, setCategories] = useState<Category[]>([guessed]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const hasDefaultIngredients = !structured && extracted !== null && extracted.ingredients.length === 0;

  const preview = importText
    ? importText.substring(0, 200) + (importText.length > 200 ? '...' : '')
    : importUrl;

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    try {
      const ingredients = structured
        ? structured.ingredients
        : (extracted?.ingredients.map(i => `${i.quantity} ${i.item}`) ?? []);

      const stapleTags = structured
        ? findStaplesFromList(structured.ingredients)
        : (extracted?.staple_tags ?? []);

      const { error: insertError } = await supabase.from('recipes').insert([{
        title: title.trim() || initialTitle,
        url: sourceUrl,
        prep_time: structured?.totalTimeMinutes ?? extracted?.total_time_minutes ?? 15,
        ingredients,
        ingredients_with_quantities: structured
          ? structured.ingredients.map(s => ({ item: s, quantity: '' }))
          : (extracted?.ingredients ?? []),
        difficulty_tier: structured
          ? (structured.totalTimeMinutes <= 15 ? 'Quick' : structured.totalTimeMinutes <= 30 ? 'Medium' : 'Project')
          : (extracted?.difficulty_tier ?? 'Quick'),
        one_sentence_summary: structured?.description || extracted?.one_sentence_summary || '',
        staple_tags: stapleTags,
        steps: structured?.steps ?? extracted?.steps ?? [],
        category: categories[0] ?? 'snacks',
        categories,
        meal_type: null,
      }]);

      if (insertError) throw insertError;
      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save recipe');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ChefHat size={24} className="text-sage-600" />
            <h2 className="text-xl font-black text-sage-800">Import Recipe</h2>
          </div>
          <button onClick={onDismiss} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="bg-gray-50 rounded-xl p-3 mb-4 text-sm text-gray-600 max-h-32 overflow-y-auto">
          {preview}
        </div>

        {hasDefaultIngredients && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4 text-sm text-amber-800">
            ⚠️ Ingredients couldn't be extracted from this page (login required). Placeholder ingredients have been added — <strong>edit the recipe after saving</strong> to add the real ones.
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Recipe Title
            <span className="ml-2 text-xs text-sage-600 font-normal">(auto-extracted — change if needed)</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border-2 border-sage-200 focus:border-sage-500 focus:outline-none text-gray-800 text-sm"
          />
        </div>

        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Category
            <span className="ml-2 text-xs text-sage-600 font-normal">(select all that apply)</span>
          </p>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategories(prev => toggleCategory(prev, cat.value))}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                  categories.includes(cat.value)
                    ? 'bg-sage-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-sage-50'
                }`}
              >
                <span>{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-warmOrange-500 hover:bg-warmOrange-600 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : 'Save Recipe'}
        </button>
      </div>
    </div>
  );
}
