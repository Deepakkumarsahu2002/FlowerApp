export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: Category;
  occasions: Occasion[];
  description: string;
  inStock: boolean;
}

export type Category = 'jumbo-bouquet' | 'small-bouquet' | 'mini-bouquets' | 'custom-bouquet' | 'flower-pots';

export type Occasion = 'anniversary' | 'birthday' | 'valentines' | 'sorry' | 'congratulations' | 'get-well';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  paymentMethod: 'cod' | 'online';
  status: 'pending' | 'confirmed' | 'delivered';
  createdAt: Date;
}
