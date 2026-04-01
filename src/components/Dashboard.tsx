import { useState, useEffect } from 'react';
import { ChefHat, Search, X, LogOut, Upload, SlidersHorizontal, Zap, ChefHat as ChefHatIcon } from 'lucide-react';
import { Leaf } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { LinkParser } from './LinkParser';
import { RecipeCard } from './RecipeCard';
import { Filters } from './Filters';
import { ImportModal } from './ImportModal';
import { ChatWidget } from './ChatWidget';
import { AboutModal } from './AboutModal';
import type { Recipe, Category, MealType } from '../types/recipe';

export function Dashboard({ isGuest, onAuthRequired }: { isGuest: boolean; onAuthRequired: () => void }) {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [panicFilter, setPanicFilter] = useState<string | null>(null);
  const [selectedStaples, setSelectedStaples] = useState<string[]>([]);
  const [vegetarianFilter, setVegetarianFilter] = useState(false);
  const [proteinTypeFilter, setProteinTypeFilter] = useState<string | null>(null);
  const [allergyFilters, setAllergyFilters] = useState<string[]>([]);
  const [mealTypeFilter, setMealTypeFilter] = useState<MealType | null>(null);
  const [customMealTypes, setCustomMealTypes] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [importData, setImportData] = useState<{ url: string; text: string; structured: any } | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  const fetchRecipes = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecipes(data || []);
    } catch (error) {
      console.error('Error fetching recipes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const importUrl = params.get('import_url') || params.get('url') || '';
    const importText = params.get('import_text') || params.get('text') || '';
    if (importUrl || importText) {
      setImportData({ url: importUrl, text: importText });
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const handleStapleToggle = (staple: string) => {
    setSelectedStaples((prev) =>
      prev.includes(staple)
        ? prev.filter((s) => s !== staple)
        : [...prev, staple]
    );
  };

  const filteredRecipes = recipes.filter((recipe) => {
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase().replace(/s$/, ''); // strip trailing 's' for basic stemming
      const searchText = [
        recipe.title,
        recipe.one_sentence_summary || '',
        ...(recipe.ingredients || []),
        ...(recipe.staple_tags || []),
        recipe.category,
        recipe.meal_type || '',
      ].join(' ').toLowerCase();
      if (!searchText.includes(q)) return false;
    }

    if (selectedCategory !== 'all' && recipe.category !== selectedCategory) {
      return false;
    }

    if (panicFilter === 'under-10' && recipe.prep_time > 10) {
      return false;
    }

    if (panicFilter === 'under-20' && recipe.prep_time > 20) {
      return false;
    }

    if (panicFilter === 'high-protein') {
      const proteinIngredients = ['eggs', 'chicken', 'yogurt', 'cheese', 'beans'];
      const hasProtein = recipe.staple_tags?.some((tag) =>
        proteinIngredients.includes(tag.toLowerCase())
      ) || recipe.ingredients.some((ing) =>
        proteinIngredients.some((protein) =>
          ing.toLowerCase().includes(protein)
        )
      );
      if (!hasProtein) {
        return false;
      }
    }

    if (vegetarianFilter) {
      const meatKeywords = ['chicken', 'beef', 'pork', 'fish', 'turkey', 'lamb', 'bacon', 'sausage', 'ham', 'shrimp', 'salmon', 'tuna', 'steak', 'meat'];
      const recipeText = [
        ...recipe.ingredients,
        ...(recipe.staple_tags || []),
        recipe.title
      ].join(' ').toLowerCase();

      const hasMeat = meatKeywords.some(keyword => recipeText.includes(keyword));
      if (hasMeat) {
        return false;
      }
    }

    if (proteinTypeFilter) {
      const recipeText = [
        ...recipe.ingredients,
        ...(recipe.staple_tags || []),
        recipe.title
      ].join(' ').toLowerCase();

      if (!recipeText.includes(proteinTypeFilter.toLowerCase())) {
        return false;
      }
    }

    if (mealTypeFilter) {
      if (recipe.meal_type !== mealTypeFilter) {
        return false;
      }
    }

    if (selectedStaples.length > 0) {
      const hasAllStaples = selectedStaples.every((staple) =>
        recipe.staple_tags?.some((tag) =>
          tag.toLowerCase() === staple.toLowerCase()
        ) || recipe.ingredients.some((ing) =>
          ing.toLowerCase().includes(staple.toLowerCase())
        )
      );
      if (!hasAllStaples) {
        return false;
      }
    }

    if (allergyFilters.length > 0) {
      const recipeText = [
        ...recipe.ingredients,
        ...(recipe.staple_tags || []),
        recipe.title
      ].join(' ').toLowerCase();

      for (const allergy of allergyFilters) {
        if (allergy === 'No Dairy') {
          const dairyKeywords = ['milk', 'cheese', 'butter', 'cream', 'yogurt', 'dairy', 'parmesan', 'mozzarella', 'cheddar', 'ghee', 'whey'];
          if (dairyKeywords.some(keyword => recipeText.includes(keyword))) {
            return false;
          }
        }
        if (allergy === 'No Gluten') {
          const glutenKeywords = ['bread', 'flour', 'pasta', 'wheat', 'gluten', 'noodle', 'tortilla', 'cracker', 'cereal', 'bagel', 'bun'];
          if (glutenKeywords.some(keyword => recipeText.includes(keyword))) {
            return false;
          }
        }
        if (allergy === 'No Nuts') {
          const nutKeywords = ['peanut', 'almond', 'walnut', 'cashew', 'pecan', 'hazelnut', 'pistachio', 'nut', 'peanut butter', 'almond butter'];
          if (nutKeywords.some(keyword => recipeText.includes(keyword))) {
            return false;
          }
        }
        if (allergy === 'No Eggs') {
          const eggKeywords = ['egg', 'eggs', 'scramble', 'omelet', 'omelette', 'frittata'];
          if (eggKeywords.some(keyword => recipeText.includes(keyword))) {
            return false;
          }
        }
      }
    }

    if (mealTypeFilter && recipe.meal_type !== mealTypeFilter) {
      return false;
    }

    return true;
  });

  const categories: { value: Category | 'all'; label: string; icon: string }[] = [
    { value: 'all', label: 'All Recipes', icon: '🍽️' },
    { value: 'breakfast', label: 'Breakfast', icon: '🌅' },
    { value: 'lunch', label: 'Lunch', icon: '☀️' },
    { value: 'dinner', label: 'Dinner', icon: '🌙' },
    { value: 'snacks', label: 'Snacks', icon: '🍪' },
  ];

  const activeFilterCount = [
    panicFilter,
    vegetarianFilter || null,
    proteinTypeFilter,
    ...allergyFilters,
    mealTypeFilter,
    ...selectedStaples,
    searchQuery ? 'search' : null,
    selectedCategory !== 'all' ? selectedCategory : null,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 to-warmOrange-50 pb-12">
      <div className="max-w-7xl mx-auto">
        <header className="text-center pt-8 pb-4 px-4">
          <div className="flex items-center justify-center gap-3 mb-2">
            <ChefHat size={48} className="text-sage-600" />
            <h1 className="text-4xl md:text-6xl font-black text-sage-800">
              Toddler Chef
            </h1>
          </div>
          <p className="text-xl text-sage-600 font-bold">
            Your toddler recipe collection, finally searchable.
          </p>
          <p className="text-sm text-gray-500 mt-1.5 max-w-sm mx-auto leading-relaxed">
            Import from Instagram, TikTok, or any recipe site. Filter by time, what's in your pantry, allergens, and more.
          </p>
          <button
            onClick={() => setShowAbout(true)}
            className="mt-2 text-xs text-sage-600 hover:text-sage-800 underline underline-offset-2 font-medium"
          >
            How does this work?
          </button>
          <div className="flex items-center justify-end px-4 mt-2 gap-3">
            {isGuest ? (
              <button
                onClick={onAuthRequired}
                className="flex items-center gap-1.5 text-sm font-semibold text-white bg-sage-600 hover:bg-sage-700 px-4 py-1.5 rounded-xl transition-colors"
              >
                Sign in / Register
              </button>
            ) : (
              <>
                <span className="text-sm text-sage-600">{user?.email}</span>
                <button
                  onClick={() => supabase.auth.signOut()}
                  className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500 transition-colors"
                >
                  <LogOut size={16} />
                  Sign out
                </button>
              </>
            )}
          </div>
        </header>

        <div className="px-4">
          {/* Action buttons */}
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={() => { if (isGuest) { onAuthRequired(); return; } setShowImport(v => !v); setShowFilters(false); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-sm transition-all shadow-sm ${
                showImport ? 'bg-warmOrange-500 text-white' : 'bg-white text-gray-600 hover:bg-warmOrange-50 border border-gray-200'
              }`}
            >
              <Upload size={15} />
              Import
            </button>
            <button
              onClick={() => { setShowFilters(v => !v); setShowImport(false); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-sm transition-all shadow-sm ${
                showFilters ? 'bg-sage-600 text-white' : 'bg-white text-gray-600 hover:bg-sage-50 border border-gray-200'
              }`}
            >
              <SlidersHorizontal size={15} />
              Filters
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 bg-warmOrange-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Import panel */}
          {showImport && (
            <div className="mb-4">
              <LinkParser onImportData={(data) => { setImportData(data); setShowImport(false); }} />
            </div>
          )}

          {/* Filter panel */}
          {showFilters && (
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 mb-4 space-y-4">

              {/* Search */}
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search recipes..."
                  className="w-full pl-9 pr-9 py-2 rounded-xl border border-gray-200 focus:border-sage-400 focus:outline-none text-sm text-gray-800 placeholder-gray-400"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Categories */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Category</p>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => setSelectedCategory(cat.value)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-semibold text-sm transition-all ${
                        selectedCategory === cat.value
                          ? 'bg-sage-600 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-600 hover:bg-sage-50'
                      }`}
                    >
                      <span>{cat.icon}</span>
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick filters */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Quick Filters</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'under-10', label: '⚡ Under 10 min', color: 'bg-green-500' },
                    { id: 'under-20', label: '🔥 Under 20 min', color: 'bg-warmOrange-500' },
                    { id: 'high-protein', label: '💪 High Protein', color: 'bg-sage-600' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setPanicFilter(panicFilter === f.id ? null : f.id)}
                      className={`px-3 py-1.5 rounded-xl font-semibold text-sm transition-all ${
                        panicFilter === f.id ? `${f.color} text-white shadow-sm` : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* All existing filters */}
              <Filters
                selectedIngredients={selectedStaples}
                vegetarianFilter={vegetarianFilter}
                proteinTypeFilter={proteinTypeFilter}
                allergyFilters={allergyFilters}
                mealTypeFilter={mealTypeFilter}
                customMealTypes={customMealTypes}
                onIngredientsChange={setSelectedStaples}
                onVegetarianFilterChange={setVegetarianFilter}
                onProteinTypeFilterChange={setProteinTypeFilter}
                onAllergyFiltersChange={setAllergyFilters}
                onMealTypeFilterChange={setMealTypeFilter}
                onCustomMealTypesChange={setCustomMealTypes}
              />

              {/* Clear all */}
              {activeFilterCount > 0 && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setPanicFilter(null);
                    setVegetarianFilter(false);
                    setProteinTypeFilter(null);
                    setAllergyFilters([]);
                    setMealTypeFilter(null);
                    setSelectedStaples([]);
                  }}
                  className="text-xs text-red-500 hover:text-red-700 font-semibold"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-sage-600 border-t-transparent"></div>
              <p className="mt-6 text-sage-600 font-bold text-xl">Loading your recipes...</p>
            </div>
          ) : filteredRecipes.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl shadow-xl border-2 border-gray-200">
              <p className="text-2xl text-gray-700 mb-3 font-bold">
                {recipes.length === 0 ? 'No recipes yet!' : 'No recipes match your filters'}
              </p>
              <p className="text-lg text-gray-500">
                {recipes.length === 0
                  ? 'Import your first recipe using the Import button above'
                  : 'Try adjusting your filters'}
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4 flex items-center gap-2">
                <p className="text-sm font-bold text-sage-700">
                  {filteredRecipes.length} recipe{filteredRecipes.length !== 1 ? 's' : ''}
                </p>
                {activeFilterCount > 0 && (
                  <span className="text-xs text-gray-400">· {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active</span>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {filteredRecipes.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} onUpdated={fetchRecipes} isGuest={isGuest} onAuthRequired={onAuthRequired} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      {importData && (
        <ImportModal
          importUrl={importData.url}
          importText={importData.text}
          structured={importData.structured}
          onComplete={() => { setImportData(null); fetchRecipes(); }}
          onDismiss={() => setImportData(null)}
        />
      )}
      <ChatWidget
        recipes={recipes}
        selectedStaples={selectedStaples}
        onImportRecipe={(data) => setImportData(data)}
        isGuest={isGuest}
        onAuthRequired={onAuthRequired}
      />
      {showAbout && <AboutModal onDismiss={() => setShowAbout(false)} />}
    </div>
  );
}
