import { X, Clock, ExternalLink, Pencil, Trash2 } from 'lucide-react';
import type { Recipe } from '../types/recipe';

const CAT: Record<string, { bg: string; light: string; emoji: string; label: string }> = {
  breakfast: { bg: 'bg-amber-400',   light: 'bg-amber-50',   emoji: '🌅', label: 'Breakfast' },
  lunch:     { bg: 'bg-emerald-500', light: 'bg-emerald-50', emoji: '☀️', label: 'Lunch' },
  dinner:    { bg: 'bg-violet-500',  light: 'bg-violet-50',  emoji: '🌙', label: 'Dinner' },
  snacks:    { bg: 'bg-orange-400',  light: 'bg-orange-50',  emoji: '🍪', label: 'Snacks' },
};

interface RecipeDetailModalProps {
  recipe: Recipe;
  onDismiss: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

export function RecipeDetailModal({ recipe, onDismiss, onEdit, onDelete, isDeleting }: RecipeDetailModalProps) {
  const cat = CAT[recipe.category] ?? CAT.dinner;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 py-6">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className={`${cat.bg} px-6 py-5 flex items-start justify-between gap-4 shrink-0`}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{cat.emoji}</span>
              <span className="text-white/80 text-xs font-bold uppercase tracking-wider">{cat.label}</span>
            </div>
            <h2 className="text-white font-black text-xl leading-snug">{recipe.title}</h2>
            {recipe.one_sentence_summary && (
              <p className="text-white/75 text-sm mt-1 leading-snug">{recipe.one_sentence_summary}</p>
            )}
          </div>
          <button onClick={onDismiss} className="text-white/70 hover:text-white shrink-0 mt-1">
            <X size={22} />
          </button>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-3 px-6 py-3 border-b border-gray-100 shrink-0">
          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full ${
            recipe.prep_time <= 10 ? 'bg-green-100 text-green-700' :
            recipe.prep_time <= 20 ? 'bg-amber-100 text-amber-700' :
            'bg-red-100 text-red-700'
          }`}>
            <Clock size={11} strokeWidth={3} />
            {recipe.prep_time} min
          </span>
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${cat.light} text-gray-600`}>
            {recipe.difficulty_tier}
          </span>
          {(recipe.staple_tags ?? []).slice(0, 3).map((tag, i) => (
            <span key={i} className="text-xs px-2 py-1 rounded-full bg-stone-100 text-gray-500">
              {tag}
            </span>
          ))}
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">

          {/* Ingredients */}
          {recipe.ingredients.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Ingredients</p>
              <div className="flex flex-wrap gap-1.5">
                {recipe.ingredients.map((ing, i) => (
                  <span key={i} className="text-sm text-gray-700 bg-stone-100 border border-stone-200 px-3 py-1 rounded-full">
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Steps */}
          {recipe.steps && recipe.steps.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">How to make</p>
              <ol className="space-y-3">
                {recipe.steps.map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm text-gray-600">
                    <span className={`shrink-0 w-6 h-6 ${cat.bg} text-white rounded-full flex items-center justify-center text-[11px] font-bold mt-0.5`}>
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Source link */}
          {recipe.url &&
           !recipe.url.includes('manual-entry.local') &&
           !recipe.url.includes('toddlerchef.app') && (
            <a
              href={recipe.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-warmOrange-500 hover:text-warmOrange-600"
            >
              <ExternalLink size={12} />
              View original recipe
            </a>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-2 px-6 py-3 border-t border-gray-100 shrink-0">
          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-sage-600 font-medium px-3 py-2 rounded-xl hover:bg-sage-50 transition-all"
          >
            <Pencil size={14} /> Edit
          </button>
          <button
            onClick={onDelete}
            disabled={isDeleting}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 font-medium px-3 py-2 rounded-xl hover:bg-red-50 transition-all disabled:opacity-40"
          >
            <Trash2 size={14} /> {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
