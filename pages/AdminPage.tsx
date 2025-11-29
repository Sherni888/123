import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Wand2, Loader2, Image as ImageIcon, List, Upload, X, Monitor } from 'lucide-react';
import { User, Product, Category } from '../types';
import { saveProduct, saveCategory, getCategories, getProducts, deleteProduct, deleteCategory, formatPrice } from '../services/storeService';
import { generateProductDescription } from '../services/geminiService';

interface AdminPageProps {
  user: User | null;
}

const AdminPage: React.FC<AdminPageProps> = ({ user }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'products' | 'categories'>('products');
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  // Product Form State
  const [newProduct, setNewProduct] = useState({
    title: '',
    price: '', // String to handle empty state better
    categoryId: '',
    imageUrls: '',
    description: '',
    features: 'Instant Delivery\nSecure Payment\nGlobal Activation', // Default value
    systemRequirements: ''
  });
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  
  // Category Form State
  const [newCategoryName, setNewCategoryName] = useState('');

  // AI Loading State
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!user || !user.isAdmin) {
      navigate('/login');
      return;
    }
    refreshData();
  }, [user, navigate]);

  const refreshData = () => {
    setCategories(getCategories());
    setProducts(getProducts());
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    
    saveCategory({
      id: Date.now().toString(),
      name: newCategoryName
    });
    setNewCategoryName('');
    refreshData();
  };

  const handleDeleteCategory = (id: string) => {
      if(window.confirm('Are you sure? Deleting a category does not delete its products but they will become uncategorized.')) {
          deleteCategory(id);
          refreshData();
      }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files) as File[];
      // Process each file
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          // Simple check to avoid duplicates if needed, but usually strictly append is fine
          setUploadedImages(prev => [...prev, result]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeUploadedImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.title || !newProduct.price || !newProduct.categoryId) {
        alert("Please fill in required fields");
        return;
    }

    // Process images (Text URLs + Uploaded Base64)
    const urlImages = newProduct.imageUrls.split('\n').map(url => url.trim()).filter(url => url.length > 0);
    const finalImages = [...urlImages, ...uploadedImages];

    if (finalImages.length === 0) {
        finalImages.push('https://picsum.photos/400/300'); // Fallback
    }

    // Process features
    const featuresList = newProduct.features.split('\n').map(f => f.trim()).filter(f => f.length > 0);

    const product: Product = {
      id: Date.now().toString(),
      title: newProduct.title,
      description: newProduct.description || '',
      price: Number(newProduct.price),
      images: finalImages,
      categoryId: newProduct.categoryId,
      features: featuresList,
      salesCount: 0,
      rating: 5.0,
      systemRequirements: newProduct.systemRequirements
    };

    try {
        saveProduct(product);
        
        // Reset form
        setNewProduct({
          title: '',
          price: '',
          categoryId: '',
          imageUrls: '',
          description: '',
          features: 'Instant Delivery\nSecure Payment\nGlobal Activation',
          systemRequirements: ''
        });
        setUploadedImages([]);
        refreshData();
    } catch (error) {
        console.error("Save error:", error);
        alert("Failed to save product. The images might be too large for your browser's local storage. Try using fewer images or external URLs.");
    }
  };

  const handleDeleteProduct = (id: string) => {
      if(window.confirm('Are you sure you want to delete this product?')) {
          deleteProduct(id);
          refreshData();
      }
  };

  const handleAiGenerate = async () => {
    if (!newProduct.title || !newProduct.categoryId) {
      alert("Please enter a title and select a category first.");
      return;
    }
    
    setIsGenerating(true);
    const catName = categories.find(c => c.id === newProduct.categoryId)?.name || 'Digital Good';
    const description = await generateProductDescription(
        newProduct.title, 
        catName, 
        "Instant delivery, High quality, Verified"
    );
    
    setNewProduct(prev => ({ ...prev, description }));
    setIsGenerating(false);
  };

  return (
    <div className="min-h-screen bg-background pb-20 pt-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Store Management</h1>
                <p className="text-gray-400">Welcome back, Owner.</p>
            </div>
            <button 
                onClick={() => navigate('/')} 
                className="text-sm text-blue-400 hover:text-white transition-colors border border-blue-500/30 px-4 py-2 rounded-lg"
            >
                View Store
            </button>
        </div>

        <div className="flex space-x-4 mb-8 border-b border-white/10">
          <button
            onClick={() => setActiveTab('products')}
            className={`pb-4 px-4 font-medium transition-colors border-b-2 ${activeTab === 'products' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-white'}`}
          >
            Products
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`pb-4 px-4 font-medium transition-colors border-b-2 ${activeTab === 'categories' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-white'}`}
          >
            Categories
          </button>
        </div>

        {activeTab === 'products' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Create Product Form */}
            <div className="lg:col-span-1 bg-surface p-6 rounded-2xl border border-white/5 h-fit sticky top-24 shadow-xl">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Plus size={20} className="text-blue-500" /> New Product
              </h2>
              
              {categories.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 border border-dashed border-white/10 rounded-xl">
                      <p className="mb-4">No categories found.</p>
                      <button 
                        onClick={() => setActiveTab('categories')}
                        className="text-blue-500 hover:underline font-medium"
                      >
                          Create a category first
                      </button>
                  </div>
              ) : (
                <form onSubmit={handleCreateProduct} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase">Title</label>
                        <input
                            type="text"
                            required
                            value={newProduct.title}
                            onChange={e => setNewProduct({...newProduct, title: e.target.value})}
                            className="w-full bg-background border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors"
                            placeholder="e.g., Elden Ring Key"
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase">Price (RUB)</label>
                            <input
                                type="number"
                                required
                                value={newProduct.price}
                                onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                                className="w-full bg-background border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                placeholder="0"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase">Category</label>
                            <select
                                required
                                value={newProduct.categoryId}
                                onChange={e => setNewProduct({...newProduct, categoryId: e.target.value})}
                                className="w-full bg-background border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors"
                            >
                                <option value="">Select...</option>
                                {categories.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase flex items-center gap-1">
                            <ImageIcon size={12} /> Images
                        </label>
                        
                        {/* URL Input */}
                        <textarea
                            rows={2}
                            value={newProduct.imageUrls}
                            onChange={e => setNewProduct({...newProduct, imageUrls: e.target.value})}
                            className="w-full bg-background border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500 text-xs font-mono mb-2"
                            placeholder="Paste external image URLs (one per line)..."
                        />

                        {/* File Upload */}
                        <div className="flex flex-col gap-2">
                            <label className="flex items-center justify-center gap-2 w-full bg-white/5 hover:bg-white/10 border border-dashed border-white/20 hover:border-blue-500/50 rounded-lg p-3 cursor-pointer transition-all group">
                                <Upload size={16} className="text-gray-400 group-hover:text-blue-400 transition-colors" />
                                <span className="text-sm text-gray-400 group-hover:text-gray-200">Upload from PC</span>
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    multiple 
                                    className="hidden" 
                                    onChange={handleImageUpload}
                                />
                            </label>

                            {/* Previews */}
                            {uploadedImages.length > 0 && (
                                <div className="grid grid-cols-4 gap-2 mt-1">
                                    {uploadedImages.map((img, idx) => (
                                        <div key={idx} className="relative aspect-square group bg-black rounded-lg">
                                            <img src={img} alt="Preview" className="w-full h-full object-cover rounded-lg border border-white/10 opacity-70 group-hover:opacity-100 transition-opacity" />
                                            <button 
                                                type="button"
                                                onClick={() => removeUploadedImage(idx)}
                                                className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 shadow-lg hover:bg-red-600 transition-colors transform scale-0 group-hover:scale-100"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase flex items-center gap-1">
                            <List size={12} /> Key Features
                        </label>
                        <textarea
                            rows={3}
                            value={newProduct.features}
                            onChange={e => setNewProduct({...newProduct, features: e.target.value})}
                            className="w-full bg-background border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500 text-xs"
                            placeholder="Instant Delivery&#10;Global Key"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase flex items-center gap-1">
                            <Monitor size={12} /> System Requirements
                        </label>
                        <textarea
                            rows={3}
                            value={newProduct.systemRequirements}
                            onChange={e => setNewProduct({...newProduct, systemRequirements: e.target.value})}
                            className="w-full bg-background border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500 text-xs"
                            placeholder="OS: Windows 10&#10;Processor: Intel Core i5&#10;Memory: 8GB RAM"
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-xs font-semibold text-gray-400 uppercase">Description</label>
                            <button 
                                type="button" 
                                onClick={handleAiGenerate}
                                disabled={isGenerating}
                                className="text-xs flex items-center gap-1 text-blue-400 hover:text-blue-300 disabled:opacity-50 transition-colors"
                            >
                                {isGenerating ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
                                Generate with AI
                            </button>
                        </div>
                        <textarea
                            rows={4}
                            value={newProduct.description}
                            onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                            className="w-full bg-background border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500 text-sm"
                            placeholder="Product description..."
                        />
                    </div>

                    <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-900/20 active:scale-95"
                    >
                    Publish Product
                    </button>
                </form>
              )}
            </div>

            {/* Product List */}
            <div className="lg:col-span-2">
                 <h2 className="text-xl font-bold text-white mb-6">Inventory ({products.length})</h2>
                 <div className="space-y-4">
                     {products.length === 0 && (
                         <div className="text-center py-12 bg-surface/50 rounded-2xl border border-white/5 border-dashed">
                             <p className="text-gray-500">Inventory is empty.</p>
                             <p className="text-gray-600 text-sm mt-1">Add your first product using the form.</p>
                         </div>
                     )}
                     {products.map(p => (
                         <div key={p.id} className="bg-surface p-4 rounded-xl border border-white/5 flex gap-4 items-center group hover:border-blue-500/30 transition-all">
                             <div className="h-20 w-28 bg-black rounded-lg overflow-hidden flex-shrink-0 relative">
                                 <img 
                                    src={p.images && p.images[0] ? p.images[0] : 'https://picsum.photos/100'} 
                                    alt={p.title} 
                                    className="w-full h-full object-cover" 
                                 />
                             </div>
                             <div className="flex-grow min-w-0">
                                 <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-white truncate">{p.title}</h3>
                                    <span className="text-[10px] bg-white/10 text-gray-400 px-1.5 py-0.5 rounded font-mono">
                                        ID: {p.id.slice(-6)}
                                    </span>
                                 </div>
                                 <p className="text-sm text-gray-500 mb-1">{categories.find(c => c.id === p.categoryId)?.name || 'Unknown Category'}</p>
                                 <p className="text-xs text-gray-600 truncate">{p.features.slice(0, 2).join(', ')}</p>
                             </div>
                             <div className="text-right mx-2">
                                 <p className="font-bold text-blue-400 text-lg">{formatPrice(p.price)}</p>
                             </div>
                             <button 
                                onClick={() => handleDeleteProduct(p.id)}
                                className="p-3 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                title="Delete Product"
                             >
                                 <Trash2 size={20} />
                             </button>
                         </div>
                     ))}
                 </div>
            </div>
          </div>
        ) : (
          <div className="max-w-xl mx-auto">
             <div className="bg-surface p-8 rounded-2xl border border-white/5 mb-8 shadow-xl">
                <h2 className="text-xl font-bold text-white mb-6">Create New Category</h2>
                <form onSubmit={handleCreateCategory} className="flex gap-3">
                    <input
                        type="text"
                        value={newCategoryName}
                        onChange={e => setNewCategoryName(e.target.value)}
                        className="flex-grow bg-background border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                        placeholder="Category Name (e.g., Steam Keys)"
                    />
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-8 rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20 active:scale-95">
                        Add
                    </button>
                </form>
             </div>

             <div className="space-y-3">
                 <h3 className="text-lg font-bold text-gray-400 mb-4 px-2">Active Categories</h3>
                 {categories.map(c => (
                     <div key={c.id} className="bg-surface p-5 rounded-xl border border-white/5 text-white flex justify-between items-center group hover:border-blue-500/30 transition-all">
                         <span className="font-medium text-lg">{c.name}</span>
                         <div className="flex items-center gap-4">
                             <button 
                                onClick={() => handleDeleteCategory(c.id)}
                                className="text-gray-500 hover:text-red-500 p-2 hover:bg-red-500/10 rounded-lg transition-all"
                             >
                                 <Trash2 size={20} />
                             </button>
                         </div>
                     </div>
                 ))}
                 {categories.length === 0 && <p className="text-center text-gray-500 py-8">No categories created yet.</p>}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;