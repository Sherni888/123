import { Product, Category, Review, User } from '../types';

const PRODUCTS_KEY = 'ggsale_products';
const CATEGORIES_KEY = 'ggsale_categories';
const USERS_KEY = 'ggsale_users';

// Store starts empty as requested
const INITIAL_CATEGORIES: Category[] = [];
const INITIAL_PRODUCTS: Product[] = [];

// Hardcoded Admin Credentials
const ADMIN_USER = 'Sherni134356';
const ADMIN_PASS = 'Sherni134356';

export const getCategories = (): Category[] => {
  const stored = localStorage.getItem(CATEGORIES_KEY);
  if (!stored) {
    return INITIAL_CATEGORIES;
  }
  return JSON.parse(stored);
};

export const saveCategory = (category: Category) => {
  const categories = getCategories();
  const newCategories = [...categories, category];
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(newCategories));
};

export const deleteCategory = (id: string) => {
  const categories = getCategories();
  const newCategories = categories.filter(c => c.id !== id);
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(newCategories));
};

export const getProducts = (): Product[] => {
  const stored = localStorage.getItem(PRODUCTS_KEY);
  if (!stored) {
    return INITIAL_PRODUCTS;
  }
  return JSON.parse(stored);
};

export const getProductById = (id: string): Product | undefined => {
  const products = getProducts();
  return products.find(p => p.id === id);
};

export const saveProduct = (product: Product) => {
  const products = getProducts();
  const newProducts = [...products, product];
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(newProducts));
};

export const deleteProduct = (id: string) => {
    const products = getProducts();
    const newProducts = products.filter(p => p.id !== id);
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(newProducts));
};

export const addProductReview = (productId: string, review: Review) => {
  const products = getProducts();
  const productIndex = products.findIndex(p => p.id === productId);
  
  if (productIndex !== -1) {
    const product = products[productIndex];
    const existingReviews = product.reviews || [];
    const newReviews = [review, ...existingReviews];
    
    // Recalculate rating
    const totalRating = newReviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = parseFloat((totalRating / newReviews.length).toFixed(1));
    
    const updatedProduct = {
      ...product,
      reviews: newReviews,
      rating: averageRating
    };
    
    products[productIndex] = updatedProduct;
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
    return updatedProduct;
  }
  return null;
};

export const formatPrice = (price: number) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
  }).format(price);
};

// --- AUTHENTICATION ---

export const authenticateUser = (username: string, password: string): User | null => {
    // 1. Check Admin
    if (username === ADMIN_USER && password === ADMIN_PASS) {
        return { username, isAdmin: true };
    }

    // 2. Check Registered Users
    const storedUsersStr = localStorage.getItem(USERS_KEY);
    const storedUsers = storedUsersStr ? JSON.parse(storedUsersStr) : [];
    
    const user = storedUsers.find((u: any) => u.username === username && u.password === password);
    if (user) {
        return { username: user.username, isAdmin: false };
    }

    return null;
};

export const registerUser = (username: string, password: string): boolean => {
    // Check if matches admin
    if (username === ADMIN_USER) return false;

    const storedUsersStr = localStorage.getItem(USERS_KEY);
    const storedUsers = storedUsersStr ? JSON.parse(storedUsersStr) : [];

    // Check if already exists
    if (storedUsers.find((u: any) => u.username === username)) {
        return false;
    }

    const newUser = { username, password }; // Note: In a real app, hash this password
    storedUsers.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(storedUsers));
    return true;
};
