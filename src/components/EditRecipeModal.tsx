import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Recipe, Category } from '../types/recipe';

function toggleCategory(current: Category[], value: Category): Category[] {
  return current.includes(value)
    ? current.filter(c => c !== value)
    : [...current, value];
}

interface EditRecipeModalProps {
  recipe: Recipe;
  onSaved: () => void;
  onDismiss: () => void;
}

const CATEGORIES: { value: Category; label: string; icon: string }[] = [
  { value: 'breakfast', label: 'Breakfast', icon: '🌅' },
  { value: 'lunch', label: 'Lunch', icon: '☀️' },
  { value: 'dinner', label: 'Dinner', icon: '🌙' },
  { value: 'snacks', label: 'Snacks', icon: '🍪' },
];

export function EditRecipeModal({ recipe, onSaved, onDismiss }: EditRecipeModalProps) {
  const [title, setTitle] = useState(recipe.title);
  const [categories, setCategories] = useState<Category[]>(
    recipe.categories?.length ? recipe.categories as Category[] : [recipe.category]
  );
  const [summary, setSummary] = useState(recipe.one_sentence_summary ?? '');
  const [prepTime, setPrepTime] = useState(String(recipe.prep_time));
  const [ingredients, setIngredients] = useState<string[]>(
    recipe.ingredients.length > 0 ? recipe.ingredients : ['']
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const updateIngredient = (index: number, value: string) => {
    setIngredients(prev => prev.map((ing, i) => i === index ? value : ing));
  };

  const addIngredient = () => setIngredients(prev => [...prev, '']);

  const removeIngredient = (index: number) => {
    setIngredients(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!title.trim()) { setError('Title is required'); return; }
    setIsSaving(true);
    setError('');

    const cleanIngredients = ingredients.map(i => i.trim()).filter(i => i.length > 0);
    const time = parseInt(prepTime) || recipe.prep_time;
    const difficulty = time <= 15 ? 'Quick' : time <= 30 ? 'Medium' : 'Project';

    const STAPLES = ['Eggs','Oats','Sweet Potato','Spinach','Banana','Chicken','Cheese','Yogurt','Pasta','Avocado','Honey','Berries','Rice','Beans','Carrots'];
    const combined = cleanIngredients.join(' ').toLowerCase();
    const stapleTags = STAPLES.filter(s => combined.includes(s.toLowerCase()));

    try {
      const { error: updateError } = await supabase
        .from('recipes')
        .update({
          title: title.trim(),
          category: categories[0] ?? recipe.category,
          categories,
          one_sentence_summary: summary.trim() || null,
          prep_time: time,
          difficulty_tier: difficulty,
          ingredients: cleanIngredients,
          ingredients_with_quantities: cleanIngredients.map(i => ({ item: i, quantity: '' })),
          staple_tags: stapleTags,
        })
        .eq('id', recipe.id);

      if (updateError) throw updateError;
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 py-8 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-black text-sage-800">Edit Recipe</h2>
          <button onClick={onDismiss} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border-2 border-sage-200 focus:border-sage-500 focus:outline-none text-gray-800 text-sm"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Category
              <span className="ml-2 text-xs font-normal text-sage-600">(select all that apply)</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategories(prev => toggleCategory(prev, cat.value))}
                  className={`flex flex-col items-center gap-1 py-2 rounded-xl font-semibold text-xs transition-all ${
                    categories.includes(cat.value)
                      ? 'bg-sage-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-sage-50'
                  }`}
                >
                  <span className="text-lg">{cat.icon}</span>
                  {cat.label}
                </button>
              ))}
            </div>
            {categories.length === 0 && (
              <p className="text-xs text-red-500 mt-1">Select at least one category</p>
            )}
          </div>

          {/* Summary */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Summary</label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="One sentence description of the recipe..."
              rows={2}
              className="w-full px-4 py-2 rounded-xl border-2 border-sage-200 focus:border-sage-500 focus:outline-none text-gray-800 text-sm resize-none"
            />
          </div>

          {/* Prep time */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Prep time (minutes)</label>
            <input
              type="number"
              value={prepTime}
              onChange={(e) => setPrepTime(e.target.value)}
              min="1"
              className="w-32 px-4 py-2 rounded-xl border-2 border-sage-200 focus:border-sage-500 focus:outline-none text-gray-800 text-sm"
            />
          </div>

          {/* Ingredients */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Ingredients</label>
            <div className="space-y-2">
              {ingredients.map((ing, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={ing}
                    onChange={(e) => updateIngredient(index, e.target.value)}
                    placeholder={`e.g. 1 cup pasta`}
                    className="flex-1 px-4 py-2 rounded-xl border-2 border-sage-200 focus:border-sage-500 focus:outline-none text-gray-800 text-sm"
                  />
                  <button
                    onClick={() => removeIngredient(index)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    disabled={ingredients.length === 1}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={addIngredient}
              className="mt-2 flex items-center gap-1 text-sm text-sage-600 hover:text-sage-800 font-semibold"
            >
              <Plus size={15} />
              Add ingredient
            </button>
          </div>
        </div>

        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

        <div className="flex gap-3 mt-6">
          <button
            onClick={onDismiss}
            className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || categories.length === 0}
            className="flex-1 py-3 rounded-xl bg-sage-600 hover:bg-sage-700 text-white font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
