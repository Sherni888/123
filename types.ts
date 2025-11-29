export interface Category {
  id: string;
  name: string;
  icon?: string; // Icon name from Lucide
}

export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  imageUrl?: string; // Base64 of uploaded image
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  oldPrice?: number;
  images: string[]; // Array of image URLs
  categoryId: string;
  features: string[]; // List of bullet points
  salesCount?: number;
  rating?: number;
  systemRequirements?: string;
  reviews?: Review[];
}

export interface User {
  username: string;
  isAdmin: boolean;
}