import { useState } from 'react';
import { Clock, ExternalLink, Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Recipe } from '../types/recipe';
import { EditRecipeModal } from './EditRecipeModal';

interface RecipeCardProps {
  recipe: Recipe;
  onUpdated: () => void;
}

const CATEGORY: Record<string, { emoji: string; gradient: string; accent: string; label: string }> = {
  breakfast: { emoji: '🌅', gradient: 'from-amber-50 to-yellow-100',   accent: 'bg-amber-400',   label: 'Breakfast' },
  lunch:     { emoji: '☀️', gradient: 'from-emerald-50 to-teal-100',   accent: 'bg-emerald-400', label: 'Lunch' },
  dinner:    { emoji: '🌙', gradient: 'from-violet-50 to-indigo-100',   accent: 'bg-violet-400',  label: 'Dinner' },
  snacks:    { emoji: '🍪', gradient: 'from-orange-50 to-warmOrange-100', accent: 'bg-orange-400', label: 'Snacks' },
};

const TIME_PILL = (m: number) =>
  m <= 10 ? 'bg-green-100 text-green-700' :
  m <= 20 ? 'bg-amber-100 text-amber-700' :
            'bg-red-100 text-red-600';

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

  const cat = CATEGORY[recipe.category] ?? CATEGORY.dinner;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-200 overflow-hidden group">

      {/* ── Coloured header ── */}
      <div
        className={`bg-gradient-to-br ${cat.gradient} px-4 pt-4 pb-3 cursor-pointer`}
        onClick={() => setExpanded(v => !v)}
      >
        {/* Top row: emoji + actions */}
        <div className="flex items-start justify-between mb-2">
          <span className="text-3xl leading-none">{cat.emoji}</span>
          <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setShowEdit(true)}
              className="p-1.5 rounded-full bg-white/60 hover:bg-white text-gray-400 hover:text-sage-600 transition-all opacity-0 group-hover:opacity-100"
            >
              <Pencil size={13} />
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-1.5 rounded-full bg-white/60 hover:bg-white text-gray-400 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-30"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-black text-gray-900 text-lg leading-snug mb-2">
          {recipe.title}
        </h3>

        {/* Pills row */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${TIME_PILL(recipe.prep_time)}`}>
            <Clock size={11} strokeWidth={3} />
            {recipe.prep_time} min
          </span>
          <span className="text-xs font-medium text-gray-500 bg-white/70 px-2.5 py-1 rounded-full">
            {cat.label}
          </span>
          {recipe.difficulty_tier && (
            <span className="text-xs font-medium text-gray-500 bg-white/70 px-2.5 py-1 rounded-full">
              {recipe.difficulty_tier}
            </span>
          )}
        </div>
      </div>

      {/* ── Always-visible preview ── */}
      <div
        className="px-4 py-3 cursor-pointer"
        onClick={() => setExpanded(v => !v)}
      >
        {recipe.one_sentence_summary ? (
          <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-2">
            {recipe.one_sentence_summary}
          </p>
        ) : recipe.ingredients.length > 0 ? (
          <p className="text-sm text-gray-500 mb-2">
            {recipe.ingredients.slice(0, 3).join(' · ')}
            {recipe.ingredients.length > 3 && <span className="text-gray-400"> +{recipe.ingredients.length - 3} more</span>}
          </p>
        ) : null}

        {/* Staple tags */}
        {(recipe.staple_tags ?? []).length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {recipe.staple_tags.slice(0, 4).map((tag, i) => (
              <span key={i} className={`text-xs font-medium px-2 py-0.5 rounded-full ${cat.accent} bg-opacity-10 text-gray-600 border border-black/5`}>
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Expand toggle */}
        <div className="flex items-center gap-1 text-xs text-gray-400 font-medium">
          {expanded
            ? <><ChevronUp size={14} /> Hide details</>
            : <><ChevronDown size={14} /> Show details</>
          }
        </div>
      </div>

      {/* ── Expanded details ── */}
      {expanded && (
        <div className="border-t border-gray-100 px-4 py-4 space-y-4 bg-gray-50/40">

          {recipe.ingredients.length > 0 && (
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Ingredients</p>
              <div className="flex flex-wrap gap-1.5">
                {recipe.ingredients.map((ing, i) => (
                  <span key={i} className="text-xs bg-white border border-gray-200 text-gray-700 px-2.5 py-1 rounded-full shadow-sm">
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          )}

          {recipe.steps && recipe.steps.length > 0 && (
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">How to make it</p>
              <ol className="space-y-2.5">
                {recipe.steps.map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm text-gray-700">
                    <span className={`shrink-0 w-5 h-5 rounded-full ${cat.accent} text-white flex items-center justify-center text-xs font-bold`}>
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
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-warmOrange-600 hover:text-warmOrange-700"
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
