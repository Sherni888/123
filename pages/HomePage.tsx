import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { getProducts, getCategories, formatPrice } from '../services/storeService.ts';
import { Product, Category } from '../types.ts';

const HomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  useEffect(() => {
    setProducts(getProducts());
    setCategories(getCategories());
  }, []);

  const filteredProducts = activeCategory === 'all' 
    ? products 
    : products.filter(p => p.categoryId === activeCategory);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero / Banners Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="relative h-64 bg-gradient-to-r from-blue-900 to-slate-900 rounded-2xl overflow-hidden p-8 flex flex-col justify-center border border-white/5">
            <span className="text-blue-400 font-bold mb-2 uppercase tracking-wide text-xs">Featured Sale</span>
            <h2 className="text-3xl font-bold text-white mb-4">Game Sales</h2>
            <p className="text-gray-400 mb-6 max-w-sm">Up to 90% off on popular titles. Limited time offer for this week.</p>
            <div className="absolute right-0 top-0 h-full w-1/2 bg-[url('https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800')] bg-cover bg-center opacity-20 mask-image-gradient"></div>
          </div>
          <div className="relative h-64 bg-surface rounded-2xl overflow-hidden p-8 flex flex-col justify-center border border-white/5">
             <span className="text-green-400 font-bold mb-2 uppercase tracking-wide text-xs">New Arrival</span>
            <h2 className="text-3xl font-bold text-white mb-4">Subscriptions</h2>
            <p className="text-gray-400 mb-6 max-w-sm">Best prices for streaming services and software licenses.</p>
             <div className="absolute right-0 top-0 h-full w-1/2 bg-[url('https://images.unsplash.com/photo-1579869847514-7c1a19d2d2ad?auto=format&fit=crop&q=80&w=800')] bg-cover bg-center opacity-20"></div>
          </div>
        </div>

        {/* Categories */}
        <div className="mb-10">
          <h3 className="text-xl font-bold text-white mb-6">Popular Categories</h3>
          {categories.length === 0 ? (
            <p className="text-gray-500 text-sm">No categories yet. Login as admin to add them.</p>
          ) : (
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-6 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeCategory === 'all' 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                    : 'bg-surface text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                All Items
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-6 py-3 rounded-xl text-sm font-medium transition-all ${
                    activeCategory === cat.id 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                      : 'bg-surface text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Grid */}
        <div className="mb-8">
           <h3 className="text-xl font-bold text-white mb-6">
             {activeCategory === 'all' ? 'Best Sellers' : categories.find(c => c.id === activeCategory)?.name || 'Products'}
           </h3>
           
           {filteredProducts.length === 0 ? (
             <div className="text-center py-20 text-gray-500 bg-surface/50 rounded-2xl border border-white/5">
               <p>No products found in this category yet.</p>
             </div>
           ) : (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
               {filteredProducts.map((product) => (
                 <Link to={`/product/${product.id}`} key={product.id} className="group bg-surface rounded-2xl overflow-hidden hover:translate-y-[-4px] transition-all duration-300 border border-white/5 hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-900/10">
                   <div className="aspect-video w-full overflow-hidden bg-gray-800 relative">
                     <img 
                       src={product.images && product.images.length > 0 ? product.images[0] : 'https://picsum.photos/400/300?grayscale'} 
                       alt={product.title}
                       className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                       onError={(e) => {
                         (e.target as HTMLImageElement).src = 'https://picsum.photos/400/300?grayscale';
                       }}
                     />
                     <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-xs font-bold text-yellow-400 flex items-center gap-1">
                       <Star size={12} fill="currentColor" /> {product.rating || 5.0}
                     </div>
                   </div>
                   <div className="p-5">
                     <div className="text-xs text-blue-400 font-semibold mb-1 uppercase tracking-wider">
                        {categories.find(c => c.id === product.categoryId)?.name || 'Digital'}
                     </div>
                     <h4 className="text-white font-bold text-lg mb-2 line-clamp-2 min-h-[3.5rem] leading-snug">
                       {product.title}
                     </h4>
                     <div className="flex items-end justify-between mt-4">
                       <div>
                         <p className="text-xs text-gray-500 mb-0.5">Price</p>
                         <p className="text-xl font-bold text-blue-400">{formatPrice(product.price)}</p>
                       </div>
                       <div className="bg-blue-600/10 text-blue-400 px-3 py-1.5 rounded-lg text-sm font-medium group-hover:bg-blue-600 group-hover:text-white transition-colors">
                         View
                       </div>
                     </div>
                   </div>
                 </Link>
               ))}
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;