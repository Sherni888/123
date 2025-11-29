import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../types';
import { authenticateUser, registerUser } from '../services/storeService';
import { Lock, User as UserIcon, ArrowRight } from 'lucide-react';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLoginMode) {
        const user = authenticateUser(username, password);
        if (user) {
            onLogin(user);
            if (user.isAdmin) {
                navigate('/admin');
            } else {
                navigate('/');
            }
        } else {
            setError('Invalid username or password');
        }
    } else {
        // Registration
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (password.length < 4) {
            setError('Password must be at least 4 characters');
            return;
        }

        const success = registerUser(username, password);
        if (success) {
            // Auto login after register
            const user = authenticateUser(username, password);
            if (user) {
                onLogin(user);
                navigate('/');
            }
        } else {
            setError('Username already taken');
        }
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface p-8 rounded-2xl border border-white/10 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-blue-500 mb-2">GGSALE</h1>
          <p className="text-gray-400">{isLoginMode ? 'Welcome back' : 'Create your account'}</p>
        </div>

        <div className="flex mb-6 bg-background rounded-lg p-1 border border-white/5">
            <button 
                onClick={() => { setIsLoginMode(true); setError(''); }}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${isLoginMode ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
                Sign In
            </button>
            <button 
                onClick={() => { setIsLoginMode(false); setError(''); }}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${!isLoginMode ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
                Sign Up
            </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Username</label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-3 text-gray-600" size={20} />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-background border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="Enter username"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-600" size={20} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-background border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="Enter password"
              />
            </div>
          </div>

          {!isLoginMode && (
              <div className="animate-fade-in">
                <label className="block text-sm text-gray-400 mb-2">Confirm Password</label>
                <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-600" size={20} />
                <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-background border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="Confirm password"
                />
                </div>
              </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 mt-2"
          >
            {isLoginMode ? 'Login' : 'Create Account'}
            <ArrowRight size={18} />
          </button>
        </form>
        
        {isLoginMode && (
            <div className="mt-6 text-center text-xs text-gray-600">
                <p>Admin access? Use your special credentials.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
