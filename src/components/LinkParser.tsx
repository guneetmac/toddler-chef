import { useState } from 'react';
import { Link2, Plus, FileText, Bookmark, Smartphone, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { extractRecipe } from '../lib/recipeExtractor';
import type { Category, MealType } from '../types/recipe';

interface LinkParserProps {
  onRecipeAdded: () => void;
  onImportData: (data: { url: string; text: string }) => void;
  customMealTypes: string[];
}

const BOOKMARKLET = `javascript:(function(){var u=location.href;var t='';try{var selectors=['h1._ap3a','div._a9zs span','div[class*="x1lliihq"] span','span[class*="x193iq5w"]','[data-e2e="browse-video-desc"]','[data-e2e="video-desc"]'];for(var i=0;i<selectors.length;i++){var el=document.querySelector(selectors[i]);if(el&&el.innerText&&el.innerText.length>20){t=el.innerText;break;}}if(!t){var spans=document.querySelectorAll('span');var best='';for(var j=0;j<spans.length;j++){var txt=spans[j].innerText||'';if(txt.length>best.length&&txt.length<3000&&!txt.includes('Follow')&&!txt.includes('following')){best=txt;}}t=best;}}catch(e){}var base='https://toddlerchef.netlify.app';window.open(base+'?import_url='+encodeURIComponent(u)+'&import_text='+encodeURIComponent(t),'_blank');})();`;

type MainTab = 'add' | 'import';
type ImportTab = 'url' | 'bookmarklet' | 'mobile';

export function LinkParser({ onRecipeAdded, onImportData, customMealTypes }: LinkParserProps) {
  const [mainTab, setMainTab] = useState<MainTab>('add');
  const [importTab, setImportTab] = useState<ImportTab>('url');

  // Add tab state
  const [url, setUrl] = useState('');
  const [manualContent, setManualContent] = useState('');
  const [category, setCategory] = useState<Category>('breakfast');
  const [mealType, setMealType] = useState<MealType | ''>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  // Import tab state
  const [importUrl, setImportUrl] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeError, setScrapeError] = useState('');
  const [bookmarkletCopied, setBookmarkletCopied] = useState(false);

  const defaultMealTypes: MealType[] = ['pasta', 'pancakes', 'muffins', 'curries', 'paratha'];
  const allMealTypes = [...defaultMealTypes, ...customMealTypes];

  const fetchContent = async (urlToFetch: string): Promise<string> => {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/scrape-instagram`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: urlToFetch }),
      }
    );
    if (!response.ok) throw new Error(`Failed to scrape: ${response.status}`);
    const data = await response.json();
    if (data.success && data.content) return data.content;
    throw new Error(data.error || 'Failed to extract content');
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!url.trim()) { setError('Please enter a valid URL'); return; }
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      setError('Please enter a valid URL starting with http:// or https://');
      return;
    }
    setIsLoading(true);
    try {
      const scrapedContent = await fetchContent(url);
      const extracted = extractRecipe(url, scrapedContent, category);
      const { error: insertError } = await supabase.from('recipes').insert([{
        title: extracted.recipe_name,
        url: extracted.source_url,
        prep_time: extracted.total_time_minutes,
        ingredients: extracted.ingredients.map(i => `${i.quantity} ${i.item}`),
        ingredients_with_quantities: extracted.ingredients,
        difficulty_tier: extracted.difficulty_tier,
        one_sentence_summary: extracted.one_sentence_summary,
        staple_tags: extracted.staple_tags,
        steps: extracted.steps,
        category,
        meal_type: mealType || null,
      }]);
      if (insertError) throw insertError;
      setUrl(''); setManualContent(''); setMealType(''); setShowManualInput(false);
      onRecipeAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add recipe. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!manualContent.trim()) { setError('Please enter recipe content'); return; }
    setIsLoading(true);
    try {
      const sourceUrl = url.trim() || `https://manual-entry.local/${Date.now()}`;
      const extracted = extractRecipe(sourceUrl, manualContent, category);
      const { error: insertError } = await supabase.from('recipes').insert([{
        title: extracted.recipe_name,
        url: extracted.source_url,
        prep_time: extracted.total_time_minutes,
        ingredients: extracted.ingredients.map(i => `${i.quantity} ${i.item}`),
        ingredients_with_quantities: extracted.ingredients,
        difficulty_tier: extracted.difficulty_tier,
        one_sentence_summary: extracted.one_sentence_summary,
        staple_tags: extracted.staple_tags,
        steps: extracted.steps,
        category,
        meal_type: mealType || null,
      }]);
      if (insertError) throw insertError;
      setUrl(''); setManualContent(''); setMealType(''); setShowManualInput(false);
      onRecipeAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add recipe. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportUrl = async () => {
    const trimmed = importUrl.trim();
    if (!trimmed || (!trimmed.startsWith('http://') && !trimmed.startsWith('https://'))) {
      setScrapeError('Please enter a valid URL starting with https://');
      return;
    }
    setIsScraping(true);
    setScrapeError('');
    try {
      const content = await fetchContent(trimmed);
      onImportData({ url: trimmed, text: content });
      setImportUrl('');
    } catch (err) {
      setScrapeError(err instanceof Error ? err.message : 'Failed to fetch recipe. Try the bookmarklet or paste text manually.');
    } finally {
      setIsScraping(false);
    }
  };

  const handleCopyBookmarklet = () => {
    navigator.clipboard.writeText(BOOKMARKLET);
    setBookmarkletCopied(true);
    setTimeout(() => setBookmarkletCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-sage-200 mb-8 overflow-hidden">
      {/* Main tabs */}
      <div className="flex border-b border-gray-100">
        <button
          onClick={() => setMainTab('add')}
          className={`flex-1 py-4 font-bold text-sm transition-all ${mainTab === 'add' ? 'text-sage-800 border-b-2 border-sage-600 bg-sage-50' : 'text-gray-500 hover:text-gray-700'}`}
        >
          + Add Recipe
        </button>
        <button
          onClick={() => setMainTab('import')}
          className={`flex-1 py-4 font-bold text-sm transition-all ${mainTab === 'import' ? 'text-sage-800 border-b-2 border-sage-600 bg-sage-50' : 'text-gray-500 hover:text-gray-700'}`}
        >
          ↓ Import Recipe
        </button>
      </div>

      <div className="p-6">
        {/* ── ADD TAB ── */}
        {mainTab === 'add' && (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Link2 className="text-sage-600" size={20} />
                <span className="font-bold text-sage-800">Paste a URL to auto-extract</span>
              </div>
              <button
                onClick={() => setShowManualInput(!showManualInput)}
                className="text-sm text-sage-600 hover:text-sage-800 flex items-center gap-1"
              >
                <FileText size={15} />
                {showManualInput ? 'Auto-extract' : 'Paste text'}
              </button>
            </div>

            {showManualInput && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-900">
                  <strong>Tip:</strong> Copy the recipe text from any page and paste it below.
                </p>
              </div>
            )}

            {!showManualInput ? (
              <form onSubmit={handleAddSubmit} className="space-y-4">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://feedingtinybellies.com/mac-and-cheese-muffins/"
                  className="w-full px-4 py-3 rounded-lg border-2 border-sage-300 focus:border-sage-500 focus:outline-none text-gray-800 placeholder-gray-400"
                  disabled={isLoading}
                />
                <CategoryMealRow
                  category={category} setCategory={setCategory}
                  mealType={mealType} setMealType={setMealType}
                  allMealTypes={allMealTypes} disabled={isLoading}
                />
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-warmOrange-500 hover:bg-warmOrange-600 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus size={18} />
                  {isLoading ? 'Extracting Recipe...' : 'Save Recipe'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Recipe URL (optional)"
                  className="w-full px-4 py-3 rounded-lg border-2 border-sage-300 focus:border-sage-500 focus:outline-none text-gray-800 placeholder-gray-400"
                  disabled={isLoading}
                />
                <textarea
                  value={manualContent}
                  onChange={(e) => setManualContent(e.target.value)}
                  placeholder={"Paste the recipe text here...\n\nExample:\n🍳 Veggie Scramble\n\nIngredients:\n• 3 eggs\n• 1 cup spinach\n\nCook for 10 minutes..."}
                  className="w-full px-4 py-3 rounded-lg border-2 border-sage-300 focus:border-sage-500 focus:outline-none text-gray-800 placeholder-gray-400 min-h-40"
                  disabled={isLoading}
                />
                <CategoryMealRow
                  category={category} setCategory={setCategory}
                  mealType={mealType} setMealType={setMealType}
                  allMealTypes={allMealTypes} disabled={isLoading}
                />
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-warmOrange-500 hover:bg-warmOrange-600 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus size={18} />
                  {isLoading ? 'Saving...' : 'Save Recipe'}
                </button>
              </form>
            )}
          </>
        )}

        {/* ── IMPORT TAB ── */}
        {mainTab === 'import' && (
          <>
            {/* Import sub-tabs */}
            <div className="flex bg-gray-100 rounded-xl p-1 mb-5">
              <button
                onClick={() => setImportTab('url')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg font-bold text-sm transition-all ${importTab === 'url' ? 'bg-white text-sage-800 shadow-sm' : 'text-gray-500'}`}
              >
                <Link2 size={14} />
                Paste URL
              </button>
              <button
                onClick={() => setImportTab('bookmarklet')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg font-bold text-sm transition-all ${importTab === 'bookmarklet' ? 'bg-white text-sage-800 shadow-sm' : 'text-gray-500'}`}
              >
                <Bookmark size={14} />
                Bookmarklet
              </button>
              <button
                onClick={() => setImportTab('mobile')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg font-bold text-sm transition-all ${importTab === 'mobile' ? 'bg-white text-sage-800 shadow-sm' : 'text-gray-500'}`}
              >
                <Smartphone size={14} />
                Mobile
              </button>
            </div>

            {importTab === 'url' && (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Paste any recipe URL — works with recipe blogs, Instagram, TikTok, Patreon, and more. You'll get a chance to review the title and category before saving.
                </p>
                <input
                  type="url"
                  value={importUrl}
                  onChange={(e) => { setImportUrl(e.target.value); setScrapeError(''); }}
                  onKeyDown={(e) => e.key === 'Enter' && handleImportUrl()}
                  placeholder="https://feedingtinybellies.com/mac-and-cheese-muffins/"
                  className="w-full px-4 py-3 rounded-xl border-2 border-sage-200 focus:border-sage-500 focus:outline-none text-gray-800 text-sm placeholder-gray-400"
                  disabled={isScraping}
                />
                {scrapeError && <p className="text-red-500 text-sm">{scrapeError}</p>}
                <button
                  onClick={handleImportUrl}
                  disabled={isScraping || !importUrl.trim()}
                  className="w-full flex items-center justify-center gap-2 bg-warmOrange-500 hover:bg-warmOrange-600 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isScraping ? (
                    <><Loader2 size={18} className="animate-spin" />Fetching recipe...</>
                  ) : (
                    <><Link2 size={18} />Import Recipe</>
                  )}
                </button>
                <p className="text-xs text-gray-400 text-center">
                  Sites requiring login (Instagram, Patreon) — use the Bookmarklet tab instead.
                </p>
              </div>
            )}

            {importTab === 'bookmarklet' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Save the bookmarklet once, then click it on any Instagram, TikTok, or recipe page to import instantly.
                </p>
                <Step number={1} title="Save the bookmarklet">
                  <p className="text-sm text-gray-600 mb-3">
                    Drag the button below to your browser's bookmarks bar. No bar? Press <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">Ctrl+Shift+B</kbd>.
                  </p>
                  <div className="flex gap-2">
                    <a
                      href={BOOKMARKLET}
                      className="flex items-center gap-2 px-4 py-2 bg-warmOrange-500 text-white rounded-xl font-bold text-sm cursor-grab active:cursor-grabbing"
                      onClick={(e) => e.preventDefault()}
                      draggable
                    >
                      <Bookmark size={15} />
                      Save to Toddler Chef
                    </a>
                    <button
                      onClick={handleCopyBookmarklet}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors"
                    >
                      {bookmarkletCopied ? '✓ Copied!' : 'Copy code'}
                    </button>
                  </div>
                </Step>
                <Step number={2} title="Go to any recipe page">
                  <p className="text-sm text-gray-600">Navigate to an Instagram post, TikTok video, or any recipe website.</p>
                </Step>
                <Step number={3} title="Click the bookmarklet">
                  <p className="text-sm text-gray-600">Click <strong>"Save to Toddler Chef"</strong> in your bookmarks bar. Toddler Chef will open with the recipe pre-filled.</p>
                </Step>
                <Step number={4} title="Confirm and save">
                  <p className="text-sm text-gray-600">Review the title and category, change if needed, then hit <strong>Save Recipe</strong>.</p>
                </Step>
              </div>
            )}

            {importTab === 'mobile' && (
              <div className="space-y-4">
                <Step number={1} title="Install Toddler Chef on your phone">
                  <p className="text-sm text-gray-600 mb-1">Open <strong>toddlerchef.netlify.app</strong> in Chrome (Android) or Safari (iPhone).</p>
                  <p className="text-sm text-gray-600">Tap the menu → <strong>"Add to Home Screen"</strong> → <strong>Add</strong>.</p>
                </Step>
                <Step number={2} title="Find a recipe on Instagram or TikTok">
                  <p className="text-sm text-gray-600">Open any recipe post in the Instagram or TikTok app.</p>
                </Step>
                <Step number={3} title="Tap Share → Toddler Chef">
                  <p className="text-sm text-gray-600">
                    Tap the <strong>Share</strong> button, then select <strong>Toddler Chef</strong> from the share sheet.
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Works on Android. On iPhone, copy the link and use the Paste URL tab instead.</p>
                </Step>
                <Step number={4} title="Confirm and save">
                  <p className="text-sm text-gray-600">The app opens with the recipe pre-filled. Check the category and hit <strong>Save Recipe</strong>.</p>
                </Step>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function CategoryMealRow({
  category, setCategory, mealType, setMealType, allMealTypes, disabled
}: {
  category: Category;
  setCategory: (c: Category) => void;
  mealType: MealType | '';
  setMealType: (m: MealType | '') => void;
  allMealTypes: string[];
  disabled: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as Category)}
          className="w-full px-4 py-3 rounded-lg border-2 border-sage-300 focus:border-sage-500 focus:outline-none text-gray-800"
          disabled={disabled}
        >
          <option value="breakfast">Breakfast</option>
          <option value="lunch">Lunch</option>
          <option value="dinner">Dinner</option>
          <option value="snacks">Snacks</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Meal Type (optional)</label>
        <select
          value={mealType}
          onChange={(e) => setMealType(e.target.value as MealType | '')}
          className="w-full px-4 py-3 rounded-lg border-2 border-sage-300 focus:border-sage-500 focus:outline-none text-gray-800"
          disabled={disabled}
        >
          <option value="">None</option>
          {allMealTypes.map((type) => (
            <option key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function Step({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <div className="w-7 h-7 rounded-full bg-sage-600 text-white text-sm font-black flex items-center justify-center shrink-0 mt-0.5">
        {number}
      </div>
      <div>
        <p className="font-bold text-gray-800 mb-1">{title}</p>
        {children}
      </div>
    </div>
  );
}
