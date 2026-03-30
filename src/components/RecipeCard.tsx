import { useState } from 'react';
import { Clock, ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Recipe } from '../types/recipe';
import { EditRecipeModal } from './EditRecipeModal';
import { RecipeDetailModal } from './RecipeDetailModal';

interface RecipeCardProps {
  recipe: Recipe;
  onUpdated: () => void;
  isGuest: boolean;
  onAuthRequired: () => void;
}

const CAT: Record<string, { bg: string; light: string; emoji: string; label: string }> = {
  breakfast: { bg: 'bg-amber-400',      light: 'bg-amber-50',   emoji: '🌅', label: 'Breakfast' },
  lunch:     { bg: 'bg-emerald-500',    light: 'bg-emerald-50', emoji: '☀️', label: 'Lunch' },
  dinner:    { bg: 'bg-violet-500',     light: 'bg-violet-50',  emoji: '🌙', label: 'Dinner' },
  snacks:    { bg: 'bg-orange-400',     light: 'bg-orange-50',  emoji: '🍪', label: 'Snacks' },
};

export function RecipeCard({ recipe, onUpdated, isGuest, onAuthRequired }: RecipeCardProps) {
  const [showDetail, setShowDetail] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Delete "${recipe.title}"?`)) return;
    setIsDeleting(true);
    await supabase.from('recipes').delete().eq('id', recipe.id);
    setShowDetail(false);
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
          onClick={() => setShowDetail(true)}
        >
          <span className="text-2xl leading-none">{cat.emoji}</span>
          <span className="text-white/80 text-[9px] font-bold uppercase tracking-wider rotate-0">
            {cat.label.slice(0, 3)}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 px-4 py-3 cursor-pointer" onClick={() => setShowDetail(true)}>
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
            <ChevronDown size={15} className="text-gray-300 shrink-0" />
          </div>
        </div>
      </div>

      {showDetail && (
        <RecipeDetailModal
          recipe={recipe}
          onDismiss={() => setShowDetail(false)}
          onEdit={() => { if (isGuest) { setShowDetail(false); onAuthRequired(); return; } setShowDetail(false); setShowEdit(true); }}
          onDelete={() => { if (isGuest) { setShowDetail(false); onAuthRequired(); return; } handleDelete(); }}
          isDeleting={isDeleting}
        />
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
