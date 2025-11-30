import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, CreditCard } from 'lucide-react';
import { CartItem } from '../types.ts';
import { formatPrice } from '../services/storeService.ts';

interface CartPageProps {
  cart: CartItem[];
  updateQuantity: (productId: string, delta: number) => void;
  removeFromCart: (productId: string) => void;
}

const CartPage: React.FC<CartPageProps> = ({ cart, updateQuantity, removeFromCart }) => {
  const navigate = useNavigate();
  const totalPrice = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const handleCheckout = () => {
      // Placeholder for future YooKassa integration
      alert("Redirecting to YooKassa payment gateway...\n(Feature coming soon)");
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-12 px-4">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div className="w-24 h-24 bg-surface rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
            <CreditCard size={40} className="text-gray-600" />
          </div>
          <h2 className="text-3xl font-bold text-white">Your cart is empty</h2>
          <p className="text-gray-400">Looks like you haven't added any digital goods yet.</p>
          <Link 
            to="/"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 pt-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-white mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div key={item.product.id} className="bg-surface p-4 sm:p-6 rounded-2xl border border-white/5 flex flex-col sm:flex-row gap-6 items-center group hover:border-blue-500/20 transition-all">
                {/* Image */}
                <div className="w-full sm:w-32 aspect-video sm:aspect-square bg-black rounded-xl overflow-hidden flex-shrink-0">
                  <img 
                    src={item.product.images[0] || 'https://picsum.photos/200'} 
                    alt={item.product.title} 
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-grow text-center sm:text-left">
                  <h3 className="text-lg font-bold text-white mb-1">{item.product.title}</h3>
                  <p className="text-sm text-gray-500 mb-4">{item.product.features[0] || 'Digital Key'}</p>
                  <p className="font-bold text-blue-400 text-xl">{formatPrice(item.product.price)}</p>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3 bg-background rounded-lg p-1 border border-white/10">
                    <button 
                      onClick={() => updateQuantity(item.product.id, -1)}
                      className="p-1 hover:text-white text-gray-400 transition-colors"
                      disabled={item.quantity <= 1}
                    >
                      <Minus size={16} />
                    </button>
                    <span className="text-white font-medium w-4 text-center">{item.quantity}</span>
                    <button 
                       onClick={() => updateQuantity(item.product.id, 1)}
                       className="p-1 hover:text-white text-gray-400 transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  
                  <button 
                    onClick={() => removeFromCart(item.product.id)}
                    className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-surface rounded-2xl p-6 border border-white/5 shadow-xl">
              <h2 className="text-xl font-bold text-white mb-6">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal ({cart.length} items)</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Instant Delivery</span>
                  <span className="text-green-500">Free</span>
                </div>
                <div className="border-t border-white/10 pt-3 flex justify-between text-white font-bold text-lg">
                  <span>Total</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
              </div>

              <button 
                onClick={handleCheckout}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-900/20 active:scale-95 flex items-center justify-center gap-2 group"
              >
                Proceed to Checkout
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              
              <p className="text-xs text-center text-gray-500 mt-4">
                Secured by YooKassa. By purchasing, you agree to our Terms of Service.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;