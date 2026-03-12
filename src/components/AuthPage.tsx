import { useState } from 'react';
import { ChefHat } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function AuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setSuccessMessage('Account created! You can now sign in.');
        setMode('signin');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 to-warmOrange-50 flex flex-col">
      <header className="text-center pt-12 pb-8 px-4">
        <div className="flex items-center justify-center gap-3 mb-2">
          <ChefHat size={48} className="text-sage-600" />
          <h1 className="text-4xl md:text-6xl font-black text-sage-800">Toddler Chef</h1>
        </div>
        <p className="text-xl text-sage-600 font-bold">Quick Recipes for Busy Parents</p>
      </header>

      <div className="flex-1 flex items-start justify-center px-4">
        <div className="bg-white rounded-3xl shadow-xl border-2 border-sage-200 p-8 w-full max-w-md">
          <div className="flex mb-6 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => { setMode('signin'); setError(''); setSuccessMessage(''); }}
              className={`flex-1 py-2 rounded-lg font-bold transition-all ${mode === 'signin' ? 'bg-white text-sage-800 shadow-sm' : 'text-gray-500'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('signup'); setError(''); setSuccessMessage(''); }}
              className={`flex-1 py-2 rounded-lg font-bold transition-all ${mode === 'signup' ? 'bg-white text-sage-800 shadow-sm' : 'text-gray-500'}`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-sage-200 focus:border-sage-500 focus:outline-none text-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-xl border-2 border-sage-200 focus:border-sage-500 focus:outline-none text-gray-800"
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}
            {successMessage && <p className="text-green-600 text-sm font-medium">{successMessage}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-warmOrange-500 hover:bg-warmOrange-600 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
