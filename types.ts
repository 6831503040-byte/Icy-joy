
export interface IceCream {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: 'Classic' | 'Special' | 'Fruity';
  rating: number;
  color: string;
}

export type View = 'home' | 'menu' | 'login' | 'details' | 'cart' | 'ai-match' | 'profile' | 'payment' | 'order-status';

export interface Address {
  id: string;
  label: string; // e.g., "Home", "Office"
  name: string;
  phone: string;
  details: string;
}

export interface User {
  name: string;
  email: string;
  avatar: string;
  points: number;
  addresses?: Address[];
}

export type ServingFormat = 'Scoop' | 'Quart';
export type ServingSize = 'S' | 'M' | 'L';

export interface CartItem {
  iceCream: IceCream;
  quantity: number;
  format: ServingFormat;
  size: ServingSize;
  finalPrice: number;
}

export type OrderStage = 'ordered' | 'preparing' | 'delivery' | 'delivered';

export interface Order {
  id: string;
  date: string;
  createdAt: number; // Timestamp for tracking
  items: CartItem[];
  total: number;
  status?: OrderStage;
}
