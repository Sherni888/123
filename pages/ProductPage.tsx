import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProductById, formatPrice, addProductReview } from '../services/storeService';
import { Product, Review, User } from '../types';
import { CheckCircle2, ShieldCheck, Zap, MessageCircle, ShoppingCart, Star, Upload, User as UserIcon, Calendar } from 'lucide-react';

interface ProductPageProps {
    user: User | null;
    addToCart: (product: Product) => void;
}

const ProductPage: React.FC<ProductPageProps> = ({ user, addToCart }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | undefined>(undefined);
  const [activeImage, setActiveImage] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'description' | 'reviews' | 'requirements'>('description');
  
  // Review Form State
  const [reviewForm, setReviewForm] = useState({
      userName: '',
      rating: 5,
      comment: ''
  });
  const [reviewImage, setReviewImage] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const foundProduct = getProductById(id);
      setProduct(foundProduct);
      if (foundProduct && foundProduct.images.length > 0) {
        setActiveImage(foundProduct.images[0]);
      }
    }
  }, [id]);

  useEffect(() => {
      if (user) {
          setReviewForm(prev => ({ ...prev, userName: user.username }));
      }
  }, [user]);

  const handleBuy = () => {
      if (product) {
        addToCart(product);
        navigate('/cart');
      }
  };

  const handleAddToCart = () => {
      if (product) {
          addToCart(product);
          // Optional: Add visual feedback toast here
          alert(`${product.title} added to cart!`);
      }
  }

  const handleReviewImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          const reader = new FileReader();
          reader.onloadend = () => {
              setReviewImage(reader.result as string);
          };
          reader.readAsDataURL(file);
      }
  };

  const submitReview = (e: React.FormEvent) => {
      e.preventDefault();
      if (!product || !id) return;

      const newReview: Review = {
          id: Date.now().toString(),
          userName: reviewForm.userName || 'Anonymous',
          rating: reviewForm.rating,
          comment: reviewForm.comment,
          date: new Date().toLocaleDateString(),
          imageUrl: reviewImage || undefined
      };

      const updatedProduct = addProductReview(id, newReview);
      if (updatedProduct) {
          setProduct(updatedProduct);
          // Reset only comment and image, keep username if logged in
          setReviewForm(prev => ({ ...prev, rating: 5, comment: '' }));
          if (!user) {
              setReviewForm(prev => ({ ...prev, userName: '' }));
          }
          setReviewImage(null);
          alert('Review added!');
      }
  };

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Product not found</h2>
          <Link to="/" className="text-blue-500 hover:underline">Return to Shop</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 pt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-6">
           <Link to="/" className="hover:text-white transition-colors">Home</Link>
           <span className="mx-2">/</span>
           <span className="text-gray-300">Product Details</span>
           <span className="mx-2">/</span>
           <span className="text-white">{product.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Column: Image & Description */}
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-4">
                <div className="bg-surface rounded-2xl overflow-hidden border border-white/5 shadow-2xl aspect-video relative group">
                <img 
                    src={activeImage || 'https://picsum.photos/800/600?grayscale'} 
                    alt={product.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://picsum.photos/800/600?grayscale';
                    }}
                />
                </div>
                {product.images && product.images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {product.images.map((img, idx) => (
                            <button 
                                key={idx}
                                onClick={() => setActiveImage(img)}
                                className={`flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                                    activeImage === img ? 'border-blue-500 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
                                }`}
                            >
                                <img src={img} alt="" className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                )}
            </div>
            
            <div className="bg-surface rounded-2xl p-8 border border-white/5">
              <div className="flex border-b border-white/10 mb-6">
                <button 
                    onClick={() => setActiveTab('description')}
                    className={`px-6 py-3 font-medium transition-colors ${activeTab === 'description' ? 'border-b-2 border-blue-500 text-blue-400' : 'text-gray-400 hover:text-white'}`}
                >
                    Description
                </button>
                <button 
                    onClick={() => setActiveTab('reviews')}
                    className={`px-6 py-3 font-medium transition-colors ${activeTab === 'reviews' ? 'border-b-2 border-blue-500 text-blue-400' : 'text-gray-400 hover:text-white'}`}
                >
                    Reviews
                </button>
                <button 
                    onClick={() => setActiveTab('requirements')}
                    className={`px-6 py-3 font-medium transition-colors ${activeTab === 'requirements' ? 'border-b-2 border-blue-500 text-blue-400' : 'text-gray-400 hover:text-white'}`}
                >
                    System Req
                </button>
              </div>
              
              {activeTab === 'description' && (
                <div className="prose prose-invert max-w-none animate-fade-in">
                    <h3 className="text-xl font-bold text-white mb-4">About this product</h3>
                    <p className="text-gray-400 leading-relaxed mb-6 whitespace-pre-wrap">
                    {product.description}
                    </p>
                    
                    {product.features && product.features.length > 0 && (
                    <div className="mt-8">
                        <h4 className="text-lg font-bold text-white mb-4">Key Features:</h4>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {product.features.map((feature, idx) => (
                            <li key={idx} className="flex items-center text-gray-300 gap-2">
                            <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
                            <span>{feature}</span>
                            </li>
                        ))}
                        </ul>
                    </div>
                    )}
                </div>
              )}

              {activeTab === 'reviews' && (
                  <div className="animate-fade-in">
                      <h3 className="text-xl font-bold text-white mb-6">Customer Reviews</h3>
                      
                      {/* Review List */}
                      <div className="space-y-6 mb-10">
                          {product.reviews && product.reviews.length > 0 ? (
                              product.reviews.map((review) => (
                                  <div key={review.id} className="bg-background/50 p-4 rounded-xl border border-white/5">
                                      <div className="flex items-center justify-between mb-2">
                                          <div className="flex items-center gap-2">
                                              <div className="bg-blue-600/20 p-2 rounded-full">
                                                  <UserIcon size={16} className="text-blue-400" />
                                              </div>
                                              <div>
                                                  <span className="text-white font-medium block">{review.userName}</span>
                                                  <span className="text-xs text-gray-500 flex items-center gap-1">
                                                      <Calendar size={10} /> {review.date}
                                                  </span>
                                              </div>
                                          </div>
                                          <div className="flex text-yellow-400">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} className={i < review.rating ? "" : "text-gray-700"} />
                                            ))}
                                          </div>
                                      </div>
                                      <p className="text-gray-300 text-sm mb-3">{review.comment}</p>
                                      {review.imageUrl && (
                                          <div className="w-32 h-24 rounded-lg overflow-hidden bg-black/50 border border-white/10">
                                              <img src={review.imageUrl} alt="User Review" className="w-full h-full object-cover hover:scale-110 transition-transform cursor-pointer" onClick={() => window.open(review.imageUrl, '_blank')} />
                                          </div>
                                      )}
                                  </div>
                              ))
                          ) : (
                              <p className="text-gray-500 italic">No reviews yet. Be the first!</p>
                          )}
                      </div>

                      {/* Add Review Form */}
                      <div className="bg-blue-900/10 p-6 rounded-xl border border-blue-500/20">
                          <h4 className="text-lg font-bold text-white mb-4">Write a Review</h4>
                          <form onSubmit={submitReview} className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                  <div>
                                      <label className="block text-xs font-semibold text-gray-400 mb-1">Name</label>
                                      <input 
                                        type="text" 
                                        required
                                        className="w-full bg-background border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                        placeholder="Your Name"
                                        value={reviewForm.userName}
                                        onChange={e => setReviewForm({...reviewForm, userName: e.target.value})}
                                        disabled={!!user} // Disable if logged in
                                      />
                                  </div>
                                  <div>
                                      <label className="block text-xs font-semibold text-gray-400 mb-1">Rating</label>
                                      <div className="flex gap-1 py-2">
                                          {[1, 2, 3, 4, 5].map((star) => (
                                              <button
                                                key={star}
                                                type="button"
                                                onClick={() => setReviewForm({...reviewForm, rating: star})}
                                                className={`transition-transform hover:scale-110 ${reviewForm.rating >= star ? 'text-yellow-400' : 'text-gray-600'}`}
                                              >
                                                  <Star size={20} fill="currentColor" />
                                              </button>
                                          ))}
                                      </div>
                                  </div>
                              </div>
                              <div>
                                  <label className="block text-xs font-semibold text-gray-400 mb-1">Your Review</label>
                                  <textarea 
                                    required
                                    rows={3}
                                    className="w-full bg-background border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500 text-sm"
                                    placeholder="Tell us what you think..."
                                    value={reviewForm.comment}
                                    onChange={e => setReviewForm({...reviewForm, comment: e.target.value})}
                                  />
                              </div>
                              <div>
                                  <label className="block text-xs font-semibold text-gray-400 mb-1">Attach Photo (Optional)</label>
                                  <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg cursor-pointer transition-colors text-sm text-gray-300">
                                        <Upload size={16} /> Upload from PC
                                        <input type="file" accept="image/*" className="hidden" onChange={handleReviewImageUpload} />
                                    </label>
                                    {reviewImage && (
                                        <div className="relative w-10 h-10 rounded overflow-hidden border border-white/20">
                                            <img src={reviewImage} alt="Preview" className="w-full h-full object-cover" />
                                            <button type="button" onClick={() => setReviewImage(null)} className="absolute inset-0 bg-black/50 hover:bg-red-500/50 flex items-center justify-center text-white font-bold text-xs">X</button>
                                        </div>
                                    )}
                                  </div>
                              </div>
                              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors text-sm shadow-lg shadow-blue-900/20">
                                  Submit Review
                              </button>
                          </form>
                      </div>
                  </div>
              )}

              {activeTab === 'requirements' && (
                  <div className="animate-fade-in">
                      <h3 className="text-xl font-bold text-white mb-4">System Requirements</h3>
                      <div className="bg-background/50 p-6 rounded-xl border border-white/5 font-mono text-sm text-gray-300 whitespace-pre-wrap">
                          {product.systemRequirements || "No system requirements specified for this product."}
                      </div>
                  </div>
              )}

            </div>

            {/* Service Guarantees */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="bg-surface p-6 rounded-xl border border-white/5 flex gap-4">
                 <div className="bg-blue-600/10 p-3 rounded-lg h-fit text-blue-500">
                    <Zap size={24} />
                 </div>
                 <div>
                   <h4 className="font-bold text-white">Instant Delivery</h4>
                   <p className="text-sm text-gray-500 mt-1">Receive your digital code immediately after purchase.</p>
                 </div>
               </div>
               <div className="bg-surface p-6 rounded-xl border border-white/5 flex gap-4">
                 <div className="bg-green-600/10 p-3 rounded-lg h-fit text-green-500">
                    <ShieldCheck size={24} />
                 </div>
                 <div>
                   <h4 className="font-bold text-white">Secure Payment</h4>
                   <p className="text-sm text-gray-500 mt-1">Your transaction is protected by SSL encryption.</p>
                 </div>
               </div>
            </div>
          </div>

          {/* Right Column: Buy Box */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-surface rounded-2xl p-6 border border-white/5 shadow-xl">
              <h1 className="text-2xl font-bold text-white mb-2 leading-tight">{product.title}</h1>
              <div className="flex items-center gap-2 mb-6">
                <div className="flex text-yellow-400">
                  <Star size={16} fill="currentColor" />
                  {product.rating ? (
                      <span className="ml-1 text-white font-bold">{product.rating}</span>
                  ) : (
                      <span className="ml-1 text-white font-bold">5.0</span>
                  )}
                </div>
                <span className="text-sm text-gray-400">({product.reviews?.length || 0} Reviews)</span>
              </div>

              <div className="mb-8 p-4 bg-background/50 rounded-xl border border-white/5">
                <p className="text-sm text-gray-500 mb-1">Total Price</p>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-white">{formatPrice(product.price)}</span>
                  {product.oldPrice && (
                    <span className="text-lg text-gray-600 line-through">{formatPrice(product.oldPrice)}</span>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <button 
                    onClick={handleBuy}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-900/20 active:scale-95 flex items-center justify-center gap-2"
                >
                   Buy Now
                </button>
                <button 
                    onClick={handleAddToCart}
                    className="w-full bg-white/5 hover:bg-white/10 text-white font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-2 border border-white/5"
                >
                   <ShoppingCart size={18} />
                   Add to Cart
                </button>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 space-y-4">
                 <div className="flex items-center gap-3 text-sm text-gray-400">
                    <CheckCircle2 size={16} className="text-green-500" />
                    <span>In stock, ready to send</span>
                 </div>
                 <div className="flex items-center gap-3 text-sm text-gray-400">
                    <MessageCircle size={16} className="text-blue-500" />
                    <span>24/7 Support Available</span>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;