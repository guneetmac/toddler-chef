import { useState } from 'react';
import { Clock, ExternalLink, Pencil, Trash2, ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Recipe } from '../types/recipe';
import { EditRecipeModal } from './EditRecipeModal';

interface RecipeCardProps {
  recipe: Recipe;
  onUpdated: () => void;
}

const CAT: Record<string, { bg: string; light: string; emoji: string; label: string }> = {
  breakfast: { bg: 'bg-amber-400',      light: 'bg-amber-50',   emoji: '🌅', label: 'Breakfast' },
  lunch:     { bg: 'bg-emerald-500',    light: 'bg-emerald-50', emoji: '☀️', label: 'Lunch' },
  dinner:    { bg: 'bg-violet-500',     light: 'bg-violet-50',  emoji: '🌙', label: 'Dinner' },
  snacks:    { bg: 'bg-orange-400',     light: 'bg-orange-50',  emoji: '🍪', label: 'Snacks' },
};

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

  const cat = CAT[recipe.category] ?? CAT.dinner;
  const tags = (recipe.staple_tags ?? []).slice(0, 3);

  return (
    <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-200/60 bg-stone-50 hover:shadow-md transition-shadow">

      {/* ── Main row ── */}
      <div className="flex items-stretch">

        {/* Left color tab */}
        <div
          className={`${cat.bg} w-14 flex flex-col items-center justify-center gap-1 shrink-0 cursor-pointer py-4`}
          onClick={() => setExpanded(v => !v)}
        >
          <span className="text-2xl leading-none">{cat.emoji}</span>
          <span className="text-white/80 text-[9px] font-bold uppercase tracking-wider rotate-0">
            {cat.label.slice(0, 3)}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 px-4 py-3 cursor-pointer" onClick={() => setExpanded(v => !v)}>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-gray-900 text-[15px] leading-snug flex-1 min-w-0">
              {recipe.title}
            </h3>
            <span className={`shrink-0 inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full mt-0.5 ${
              recipe.prep_time <= 10 ? 'bg-green-100 text-green-700' :
              recipe.prep_time <= 20 ? 'bg-amber-100 text-amber-700' :
              'bg-red-100 text-red-700'
            }`}>
              <Clock size={10} strokeWidth={3} />
              {recipe.prep_time}m
            </span>
          </div>

          {recipe.one_sentence_summary && (
            <p className="text-xs text-gray-400 leading-snug mt-1 line-clamp-1">
              {recipe.one_sentence_summary}
            </p>
          )}

          <div className="flex items-center justify-between mt-2">
            <div className="flex flex-wrap gap-1">
              {tags.map((tag, i) => (
                <span key={i} className={`text-xs font-medium px-2 py-0.5 rounded-full ${cat.light} text-gray-600`}>
                  {tag}
                </span>
              ))}
            </div>
            <ChevronDown
              size={15}
              className={`text-gray-300 shrink-0 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
            />
          </div>
        </div>
      </div>

      {/* ── Expanded panel ── */}
      {expanded && (
        <div className="border-t border-gray-200/60 bg-white px-4 py-4 space-y-4">

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setShowEdit(true)}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-sage-600 font-medium px-2.5 py-1.5 rounded-lg hover:bg-sage-50 transition-all"
            >
              <Pencil size={12} /> Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 font-medium px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition-all disabled:opacity-40"
            >
              <Trash2 size={12} /> Delete
            </button>
          </div>

          {/* Ingredients */}
          {recipe.ingredients.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Ingredients</p>
              <div className="flex flex-wrap gap-1.5">
                {recipe.ingredients.map((ing, i) => (
                  <span key={i} className="text-xs text-gray-700 bg-stone-100 border border-stone-200 px-2.5 py-1 rounded-full">
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
              <ol className="space-y-2.5">
                {recipe.steps.map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm text-gray-600">
                    <span className={`shrink-0 w-5 h-5 ${cat.bg} text-white rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5`}>
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
