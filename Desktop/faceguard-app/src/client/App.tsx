import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Navigate, Routes } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import LoginPage from './pages/LoginPage';

const App: React.FC = () => {
  // Only treat non-empty string as logged in
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored && stored.trim() !== '' ? stored : '';
  });

  const handleLogin = (username: string) => {
    localStorage.setItem('user', username);
    setUser(username);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser('');
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            user ? <Navigate to="/dashboard" /> : <LoginPage onLogin={handleLogin} />
          }
        />
        <Route
          path="/dashboard"
          element={
            user ? (
              <Dashboard currentUser={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/"
          element={<Navigate to={user ? "/dashboard" : "/login"} />}
        />
      </Routes>
    </Router>
  );
};

export default App;