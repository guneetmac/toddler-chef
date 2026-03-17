import { useState } from 'react';
import { Clock, ExternalLink, Pencil, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Recipe } from '../types/recipe';
import { EditRecipeModal } from './EditRecipeModal';

interface RecipeCardProps {
  recipe: Recipe;
  onUpdated: () => void;
}

export function RecipeCard({ recipe, onUpdated }: RecipeCardProps) {
  const [showEdit, setShowEdit] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Delete "${recipe.title}"?`)) return;
    setIsDeleting(true);
    await supabase.from('recipes').delete().eq('id', recipe.id);
    onUpdated();
  };
  const categoryEmojis = {
    breakfast: '🌅',
    lunch: '☀️',
    dinner: '🌙',
    snacks: '🍪',
  };

  const timeBadgeColor = recipe.prep_time <= 10
    ? 'bg-green-500'
    : recipe.prep_time <= 20
    ? 'bg-warmOrange-500'
    : 'bg-yellow-500';

  const mainIngredients = recipe.ingredients.slice(0, 3);

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden border-2 border-gray-200 hover:border-sage-400 transform hover:scale-[1.02]">
      <div className="relative">
        <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
          <button
            onClick={() => setShowEdit(true)}
            className="p-2 bg-white/90 hover:bg-white rounded-full shadow-md text-gray-500 hover:text-sage-700 transition-all"
            title="Edit recipe"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-2 bg-white/90 hover:bg-white rounded-full shadow-md text-gray-500 hover:text-red-500 transition-all disabled:opacity-50"
            title="Delete recipe"
          >
            <Trash2 size={15} />
          </button>
          <div className={`${timeBadgeColor} text-white px-4 py-3 rounded-full shadow-lg`}>
            <div className="flex items-center gap-2">
              <Clock size={20} strokeWidth={3} />
              <span className="text-xl font-black">{recipe.prep_time}m</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-sage-100 to-warmOrange-100 p-6 pt-20">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-5xl">{categoryEmojis[recipe.category]}</span>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 leading-tight">
                {recipe.title}
              </h3>
              <p className="text-sm text-gray-600 font-medium mt-1">
                {recipe.category.charAt(0).toUpperCase() + recipe.category.slice(1)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {recipe.one_sentence_summary && (
          <p className="text-base text-gray-700 mb-4 leading-relaxed">
            {recipe.one_sentence_summary}
          </p>
        )}

        <div className="bg-sage-50 rounded-xl p-4 mb-4">
          <h4 className="text-sm font-bold text-sage-800 mb-3 uppercase tracking-wide">
            Main Ingredients
          </h4>
          <ul className="space-y-2">
            {mainIngredients.map((ingredient, index) => (
              <li key={index} className="flex items-center gap-2 text-base text-gray-800">
                <span className="w-2 h-2 bg-sage-500 rounded-full flex-shrink-0"></span>
                <span className="font-medium">{ingredient}</span>
              </li>
            ))}
            {recipe.ingredients.length > 3 && (
              <li className="text-sm text-gray-500 italic pl-4">
                + {recipe.ingredients.length - 3} more
              </li>
            )}
          </ul>
        </div>

        {recipe.staple_tags && recipe.staple_tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {recipe.staple_tags.map((tag, index) => (
              <span
                key={index}
                className="bg-warmOrange-100 text-warmOrange-800 px-3 py-1 rounded-full text-xs font-bold border border-warmOrange-300"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {recipe.steps && recipe.steps.length > 0 && (
          <div className="bg-blue-50 rounded-xl p-4 mb-4">
            <h4 className="text-sm font-bold text-blue-800 mb-3 uppercase tracking-wide">
              Instructions
            </h4>
            <ol className="space-y-2">
              {recipe.steps.map((step, index) => (
                <li key={index} className="flex gap-3 text-sm text-gray-800">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </span>
                  <span className="leading-relaxed pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {recipe.url &&
         !recipe.url.includes('manual-entry.local') &&
         !recipe.url.includes('toddlerchef.app') && (
          <a
            href={recipe.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-base text-warmOrange-600 hover:text-warmOrange-700 font-bold hover:gap-3 transition-all"
          >
            <ExternalLink size={18} />
            View Original Post
          </a>
        )}
      </div>
      {showEdit && (
        <EditRecipeModal
          recipe={recipe}
          onSaved={() => { setShowEdit(false); onUpdated(); }}
          onDismiss={() => setShowEdit(false)}
        />
      )}
    </div>
  );
}
