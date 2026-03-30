import { useState } from 'react';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { AuthPage } from './components/AuthPage';
import { Dashboard } from './components/Dashboard';

function AppContent() {
  const { session, isLoading } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sage-50 to-warmOrange-50 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-sage-600 border-t-transparent"></div>
      </div>
    );
  }

  if (showAuth && !session) {
    return <AuthPage onBack={() => setShowAuth(false)} />;
  }

  return <Dashboard isGuest={!session} onAuthRequired={() => setShowAuth(true)} />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
