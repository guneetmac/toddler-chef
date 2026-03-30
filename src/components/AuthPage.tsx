import { useState } from 'react';
import { ChefHat, Check, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function AuthPage({ onBack }: { onBack?: () => void }) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [confirmedEmail, setConfirmedEmail] = useState('');

  const passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
  const passwordValid = Object.values(passwordChecks).every(Boolean);

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

    if (mode === 'signup' && !passwordValid) {
      setError('Please meet all password requirements');
      return;
    }

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
        setConfirmedEmail(email);
        setConfirming(true);
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

  if (confirming) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sage-50 to-warmOrange-50 flex flex-col">
        <header className="text-center pt-12 pb-8 px-4">
          <div className="flex items-center justify-center gap-3 mb-2">
            <ChefHat size={48} className="text-sage-600" />
            <h1 className="text-4xl md:text-6xl font-black text-sage-800">Toddler Chef</h1>
          </div>
        </header>
        <div className="flex-1 flex items-start justify-center px-4">
          <div className="bg-white rounded-3xl shadow-xl border-2 border-sage-200 p-8 w-full max-w-md text-center">
            <div className="w-16 h-16 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📬</span>
            </div>
            <h2 className="text-2xl font-black text-sage-800 mb-2">Check your inbox!</h2>
            <p className="text-gray-600 text-sm mb-4">
              We've sent a confirmation email to:
            </p>
            <p className="font-bold text-sage-700 text-base bg-sage-50 rounded-xl px-4 py-2 mb-4 break-all">
              {confirmedEmail}
            </p>
            <p className="text-gray-500 text-sm mb-2">
              Click the link in that email to activate your account. The email will come from:
            </p>
            <p className="text-xs font-mono text-gray-400 bg-gray-50 rounded-lg px-3 py-2 mb-6">
              noreply@mail.app.supabase.io
            </p>
            <p className="text-xs text-gray-400 mb-6">
              Can't find it? Check your spam or junk folder.
            </p>
            <button
              onClick={() => { setConfirming(false); switchMode('signin'); }}
              className="w-full bg-warmOrange-500 hover:bg-warmOrange-600 text-white font-bold py-3 rounded-xl transition-colors"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 to-warmOrange-50 flex flex-col">
      <header className="text-center pt-12 pb-8 px-4">
        <div className="flex items-center justify-center gap-3 mb-2">
          <ChefHat size={48} className="text-sage-600" />
          <h1 className="text-4xl md:text-6xl font-black text-sage-800">Toddler Chef</h1>
        </div>
        <p className="text-xl text-sage-600 font-bold">Quick Recipes for Busy Parents</p>
        {onBack && (
          <button onClick={onBack} className="mt-3 text-sm text-sage-500 hover:text-sage-700 underline">
            ← Continue browsing without signing in
          </button>
        )}
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

              <div className="mt-6 p-4 bg-sage-50 rounded-xl border border-sage-200 text-center">
                <p className="text-sm text-sage-700 font-medium">New to Toddler Chef?</p>
                <p className="text-xs text-sage-600 mt-1 mb-3">Create a free account to save and manage your family's recipes.</p>
                <button onClick={() => switchMode('signup')} className="w-full bg-sage-600 hover:bg-sage-700 text-white font-bold py-2 rounded-xl transition-colors text-sm">
                  Create a free account
                </button>
              </div>
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
                    placeholder="Create a strong password"
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 border-sage-200 focus:border-sage-500 focus:outline-none text-gray-800"
                  />
                  {password.length > 0 && (
                    <div className="mt-2 grid grid-cols-2 gap-1">
                      {[
                        { key: 'length', label: 'At least 8 characters' },
                        { key: 'uppercase', label: 'One uppercase letter' },
                        { key: 'lowercase', label: 'One lowercase letter' },
                        { key: 'number', label: 'One number' },
                        { key: 'special', label: 'One special character' },
                      ].map(({ key, label }) => (
                        <div key={key} className="flex items-center gap-1">
                          {passwordChecks[key as keyof typeof passwordChecks]
                            ? <Check size={12} className="text-green-500 shrink-0" />
                            : <X size={12} className="text-red-400 shrink-0" />}
                          <span className={`text-xs ${passwordChecks[key as keyof typeof passwordChecks] ? 'text-green-600' : 'text-gray-400'}`}>{label}</span>
                        </div>
                      ))}
                    </div>
                  )}
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
                  disabled={isLoading || !passwordValid || password !== confirmPassword}
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
