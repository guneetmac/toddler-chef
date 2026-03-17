import { useState, useEffect } from 'react';
import { ChefHat, Search, X, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { LinkParser } from './LinkParser';
import { PanicButtons } from './PanicButtons';
import { PantryPulse } from './PantryPulse';
import { RecipeCard } from './RecipeCard';
import { Filters } from './Filters';
import { ImportModal } from './ImportModal';
import type { Recipe, Category, MealType } from '../types/recipe';

export function Dashboard() {
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
            Quick Recipes for Busy Parents
          </p>
          <div className="flex items-center justify-end px-4 mt-2 gap-3">
            <span className="text-sm text-sage-600">{user?.email}</span>
            <button
              onClick={() => supabase.auth.signOut()}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500 transition-colors"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </header>

        <PanicButtons
          activeFilter={panicFilter}
          onFilterChange={setPanicFilter}
        />

        <div className="px-4">
          <LinkParser
            onImportData={(data) => setImportData(data)}
          />

          <div className="relative mb-6 max-w-md mx-auto">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search recipes... (e.g. pancakes, chicken, pasta)"
              className="w-full pl-10 pr-10 py-3 rounded-2xl border-2 border-sage-200 focus:border-sage-500 focus:outline-none text-gray-800 placeholder-gray-400 bg-white shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="mb-8 flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`px-6 py-3 rounded-2xl font-bold text-lg transition-all shadow-md ${
                  selectedCategory === category.value
                    ? 'bg-sage-600 text-white shadow-lg scale-110'
                    : 'bg-white text-gray-700 hover:bg-sage-100'
                }`}
              >
                <span className="mr-2 text-2xl">{category.icon}</span>
                {category.label}
              </button>
            ))}
          </div>

          <Filters
            selectedIngredients={selectedStaples}
            vegetarianFilter={vegetarianFilter}
            proteinTypeFilter={proteinTypeFilter}
            allergyFilters={allergyFilters}
            mealTypeFilter={mealTypeFilter}
            customMealTypes={customMealTypes}
            onIngredientsChange={(ingredients) => {
              setSelectedStaples(ingredients);
            }}
            onVegetarianFilterChange={setVegetarianFilter}
            onProteinTypeFilterChange={setProteinTypeFilter}
            onAllergyFiltersChange={setAllergyFilters}
            onMealTypeFilterChange={setMealTypeFilter}
            onCustomMealTypesChange={setCustomMealTypes}
          />

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
                  ? 'Add your first recipe using the form above'
                  : 'Try adjusting your panic buttons or pantry selections'}
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6 text-center">
                <p className="text-lg font-bold text-sage-700">
                  {filteredRecipes.length} recipe{filteredRecipes.length !== 1 ? 's' : ''} found
                  {panicFilter && (
                    <span className="ml-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                      {panicFilter === 'under-10' && '⚡ 10min or less'}
                      {panicFilter === 'under-20' && '🔥 20min or less'}
                      {panicFilter === 'high-protein' && '💪 High Protein'}
                    </span>
                  )}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredRecipes.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
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
    </div>
  );
}
