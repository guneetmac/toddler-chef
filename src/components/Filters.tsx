import { useState } from 'react';
import { ChevronDown, Leaf, AlertCircle, Plus, X } from 'lucide-react';
import { COMMON_INGREDIENTS } from '../types/recipe';

interface FiltersProps {
  selectedIngredients: string[];
  vegetarianFilter: boolean;
  meatTypeFilter: string | null;
  allergyFilters: string[];
  onIngredientsChange: (ingredients: string[]) => void;
  onVegetarianFilterChange: (value: boolean) => void;
  onMeatTypeFilterChange: (value: string | null) => void;
  onAllergyFiltersChange: (filters: string[]) => void;
}

export function Filters({
  selectedIngredients,
  vegetarianFilter,
  meatTypeFilter,
  allergyFilters,
  onIngredientsChange,
  onVegetarianFilterChange,
  onMeatTypeFilterChange,
  onAllergyFiltersChange,
}: FiltersProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMeatDropdownOpen, setIsMeatDropdownOpen] = useState(false);
  const [isAllergyDropdownOpen, setIsAllergyDropdownOpen] = useState(false);
  const [customIngredients, setCustomIngredients] = useState<string[]>([]);
  const [newIngredient, setNewIngredient] = useState('');
  const [showAddInput, setShowAddInput] = useState(false);

  const meatTypes = ['Chicken', 'Beef', 'Pork', 'Fish', 'Turkey', 'Lamb'];
  const allergyOptions = ['No Dairy', 'No Gluten', 'No Nuts', 'No Eggs'];

  const allIngredients = [...COMMON_INGREDIENTS, ...customIngredients];

  const handleIngredientToggle = (ingredient: string) => {
    if (selectedIngredients.includes(ingredient)) {
      onIngredientsChange(selectedIngredients.filter((i) => i !== ingredient));
    } else {
      onIngredientsChange([...selectedIngredients, ingredient]);
    }
  };

  const handleAllergyToggle = (allergy: string) => {
    if (allergyFilters.includes(allergy)) {
      onAllergyFiltersChange(allergyFilters.filter((a) => a !== allergy));
    } else {
      onAllergyFiltersChange([...allergyFilters, allergy]);
    }
  };

  const handleAddIngredient = () => {
    const trimmedIngredient = newIngredient.trim();
    if (trimmedIngredient && !allIngredients.includes(trimmedIngredient)) {
      setCustomIngredients([...customIngredients, trimmedIngredient]);
      setNewIngredient('');
      setShowAddInput(false);
    }
  };

  const handleDeleteCustomIngredient = (ingredient: string) => {
    setCustomIngredients(customIngredients.filter((i) => i !== ingredient));
    if (selectedIngredients.includes(ingredient)) {
      onIngredientsChange(selectedIngredients.filter((i) => i !== ingredient));
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-4 mb-6 border-2 border-gray-100">
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => {
            onVegetarianFilterChange(!vegetarianFilter);
            if (!vegetarianFilter && meatTypeFilter) {
              onMeatTypeFilterChange(null);
            }
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
            vegetarianFilter
              ? 'bg-green-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Leaf size={18} />
          Vegetarian
        </button>

        <div className="relative">
          <button
            onClick={() => !vegetarianFilter && setIsMeatDropdownOpen(!isMeatDropdownOpen)}
            disabled={vegetarianFilter}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
              vegetarianFilter
                ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                : meatTypeFilter
                ? 'bg-orange-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span>
              {meatTypeFilter || 'Meat Type'}
            </span>
            <ChevronDown
              size={16}
              className={`transition-transform ${isMeatDropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {isMeatDropdownOpen && !vegetarianFilter && (
            <div className="absolute top-full left-0 mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-xl z-10 p-2 min-w-[150px]">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMeatTypeFilterChange(null);
                  setIsMeatDropdownOpen(false);
                }}
                className={`w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm ${
                  meatTypeFilter === null
                    ? 'bg-gray-100 text-gray-900 font-semibold'
                    : 'text-gray-700'
                }`}
              >
                All Meats
              </button>
              {meatTypes.map((meat) => (
                <button
                  key={meat}
                  onClick={() => {
                    onMeatTypeFilterChange(meat);
                    setIsMeatDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 hover:bg-orange-50 rounded text-sm ${
                    meatTypeFilter === meat
                      ? 'bg-orange-100 text-orange-700 font-semibold'
                      : 'text-gray-700'
                  }`}
                >
                  {meat}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setIsAllergyDropdownOpen(!isAllergyDropdownOpen)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
              allergyFilters.length > 0
                ? 'bg-red-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <AlertCircle size={18} />
            <span>
              Allergies
              {allergyFilters.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-red-600 text-white text-xs rounded-full">
                  {allergyFilters.length}
                </span>
              )}
            </span>
            <ChevronDown
              size={16}
              className={`transition-transform ${isAllergyDropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {isAllergyDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-xl z-10 p-3 min-w-[180px]">
              <div className="space-y-2">
                {allergyOptions.map((allergy) => (
                  <label
                    key={allergy}
                    className="flex items-center gap-2 p-2 hover:bg-red-50 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={allergyFilters.includes(allergy)}
                      onChange={() => handleAllergyToggle(allergy)}
                      className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700">{allergy}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="relative flex-1">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center justify-between px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold text-gray-700 transition-colors"
          >
            <span>
              Pantry Filter
              {selectedIngredients.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-sage-500 text-white text-xs rounded-full">
                  {selectedIngredients.length}
                </span>
              )}
            </span>
            <ChevronDown
              size={18}
              className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-xl z-10 p-3 max-h-80 overflow-y-auto">
              <div className="mb-3 pb-3 border-b border-gray-200">
                {showAddInput ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newIngredient}
                      onChange={(e) => setNewIngredient(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddIngredient()}
                      placeholder="Add custom ingredient..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sage-500"
                      autoFocus
                    />
                    <button
                      onClick={handleAddIngredient}
                      className="px-3 py-2 bg-sage-600 text-white rounded-lg hover:bg-sage-700 transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setShowAddInput(false);
                        setNewIngredient('');
                      }}
                      className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAddInput(true)}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-sage-50 text-sage-700 rounded-lg hover:bg-sage-100 transition-colors font-medium text-sm"
                  >
                    <Plus size={16} />
                    Add Custom Ingredient
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {allIngredients.map((ingredient) => {
                  const isCustom = customIngredients.includes(ingredient);
                  return (
                    <div
                      key={ingredient}
                      className="flex items-center gap-2 group"
                    >
                      <label className="flex items-center gap-2 p-2 hover:bg-sage-50 rounded cursor-pointer flex-1">
                        <input
                          type="checkbox"
                          checked={selectedIngredients.includes(ingredient)}
                          onChange={() => handleIngredientToggle(ingredient)}
                          className="w-4 h-4 text-sage-600 rounded focus:ring-sage-500"
                        />
                        <span className="text-sm text-gray-700">{ingredient}</span>
                      </label>
                      {isCustom && (
                        <button
                          onClick={() => handleDeleteCustomIngredient(ingredient)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                          title="Delete custom ingredient"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedIngredients.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {selectedIngredients.map((ingredient) => (
            <span
              key={ingredient}
              className="inline-flex items-center gap-1 bg-sage-100 text-sage-700 px-3 py-1 rounded-full text-sm border border-sage-300"
            >
              {ingredient}
              <button
                onClick={() => handleIngredientToggle(ingredient)}
                className="hover:text-sage-900"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
