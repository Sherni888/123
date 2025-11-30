import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User as UserIcon, LogOut, LayoutDashboard } from 'lucide-react';
import { User } from '../types.ts';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  cartItemCount: number;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout, cartItemCount }) => {
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-black text-blue-500 tracking-tighter">
              GGSALE
            </Link>
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                <Link to="/" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Shop</Link>
                <Link to="/" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">About</Link>
                <Link to="/" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Contact</Link>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Link to="/cart" className="p-2 text-gray-400 hover:text-white transition-colors relative">
              <ShoppingCart size={22} />
              {cartItemCount > 0 && (
                <span className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center border border-background">
                  {cartItemCount}
                </span>
              )}
            </Link>
            
            {user ? (
              <div className="flex items-center gap-4">
                 {user.isAdmin && (
                  <button 
                    onClick={() => navigate('/admin')}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm transition-colors"
                  >
                    <LayoutDashboard size={16} />
                    <span>Admin</span>
                  </button>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <UserIcon size={18} />
                  <span className="hidden sm:inline">{user.username}</span>
                </div>
                <button 
                  onClick={onLogout}
                  className="p-2 text-red-400 hover:text-red-300 transition-colors"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <Link 
                to="/login"
                className="flex items-center gap-2 bg-surface hover:bg-white/10 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all border border-white/10"
              >
                <UserIcon size={16} />
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;