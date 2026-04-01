import { X } from 'lucide-react';

interface AboutModalProps {
  onDismiss: () => void;
}

export function AboutModal({ onDismiss }: AboutModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 px-0 sm:px-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white rounded-t-3xl flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <h2 className="text-xl font-black text-sage-800">About Toddler Chef</h2>
          <button onClick={onDismiss} className="text-gray-400 hover:text-gray-600 p-1">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5 text-gray-700 text-sm leading-relaxed">
          {/* Origin story */}
          <section>
            <h3 className="font-black text-sage-800 text-base mb-2">How this started</h3>
            <p>
              Like most parents, I had hundreds of toddler recipes saved across Instagram and TikTok. The problem? By the time dinner rolled around and I had a hungry, impatient toddler on my hands, I could never actually <em>find</em> the right one.
            </p>
            <p className="mt-2">
              Instagram's saved posts are just a wall of thumbnails. TikTok's bookmarks are no better. There's no way to search, no way to filter by time, no way to see what you can make with what's already in your kitchen.
            </p>
          </section>

          {/* What it solves */}
          <section>
            <h3 className="font-black text-sage-800 text-base mb-2">What Toddler Chef does</h3>
            <p>
              It's one place to keep all your saved toddler recipes — imported directly from Instagram, TikTok, or any recipe website — and actually find them when you need them.
            </p>
            <ul className="mt-3 space-y-2">
              <li className="flex gap-2">
                <span className="text-lg leading-none mt-0.5">⚡</span>
                <span><strong>Filter by time.</strong> 15 minutes before the meltdown? Filter to recipes under 10 or 20 minutes.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-lg leading-none mt-0.5">🥕</span>
                <span><strong>Filter by pantry.</strong> Tell it what you have — eggs, pasta, chicken — and only see recipes you can actually make right now.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-lg leading-none mt-0.5">🔍</span>
                <span><strong>Search everything.</strong> Find recipes by ingredient, title, or category in seconds.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-lg leading-none mt-0.5">🤖</span>
                <span><strong>AI assistant.</strong> Ask "what can I make with the bananas going brown?" and get ideas from your existing collection or brand new suggestions.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-lg leading-none mt-0.5">🌱</span>
                <span><strong>Built for toddlers.</strong> Filters for dietary needs, allergens, protein, and vegetarian — because toddlers are complicated.</span>
              </li>
            </ul>
          </section>

          {/* Who it's for */}
          <section>
            <h3 className="font-black text-sage-800 text-base mb-2">Who it's for</h3>
            <p>
              Parents of children aged roughly 6 months to 3 years who are navigating the sometimes stressful world of introducing solid foods and finding quick, nutritious meals that a tiny human will actually eat.
            </p>
          </section>

          {/* How to use */}
          <section className="bg-sage-50 rounded-2xl p-4">
            <h3 className="font-black text-sage-800 text-base mb-2">Getting started</h3>
            <ol className="space-y-1.5 text-sm">
              <li className="flex gap-2"><span className="font-bold text-sage-600 shrink-0">1.</span>Create a free account (your recipes are private to you)</li>
              <li className="flex gap-2"><span className="font-bold text-sage-600 shrink-0">2.</span>Import your first recipe by pasting a URL from any website, Instagram, or TikTok</li>
              <li className="flex gap-2"><span className="font-bold text-sage-600 shrink-0">3.</span>Set up the bookmarklet (in Import → Auto Import) for one-click saving from any page</li>
              <li className="flex gap-2"><span className="font-bold text-sage-600 shrink-0">4.</span>Use filters and the AI chat when it's time to cook</li>
            </ol>
          </section>

          <p className="text-xs text-gray-400 text-center pb-1">
            Built by a parent, for parents. Questions or feedback? Open an issue on{' '}
            <a
              href="https://github.com/guneetmac/toddler-chef"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sage-600 underline"
            >
              GitHub
            </a>.
          </p>
        </div>
      </div>
    </div>
  );
}
