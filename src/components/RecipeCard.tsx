import { useState } from 'react';
import { Clock, ExternalLink, Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Recipe } from '../types/recipe';
import { EditRecipeModal } from './EditRecipeModal';

interface RecipeCardProps {
  recipe: Recipe;
  onUpdated: () => void;
}

export function RecipeCard({ recipe, onUpdated }: RecipeCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Delete "${recipe.title}"?`)) return;
    setIsDeleting(true);
    await supabase.from('recipes').delete().eq('id', recipe.id);
    onUpdated();
  };

  const categoryEmojis: Record<string, string> = {
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
    <div className="bg-white rounded-2xl shadow-md border-2 border-gray-200 hover:border-sage-400 transition-all overflow-hidden">
      {/* Collapsed header — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-sage-50 transition-colors"
      >
        <span className="text-2xl">{categoryEmojis[recipe.category]}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 truncate">{recipe.title}</h3>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`inline-flex items-center gap-1 text-xs font-bold text-white px-2 py-0.5 rounded-full ${timeBadgeColor}`}>
              <Clock size={11} strokeWidth={3} />
              {recipe.prep_time}m
            </span>
            <span className="text-xs text-gray-400 capitalize">{recipe.category}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); setShowEdit(true); }}
            className="p-1.5 rounded-full text-gray-400 hover:text-sage-700 hover:bg-sage-100 transition-all"
            title="Edit recipe"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDelete(); }}
            disabled={isDeleting}
            className="p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-50"
            title="Delete recipe"
          >
            <Trash2 size={14} />
          </button>
          {expanded
            ? <ChevronUp size={16} className="text-gray-400 ml-1" />
            : <ChevronDown size={16} className="text-gray-400 ml-1" />
          }
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-gray-100 p-4 space-y-4">
          {recipe.one_sentence_summary && (
            <p className="text-sm text-gray-700 leading-relaxed">
              {recipe.one_sentence_summary}
            </p>
          )}

          {recipe.ingredients.length > 0 && (
            <div className="bg-sage-50 rounded-xl p-3">
              <h4 className="text-xs font-bold text-sage-800 mb-2 uppercase tracking-wide">Ingredients</h4>
              <ul className="space-y-1">
                {mainIngredients.map((ingredient, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-gray-800">
                    <span className="w-1.5 h-1.5 bg-sage-500 rounded-full flex-shrink-0"></span>
                    {ingredient}
                  </li>
                ))}
                {recipe.ingredients.length > 3 && (
                  <li className="text-xs text-gray-500 italic pl-3">
                    + {recipe.ingredients.length - 3} more
                  </li>
                )}
              </ul>
            </div>
          )}

          {recipe.staple_tags && recipe.staple_tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {recipe.staple_tags.map((tag, index) => (
                <span key={index} className="bg-warmOrange-100 text-warmOrange-800 px-2.5 py-0.5 rounded-full text-xs font-bold border border-warmOrange-300">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {recipe.steps && recipe.steps.length > 0 && (
            <div className="bg-blue-50 rounded-xl p-3">
              <h4 className="text-xs font-bold text-blue-800 mb-2 uppercase tracking-wide">Instructions</h4>
              <ol className="space-y-2">
                {recipe.steps.map((step, index) => (
                  <li key={index} className="flex gap-2 text-sm text-gray-800">
                    <span className="flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
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
              className="inline-flex items-center gap-1.5 text-sm text-warmOrange-600 hover:text-warmOrange-700 font-bold transition-all"
            >
              <ExternalLink size={15} />
              View Original
            </a>
          )}
        </div>
      )}

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
