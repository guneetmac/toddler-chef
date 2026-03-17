import { useState } from 'react';
import { Link2, Bookmark, Smartphone, Loader2 } from 'lucide-react';

interface LinkParserProps {
  onImportData: (data: { url: string; text: string }) => void;
}

const BOOKMARKLET = `javascript:(function(){var u=location.href;var t='';try{var selectors=['h1._ap3a','div._a9zs span','div[class*="x1lliihq"] span','span[class*="x193iq5w"]','[data-e2e="browse-video-desc"]','[data-e2e="video-desc"]'];for(var i=0;i<selectors.length;i++){var el=document.querySelector(selectors[i]);if(el&&el.innerText&&el.innerText.length>20){t=el.innerText;break;}}if(!t){var spans=document.querySelectorAll('span');var best='';for(var j=0;j<spans.length;j++){var txt=spans[j].innerText||'';if(txt.length>best.length&&txt.length<3000&&!txt.includes('Follow')&&!txt.includes('following')){best=txt;}}t=best;}}catch(e){}var base='https://toddlerchef.netlify.app';window.open(base+'?import_url='+encodeURIComponent(u)+'&import_text='+encodeURIComponent(t),'_blank');})();`;

type MainTab = 'url' | 'auto';
type AutoTab = 'desktop' | 'mobile';

export function LinkParser({ onImportData }: LinkParserProps) {
  const [mainTab, setMainTab] = useState<MainTab>('url');
  const [autoTab, setAutoTab] = useState<AutoTab>('desktop');
  const [importUrl, setImportUrl] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeError, setScrapeError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleImportUrl = async () => {
    const trimmed = importUrl.trim();
    if (!trimmed || (!trimmed.startsWith('http://') && !trimmed.startsWith('https://'))) {
      setScrapeError('Please enter a valid URL starting with https://');
      return;
    }
    setIsScraping(true);
    setScrapeError('');
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/scrape-instagram`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: trimmed }),
        }
      );
      if (!response.ok) throw new Error(`Scrape failed: ${response.status}`);
      const data = await response.json();
      if (data.success && data.content) {
        onImportData({ url: trimmed, text: data.content });
        setImportUrl('');
      } else {
        throw new Error(data.error || 'Could not extract recipe content');
      }
    } catch (err) {
      setScrapeError(
        err instanceof Error
          ? err.message
          : 'Failed to fetch. Try the Auto Import tab for Instagram/TikTok.'
      );
    } finally {
      setIsScraping(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(BOOKMARKLET);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-sage-200 mb-8 overflow-hidden">
      <div className="px-6 pt-5 pb-0">
        <h2 className="text-xl font-black text-sage-800">Add / Import Recipes</h2>
      </div>
      {/* Main tabs */}
      <div className="flex border-b border-gray-100 mt-4">
        <button
          onClick={() => setMainTab('url')}
          className={`flex-1 py-4 font-bold text-sm transition-all ${mainTab === 'url' ? 'text-sage-800 border-b-2 border-sage-600 bg-sage-50' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Paste URL
        </button>
        <button
          onClick={() => setMainTab('auto')}
          className={`flex-1 py-4 font-bold text-sm transition-all ${mainTab === 'auto' ? 'text-sage-800 border-b-2 border-sage-600 bg-sage-50' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Auto Import
        </button>
      </div>

      <div className="p-6">
        {/* ── PASTE URL ── */}
        {mainTab === 'url' && (
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
              Sites requiring login (Instagram, Patreon) — use Auto Import instead.
            </p>
          </div>
        )}

        {/* ── AUTO IMPORT ── */}
        {mainTab === 'auto' && (
          <>
            <p className="text-sm text-gray-600 mb-4">
              One-click import from Instagram, TikTok, or any recipe page while you're already browsing.
            </p>

            {/* Desktop / Mobile sub-tabs */}
            <div className="flex bg-gray-100 rounded-xl p-1 mb-5">
              <button
                onClick={() => setAutoTab('desktop')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg font-bold text-sm transition-all ${autoTab === 'desktop' ? 'bg-white text-sage-800 shadow-sm' : 'text-gray-500'}`}
              >
                <Bookmark size={14} />
                Desktop
              </button>
              <button
                onClick={() => setAutoTab('mobile')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg font-bold text-sm transition-all ${autoTab === 'mobile' ? 'bg-white text-sage-800 shadow-sm' : 'text-gray-500'}`}
              >
                <Smartphone size={14} />
                Mobile
              </button>
            </div>

            {autoTab === 'desktop' && (
              <div className="space-y-4">
                <Step number={1} title="Save the bookmarklet">
                  <p className="text-sm text-gray-600 mb-3">
                    Drag the button below to your browser's bookmarks bar. No bar? Press{' '}
                    <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">Ctrl+Shift+B</kbd>.
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
                      onClick={handleCopy}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors"
                    >
                      {copied ? '✓ Copied!' : 'Copy code'}
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

            {autoTab === 'mobile' && (
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
