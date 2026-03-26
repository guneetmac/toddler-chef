import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, ChefHat, BookmarkPlus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Recipe } from '../types/recipe';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatWidgetProps {
  recipes: Recipe[];
  selectedStaples: string[];
  onImportRecipe: (data: { url: string; text: string; structured: any }) => void;
}

interface ParsedRecipe {
  name: string;
  description: string;
  totalTimeMinutes: number;
  ingredients: string[];
  steps: string[];
}

function parseRecipeFromResponse(text: string): ParsedRecipe | null {
  if (!text.includes('RECIPE:')) return null;

  const titleMatch = text.match(/RECIPE:\s*(.+)/);
  if (!titleMatch) return null;

  const timeMatch = text.match(/TIME:\s*(\d+)/);
  const summaryMatch = text.match(/SUMMARY:\s*(.+)/);
  const ingredientsMatch = text.match(/INGREDIENTS:\n([\s\S]*?)(?=\nINSTRUCTIONS:|$)/);
  const instructionsMatch = text.match(/INSTRUCTIONS:\n([\s\S]*?)(?=\nSUMMARY:|$)/);

  const ingredients = ingredientsMatch
    ? ingredientsMatch[1].split('\n').map(l => l.replace(/^-\s*/, '').trim()).filter(Boolean)
    : [];

  const steps = instructionsMatch
    ? instructionsMatch[1].split('\n').map(l => l.replace(/^\d+\.\s*/, '').trim()).filter(Boolean)
    : [];

  return {
    name: titleMatch[1].trim(),
    description: summaryMatch?.[1]?.trim() ?? '',
    totalTimeMinutes: timeMatch ? parseInt(timeMatch[1]) : 15,
    ingredients,
    steps,
  };
}

export function ChatWidget({ recipes, selectedStaples, onImportRecipe }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showGreeting, setShowGreeting] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const recipeContext = recipes.slice(0, 30).map(r => {
    const keyIngredients = (r.staple_tags?.length ? r.staple_tags.slice(0, 4) : r.ingredients.slice(0, 4)).join(', ');
    return `${r.title} (${keyIngredients}) — ${r.prep_time}min, ${r.category}`;
  });

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('chat-assistant', {
        body: {
          messages: newMessages,
          recipes: recipeContext,
          staples: selectedStaples,
        },
      });

      if (error) throw error;

      setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I had trouble connecting. Please try again!',
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
          {showGreeting && (
            <div className="flex items-center gap-2 bg-white border-2 border-sage-200 rounded-full shadow-lg pl-4 pr-2 py-2">
              <p className="text-sm font-semibold text-sage-800 whitespace-nowrap">
                🍳 Picky eater? I'll find you a recipe!
              </p>
              <button
                onClick={() => setShowGreeting(false)}
                className="w-5 h-5 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-400 flex-shrink-0"
              >
                <X size={10} />
              </button>
            </div>
          )}
          <button
            onClick={() => { setIsOpen(true); setShowGreeting(false); }}
            className="w-14 h-14 bg-sage-600 hover:bg-sage-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all flex-shrink-0"
            aria-label="Open AI Chat"
          >
            <MessageCircle size={24} />
          </button>
        </div>
      )}

      {isOpen && (
        <div className="fixed bottom-0 right-0 w-full sm:w-96 h-[85vh] sm:h-[600px] sm:bottom-6 sm:right-6 bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col z-50 border border-gray-200">
          <div className="flex items-center justify-between px-4 py-3 bg-sage-600 rounded-t-3xl">
            <div className="flex items-center gap-2 text-white">
              <ChefHat size={20} />
              <span className="font-bold">Toddler Chef AI</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center text-gray-400 text-sm mt-8">
                <ChefHat size={32} className="mx-auto mb-2 text-sage-300" />
                <p>Ask me about toddler recipes,</p>
                <p>nutrition, or meal ideas!</p>
              </div>
            )}

            {messages.map((msg, i) => {
              const parsed = msg.role === 'assistant' ? parseRecipeFromResponse(msg.content) : null;
              return (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-sage-600 text-white rounded-br-sm'
                        : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                    }`}>
                      {msg.content}
                    </div>
                    {parsed && (
                      <button
                        onClick={() => onImportRecipe({ url: '', text: msg.content, structured: parsed })}
                        className="flex items-center gap-1 text-xs text-sage-600 hover:text-sage-800 font-semibold bg-sage-50 hover:bg-sage-100 px-2 py-1 rounded-lg transition-colors"
                      >
                        <BookmarkPlus size={14} />
                        Save to my recipes
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-3 py-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t border-gray-100 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about recipes or nutrition..."
              disabled={isLoading}
              className="flex-1 px-3 py-2 rounded-xl border border-gray-200 focus:border-sage-400 focus:outline-none text-sm disabled:opacity-50"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="w-9 h-9 bg-sage-600 hover:bg-sage-700 text-white rounded-xl flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
