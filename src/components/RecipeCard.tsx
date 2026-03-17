import { useState } from 'react';
import { Clock, ExternalLink, Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Recipe } from '../types/recipe';
import { EditRecipeModal } from './EditRecipeModal';

interface RecipeCardProps {
  recipe: Recipe;
  onUpdated: () => void;
}

const CATEGORY_STYLES: Record<string, { bar: string; emoji: string; label: string }> = {
  breakfast: { bar: 'bg-yellow-400',   emoji: '🌅', label: 'Breakfast' },
  lunch:     { bar: 'bg-sage-400',     emoji: '☀️', label: 'Lunch' },
  dinner:    { bar: 'bg-indigo-400',   emoji: '🌙', label: 'Dinner' },
  snacks:    { bar: 'bg-warmOrange-400', emoji: '🍪', label: 'Snacks' },
};

const TIME_COLOR = (mins: number) =>
  mins <= 10 ? 'bg-green-100 text-green-700' :
  mins <= 20 ? 'bg-orange-100 text-orange-700' :
               'bg-yellow-100 text-yellow-700';

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

  const cat = CATEGORY_STYLES[recipe.category] ?? CATEGORY_STYLES.dinner;
  const previewTags = (recipe.staple_tags ?? []).slice(0, 4);
  const mainIngredients = recipe.ingredients.slice(0, 4);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden">
      {/* Category colour bar */}
      <div className={`h-1 w-full ${cat.bar}`} />

      {/* Header row — always visible, click to expand */}
      <div
        className="flex items-center gap-3 px-4 pt-3 pb-2 cursor-pointer select-none"
        onClick={() => setExpanded(v => !v)}
      >
        <span className="text-2xl leading-none">{cat.emoji}</span>

        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 leading-snug truncate">{recipe.title}</h3>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${TIME_COLOR(recipe.prep_time)}`}>
              <Clock size={10} strokeWidth={3} />
              {recipe.prep_time}m
            </span>
            <span className="text-xs text-gray-400">{cat.label}</span>
            {recipe.difficulty_tier && (
              <span className="text-xs text-gray-400">· {recipe.difficulty_tier}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => setShowEdit(true)}
            className="p-1.5 rounded-full text-gray-300 hover:text-sage-600 hover:bg-sage-50 transition-all"
            title="Edit"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-1.5 rounded-full text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-40"
            title="Delete"
          >
            <Trash2 size={13} />
          </button>
        </div>

        <div className="text-gray-300 shrink-0" onClick={() => setExpanded(v => !v)}>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {/* Always-visible peek: summary + tags */}
      <div className="px-4 pb-3 cursor-pointer" onClick={() => setExpanded(v => !v)}>
        {recipe.one_sentence_summary && (
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-2">
            {recipe.one_sentence_summary}
          </p>
        )}
        {previewTags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {previewTags.map((tag, i) => (
              <span key={i} className="text-xs bg-warmOrange-50 text-warmOrange-700 border border-warmOrange-200 px-2 py-0.5 rounded-full font-medium">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-gray-50 px-4 py-3 space-y-3 bg-gray-50/50">
          {recipe.ingredients.length > 0 && (
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Ingredients</p>
              <ul className="space-y-1">
                {mainIngredients.map((ing, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-sage-400 shrink-0" />
                    {ing}
                  </li>
                ))}
                {recipe.ingredients.length > 4 && (
                  <li className="text-xs text-gray-400 italic pl-3.5">
                    + {recipe.ingredients.length - 4} more ingredients
                  </li>
                )}
              </ul>
            </div>
          )}

          {recipe.steps && recipe.steps.length > 0 && (
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Steps</p>
              <ol className="space-y-2">
                {recipe.steps.map((step, i) => (
                  <li key={i} className="flex gap-2 text-sm text-gray-700">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-bold">
                      {i + 1}
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
              className="inline-flex items-center gap-1.5 text-xs text-warmOrange-600 hover:text-warmOrange-700 font-semibold"
            >
              <ExternalLink size={13} />
              View original recipe
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
