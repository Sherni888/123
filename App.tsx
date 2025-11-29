import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import { User } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  // Simple session persistence
  useEffect(() => {
    const storedUser = localStorage.getItem('ggsale_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('ggsale_user', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('ggsale_user');
  };

  return (
    <HashRouter>
      <div className="min-h-screen bg-background text-gray-100 font-sans selection:bg-blue-500/30">
        <Navbar user={user} onLogout={handleLogout} />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:id" element={<ProductPage user={user} />} />
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          <Route 
            path="/admin" 
            element={user?.isAdmin ? <AdminPage user={user} /> : <Navigate to="/login" replace />} 
          />
        </Routes>
        
        {/* Footer */}
        <footer className="border-t border-white/5 bg-surface py-8 mt-auto">
          <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
            <p>&copy; 2024 GGSALE. All rights reserved. Premium Digital Goods.</p>
          </div>
        </footer>
      </div>
    </HashRouter>
  );
};

export default App;
