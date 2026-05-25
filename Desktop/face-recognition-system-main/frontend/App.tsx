import { useState, useEffect } from 'react';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';

const queryClient = new QueryClient();

function AppInner() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState('');

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const savedUser = localStorage.getItem('faceGuardUser');
    if (savedUser) {
      setCurrentUser(savedUser);
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = (username: string) => {
    setCurrentUser(username);
    setIsLoggedIn(true);
    localStorage.setItem('faceGuardUser', username);
  };

  const handleLogout = () => {
    setCurrentUser('');
    setIsLoggedIn(false);
    localStorage.removeItem('faceGuardUser');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
      {!isLoggedIn ? (
        <LoginScreen onLogin={handleLogin} />
      ) : (
        <Dashboard currentUser={currentUser} onLogout={handleLogout} />
      )}
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInner />
    </QueryClientProvider>
  );
}