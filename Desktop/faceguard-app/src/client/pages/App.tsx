import React, { useState } from 'react';
import Dashboard from '../components/Dashboard';
import LoginPage from './LoginPage';

const App: React.FC = () => {
    const [user, setUser] = useState<string | null>(null);

    const handleLogin = (username: string) => {
        setUser(username);
    };

    const handleLogout = () => {
        setUser(null);
    };

    return (
        <div className="App">
            {!user ? (
                <LoginPage onLogin={handleLogin} />
            ) : (
                <Dashboard currentUser={user} onLogout={handleLogout} />
            )}
        </div>
    );
};

export default App;