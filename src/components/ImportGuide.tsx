import { useState } from 'react';
import { X, Bookmark, Smartphone, Play } from 'lucide-react';

interface ImportGuideProps {
  onClose: () => void;
}

const BOOKMARKLET = `javascript:(function(){var u=location.href;var t='';try{var selectors=['h1._ap3a','div._a9zs span','div[class*="x1lliihq"] span','span[class*="x193iq5w"]','[data-e2e="browse-video-desc"]','[data-e2e="video-desc"]'];for(var i=0;i<selectors.length;i++){var el=document.querySelector(selectors[i]);if(el&&el.innerText&&el.innerText.length>20){t=el.innerText;break;}}if(!t){var spans=document.querySelectorAll('span');var best='';for(var j=0;j<spans.length;j++){var txt=spans[j].innerText||'';if(txt.length>best.length&&txt.length<3000&&!txt.includes('Follow')&&!txt.includes('following')){best=txt;}}t=best;}}catch(e){}var base='https://toddlerchef.netlify.app';window.open(base+'?import_url='+encodeURIComponent(u)+'&import_text='+encodeURIComponent(t),'_blank');})();`;

const VIDEO_URL = ''; // Paste your YouTube or Loom embed URL here

export function ImportGuide({ onClose }: ImportGuideProps) {
  const [activeTab, setActiveTab] = useState<'desktop' | 'mobile'>('desktop');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(BOOKMARKLET);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 py-8 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-black text-sage-800">Import from Instagram & TikTok</h2>
            <p className="text-sm text-gray-500 mt-0.5">Set up one-click recipe saving</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* Video placeholder */}
        <div className="mx-6 mt-6 rounded-2xl overflow-hidden bg-gray-900 aspect-video flex items-center justify-center">
          {VIDEO_URL ? (
            <iframe
              src={VIDEO_URL}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="text-center text-white px-6">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
                <Play size={28} className="text-white ml-1" />
              </div>
              <p className="font-bold text-lg">Video guide coming soon</p>
              <p className="text-sm text-white/60 mt-1">Follow the steps below to get started</p>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex mx-6 mt-6 bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setActiveTab('desktop')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'desktop' ? 'bg-white text-sage-800 shadow-sm' : 'text-gray-500'}`}
          >
            <Bookmark size={16} />
            Desktop
          </button>
          <button
            onClick={() => setActiveTab('mobile')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'mobile' ? 'bg-white text-sage-800 shadow-sm' : 'text-gray-500'}`}
          >
            <Smartphone size={16} />
            Mobile
          </button>
        </div>

        {/* Steps */}
        <div className="p-6">
          {activeTab === 'desktop' ? (
            <div className="space-y-4">
              <Step number={1} title="Save the bookmarklet">
                <p className="text-sm text-gray-600 mb-3">
                  Drag the button below to your browser's bookmarks bar. If you don't see the bookmarks bar, press <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">Ctrl+Shift+B</kbd>.
                </p>
                <div className="flex gap-2">
                  <a
                    href={BOOKMARKLET}
                    className="flex items-center gap-2 px-4 py-2 bg-warmOrange-500 text-white rounded-xl font-bold text-sm cursor-grab active:cursor-grabbing"
                    onClick={(e) => e.preventDefault()}
                    draggable
                  >
                    <Bookmark size={16} />
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

              <Step number={2} title="Go to an Instagram or TikTok post">
                <p className="text-sm text-gray-600">Navigate to any recipe post on Instagram or TikTok in your browser.</p>
              </Step>

              <Step number={3} title="Click the bookmarklet">
                <p className="text-sm text-gray-600">Click <strong>"Save to Toddler Chef"</strong> in your bookmarks bar. Toddler Chef will open with the recipe pre-filled.</p>
              </Step>

              <Step number={4} title="Confirm and save">
                <p className="text-sm text-gray-600">Check the guessed category, change it if needed, then hit <strong>Save Recipe</strong>.</p>
              </Step>
            </div>
          ) : (
            <div className="space-y-4">
              <Step number={1} title="Install Toddler Chef on your phone">
                <p className="text-sm text-gray-600 mb-1">
                  Open <strong>toddlerchef.netlify.app</strong> in Chrome (Android) or Safari (iPhone).
                </p>
                <p className="text-sm text-gray-600">
                  Tap the menu → <strong>"Add to Home Screen"</strong> → <strong>Add</strong>.
                </p>
              </Step>

              <Step number={2} title="Find a recipe on Instagram or TikTok">
                <p className="text-sm text-gray-600">Open any recipe post in the Instagram or TikTok app.</p>
              </Step>

              <Step number={3} title="Tap Share → Toddler Chef">
                <p className="text-sm text-gray-600">
                  Tap the <strong>Share</strong> button on the post, then select <strong>Toddler Chef</strong> from the share sheet.
                </p>
                <p className="text-xs text-gray-400 mt-1">Note: Works on Android. On iPhone, share the link then paste it into the app manually.</p>
              </Step>

              <Step number={4} title="Confirm and save">
                <p className="text-sm text-gray-600">The app opens with the recipe pre-filled. Check the category and hit <strong>Save Recipe</strong>.</p>
              </Step>
            </div>
          )}
        </div>
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
