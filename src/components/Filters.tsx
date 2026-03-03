import { useState } from 'react';
import { Zap, ChevronDown, Leaf } from 'lucide-react';
import { COMMON_INGREDIENTS } from '../types/recipe';

interface FiltersProps {
  speedFilter: boolean;
  selectedIngredients: string[];
  vegetarianFilter: boolean;
  meatTypeFilter: string | null;
  onSpeedFilterChange: (value: boolean) => void;
  onIngredientsChange: (ingredients: string[]) => void;
  onVegetarianFilterChange: (value: boolean) => void;
  onMeatTypeFilterChange: (value: string | null) => void;
}

export function Filters({
  speedFilter,
  selectedIngredients,
  vegetarianFilter,
  meatTypeFilter,
  onSpeedFilterChange,
  onIngredientsChange,
  onVegetarianFilterChange,
  onMeatTypeFilterChange,
}: FiltersProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMeatDropdownOpen, setIsMeatDropdownOpen] = useState(false);

  const meatTypes = ['Chicken', 'Beef', 'Pork', 'Fish', 'Turkey', 'Lamb'];

  const handleIngredientToggle = (ingredient: string) => {
    if (selectedIngredients.includes(ingredient)) {
      onIngredientsChange(selectedIngredients.filter((i) => i !== ingredient));
    } else {
      onIngredientsChange([...selectedIngredients, ingredient]);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-4 mb-6 border-2 border-gray-100">
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => onSpeedFilterChange(!speedFilter)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
            speedFilter
              ? 'bg-green-500 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Zap size={18} />
          Under 15 Minutes
        </button>

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
                onClick={() => {
                  onMeatTypeFilterChange(null);
                  setIsMeatDropdownOpen(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm text-gray-700"
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
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-xl z-10 p-3 max-h-64 overflow-y-auto">
              <div className="space-y-2">
                {COMMON_INGREDIENTS.map((ingredient) => (
                  <label
                    key={ingredient}
                    className="flex items-center gap-2 p-2 hover:bg-sage-50 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedIngredients.includes(ingredient)}
                      onChange={() => handleIngredientToggle(ingredient)}
                      className="w-4 h-4 text-sage-600 rounded focus:ring-sage-500"
                    />
                    <span className="text-sm text-gray-700">{ingredient}</span>
                  </label>
                ))}
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
