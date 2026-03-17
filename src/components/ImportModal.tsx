import { useState } from 'react';
import { X, ChefHat } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { extractRecipe } from '../lib/recipeExtractor';
import { guessCategory } from '../lib/categoryGuesser';
import type { Category } from '../types/recipe';

interface ImportModalProps {
  importUrl: string;
  importText: string;
  onComplete: () => void;
  onDismiss: () => void;
}

const CATEGORIES: { value: Category; label: string; icon: string }[] = [
  { value: 'breakfast', label: 'Breakfast', icon: '🌅' },
  { value: 'lunch', label: 'Lunch', icon: '☀️' },
  { value: 'dinner', label: 'Dinner', icon: '🌙' },
  { value: 'snacks', label: 'Snacks', icon: '🍪' },
];

export function ImportModal({ importUrl, importText, onComplete, onDismiss }: ImportModalProps) {
  const sourceUrl = importUrl || `https://manual-entry.local/${Date.now()}`;
  const textToExtract = importText || `Recipe from ${importUrl}`;
  const extracted = extractRecipe(sourceUrl, textToExtract, 'dinner');

  const guessed = guessCategory(importText || importUrl);
  const [title, setTitle] = useState(extracted.recipe_name);
  const [category, setCategory] = useState<Category>(guessed);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const preview = importText
    ? importText.substring(0, 200) + (importText.length > 200 ? '...' : '')
    : importUrl;

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    try {
      const { error: insertError } = await supabase.from('recipes').insert([{

        title: title.trim() || extracted.recipe_name,
        url: extracted.source_url,
        prep_time: extracted.total_time_minutes,
        ingredients: extracted.ingredients.map(i => `${i.quantity} ${i.item}`),
        ingredients_with_quantities: extracted.ingredients,
        difficulty_tier: extracted.difficulty_tier,
        one_sentence_summary: extracted.one_sentence_summary,
        staple_tags: extracted.staple_tags,
        steps: extracted.steps,
        category,
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
            <span className="ml-2 text-xs text-sage-600 font-normal">(guessed from content — change if needed)</span>
          </p>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                  category === cat.value
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
