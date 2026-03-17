import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { AuthPage } from './components/AuthPage';
import { Dashboard } from './components/Dashboard';
import { ImportModal } from './components/ImportModal';

function AppContent() {
  const { session, isLoading } = useAuth();
  const [importData, setImportData] = useState<{ url: string; text: string } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const importUrl = params.get('import_url') || params.get('url') || '';
    const importText = params.get('import_text') || params.get('text') || '';

    if (importUrl || importText) {
      setImportData({ url: importUrl, text: importText });
      // Clean the URL params without reloading
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sage-50 to-warmOrange-50 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-sage-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!session) return <AuthPage />;

  return (
    <>
      <Dashboard />
      {importData && (
        <ImportModal
          importUrl={importData.url}
          importText={importData.text}
          onComplete={() => setImportData(null)}
          onDismiss={() => setImportData(null)}
        />
      )}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
