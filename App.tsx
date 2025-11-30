import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.tsx';
import HomePage from './pages/HomePage.tsx';
import ProductPage from './pages/ProductPage.tsx';
import AdminPage from './pages/AdminPage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import CartPage from './pages/CartPage.tsx';
import { User, CartItem, Product } from './types.ts';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);

  // Load User & Cart
  useEffect(() => {
    const storedUser = localStorage.getItem('ggsale_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const storedCart = localStorage.getItem('ggsale_cart');
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
  }, []);

  // Save Cart on change
  useEffect(() => {
    localStorage.setItem('ggsale_cart', JSON.stringify(cart));
  }, [cart]);

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('ggsale_user', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('ggsale_user');
  };

  // Cart Functions
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQuantity = item.quantity + delta;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }));
  };

  return (
    <HashRouter>
      <div className="min-h-screen bg-background text-gray-100 font-sans selection:bg-blue-500/30">
        <Navbar user={user} onLogout={handleLogout} cartItemCount={cart.reduce((a, b) => a + b.quantity, 0)} />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route 
            path="/product/:id" 
            element={<ProductPage user={user} addToCart={addToCart} />} 
          />
          <Route 
            path="/cart" 
            element={
              <CartPage 
                cart={cart} 
                updateQuantity={updateQuantity} 
                removeFromCart={removeFromCart} 
              />
            } 
          />
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