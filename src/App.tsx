import { useState, useEffect } from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { Dashboard } from '@/components/Dashboard';
import { Loader } from 'lucide-react';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Chargement du tableau de bord...</p>
      </div>
    );
  }

  return (
    <ThemeProvider defaultTheme="light" storageKey="analytics-theme">
      <Dashboard />
      <Toaster />
    </ThemeProvider>
  );
}

export default App;