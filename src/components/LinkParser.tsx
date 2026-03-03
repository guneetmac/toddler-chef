import { useState } from 'react';
import { Link2, Plus, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { extractRecipe } from '../lib/recipeExtractor';
import type { Category } from '../types/recipe';

interface LinkParserProps {
  onRecipeAdded: () => void;
}

export function LinkParser({ onRecipeAdded }: LinkParserProps) {
  const [url, setUrl] = useState('');
  const [manualContent, setManualContent] = useState('');
  const [category, setCategory] = useState<Category>('breakfast');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  const fetchContentFromEdgeFunction = async (url: string): Promise<string> => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/scrape-instagram`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to scrape content');
      }

      const data = await response.json();
      console.log('Scraped content length:', data.content?.length);
      console.log('First 200 chars:', data.content?.substring(0, 200));

      if (data.success && data.content) {
        return data.content;
      }

      throw new Error(data.error || 'Failed to extract content');
    } catch (error) {
      console.error('Edge function error:', error);
      return `Recipe from ${url}\n\nIngredients:\n• Check the original post for details\n\nTime: 15 minutes`;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!url.trim()) {
      setError('Please enter a valid URL');
      return;
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      setError('Please enter a valid URL starting with http:// or https://');
      return;
    }

    setIsLoading(true);

    try {
      const scrapedContent = await fetchContentFromEdgeFunction(url);

      if (scrapedContent.includes('Check the original post for details')) {
        setError('Auto-scraping failed. Please use "Paste Text" to manually add the recipe.');
        setIsLoading(false);
        return;
      }

      const extracted = extractRecipe(url, scrapedContent, category);

      const { error: insertError } = await supabase
        .from('recipes')
        .insert([{
          title: extracted.recipe_name,
          url: extracted.source_url,
          prep_time: extracted.total_time_minutes,
          ingredients: extracted.ingredients.map(i => `${i.quantity} ${i.item}`),
          ingredients_with_quantities: extracted.ingredients,
          difficulty_tier: extracted.difficulty_tier,
          one_sentence_summary: extracted.one_sentence_summary,
          staple_tags: extracted.staple_tags,
          steps: extracted.steps,
          category
        }]);

      if (insertError) throw insertError;

      setUrl('');
      setManualContent('');
      setShowManualInput(false);
      onRecipeAdded();
    } catch (err) {
      setError('Failed to add recipe. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!manualContent.trim()) {
      setError('Please enter recipe content');
      return;
    }

    setIsLoading(true);

    try {
      const sourceUrl = url.trim() || `https://manual-entry.local/${Date.now()}`;

      const extracted = extractRecipe(sourceUrl, manualContent, category);

      const { error: insertError } = await supabase
        .from('recipes')
        .insert([{
          title: extracted.recipe_name,
          url: extracted.source_url,
          prep_time: extracted.total_time_minutes,
          ingredients: extracted.ingredients.map(i => `${i.quantity} ${i.item}`),
          ingredients_with_quantities: extracted.ingredients,
          difficulty_tier: extracted.difficulty_tier,
          one_sentence_summary: extracted.one_sentence_summary,
          staple_tags: extracted.staple_tags,
          steps: extracted.steps,
          category
        }]);

      if (insertError) throw insertError;

      setUrl('');
      setManualContent('');
      setShowManualInput(false);
      onRecipeAdded();
    } catch (err) {
      setError('Failed to add recipe. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border-2 border-sage-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Link2 className="text-sage-600" size={24} />
          <h2 className="text-2xl font-bold text-sage-800">Add Recipe</h2>
        </div>
        <button
          onClick={() => setShowManualInput(!showManualInput)}
          className="text-sm text-sage-600 hover:text-sage-800 flex items-center gap-1"
        >
          <FileText size={16} />
          {showManualInput ? 'Try Auto-Scrape' : 'Paste Text'}
        </button>
      </div>

      {showManualInput && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-900">
            <strong>Tip:</strong> Copy the recipe text from any website and paste it below. Include ingredients, instructions, and timing if available.
          </p>
        </div>
      )}

      {!showManualInput ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste recipe URL (Instagram, TikTok, AllRecipes, Food Network, etc.)"
              className="w-full px-4 py-3 rounded-lg border-2 border-sage-300 focus:border-sage-500 focus:outline-none text-gray-800 placeholder-gray-400"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="w-full px-4 py-3 rounded-lg border-2 border-sage-300 focus:border-sage-500 focus:outline-none text-gray-800"
              disabled={isLoading}
            >
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snacks">Snacks</option>
            </select>
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-warmOrange-500 hover:bg-warmOrange-600 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={20} />
            {isLoading ? 'Extracting Recipe...' : 'Save Recipe'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleManualSubmit} className="space-y-4">
          <div>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Recipe URL (optional)"
              className="w-full px-4 py-3 rounded-lg border-2 border-sage-300 focus:border-sage-500 focus:outline-none text-gray-800 placeholder-gray-400 mb-3"
              disabled={isLoading}
            />
            <textarea
              value={manualContent}
              onChange={(e) => setManualContent(e.target.value)}
              placeholder="Paste the recipe caption text here...&#10;&#10;Example:&#10;🍳 Veggie Scramble&#10;&#10;Ingredients:&#10;• 3 eggs&#10;• 1 cup spinach&#10;• 1/2 cup cheese&#10;&#10;Cook for 10 minutes..."
              className="w-full px-4 py-3 rounded-lg border-2 border-sage-300 focus:border-sage-500 focus:outline-none text-gray-800 placeholder-gray-400 min-h-48"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="w-full px-4 py-3 rounded-lg border-2 border-sage-300 focus:border-sage-500 focus:outline-none text-gray-800"
              disabled={isLoading}
            >
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snacks">Snacks</option>
            </select>
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-warmOrange-500 hover:bg-warmOrange-600 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={20} />
            {isLoading ? 'Extracting Recipe...' : 'Save Recipe'}
          </button>
        </form>
      )}

      <p className="text-xs text-gray-500 mt-3 text-center">
        Intelligent extraction: Automatically parses time, ingredients, and nutrition info
      </p>
    </div>
  );
}
