import { useState } from 'react';
import { ChefHat } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function AuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const switchMode = (newMode: 'signin' | 'signup') => {
    setMode(newMode);
    setError('');
    setSuccessMessage('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setName('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } },
        });
        if (error) throw error;
        setSuccessMessage('Account created! You can now sign in.');
        switchMode('signin');
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

          {mode === 'signin' ? (
            <>
              <h2 className="text-2xl font-black text-sage-800 mb-1">Welcome back</h2>
              <p className="text-gray-500 text-sm mb-6">Sign in to your recipe collection</p>

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
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>

              <p className="text-center text-sm text-gray-500 mt-6">
                Don't have an account?{' '}
                <button onClick={() => switchMode('signup')} className="text-sage-600 font-bold hover:underline">
                  Register now
                </button>
              </p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-black text-sage-800 mb-1">Create your account</h2>
              <p className="text-gray-500 text-sm mb-6">Start saving your family's favourite recipes</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane"
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 border-sage-200 focus:border-sage-500 focus:outline-none text-gray-800"
                  />
                </div>
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
                    placeholder="Min. 6 characters"
                    required
                    minLength={6}
                    className="w-full px-4 py-3 rounded-xl border-2 border-sage-200 focus:border-sage-500 focus:outline-none text-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full px-4 py-3 rounded-xl border-2 border-sage-200 focus:border-sage-500 focus:outline-none text-gray-800"
                  />
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-warmOrange-500 hover:bg-warmOrange-600 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Creating account...' : 'Register Now'}
                </button>
              </form>

              <p className="text-center text-sm text-gray-500 mt-6">
                Already have an account?{' '}
                <button onClick={() => switchMode('signin')} className="text-sage-600 font-bold hover:underline">
                  Sign in
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
