import { Address } from "cluster";

// API Base Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export interface LoginResponse {
  token: string;
}

export interface User {
  _id: string;
  email: string;
  name: string;
  phone?: string;
}

export interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  in_stock: boolean;
  category_id: {
    _id: string;
    name: string;
  };
  occasions: Array<{
    _id: string;
    name: string;
  }>;
}

export interface OrderItem {
  product_id: string;
  quantity: number;
  price_at_purchase: number;
}

export interface CreateOrderRequest {
  items: OrderItem[];
  subtotal: number;
  shipping_cost: number;
  total_amount: number;
  payment_method?: 'cod' | 'online' | 'razorpay'; // Payment method: 'cod' for Cash on Delivery, 'online'/'razorpay' for online payment
  address_id?: string;
  address?: {
    name: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
}

export interface Order {
  _id: string;
  order_number: string;
  payment_status: 'pending' | 'paid' | 'failed';
  order_status: 'created' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  items: Array<{
    product_id: {
      _id: string;
      name: string;
      image: string;
      price: number;
    };
    quantity: number;
    price_at_purchase: number;
  }>;
  shipping_address?: {
    name: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
}

export interface RazorpayVerifyRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  orderId: string;
}

export interface UserProfileResponse {
  _id: string;
  email: string;
  profile: {
    name: string;
    phone: string;
    last_login?: string;
  } | null;
  addresses: Array<{
    _id: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    is_default: boolean;
  }>;
}

export interface AddressDTO {
  _id: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
}


// Helper function to get auth token
const getToken = (): string | null => {
  return localStorage.getItem('token');
};

// Helper function to get headers
const getHeaders = (includeAuth = true): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (includeAuth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
};

// API Client
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        ...getHeaders(options.method !== 'GET' || endpoint.includes('/auth/me')),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Auth APIs
  async signup(data: { email: string; password: string; name: string; phone?: string }): Promise<ApiResponse<null>> {
    return this.request<ApiResponse<null>>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: { email: string; password: string }): Promise<LoginResponse> {
    return this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMe(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  async getMyProfile(): Promise<UserProfileResponse> {
  return this.request<UserProfileResponse>('/users/me');
  }

  async updateMyProfile(data: { name: string; phone: string }) {
  return this.request<{ message: string; profile: { name: string; phone: string } }>(
    '/users/me',
    {
      method: 'PUT',
      body: JSON.stringify(data),
    }
  );
  }

  
  async addAddress(data: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  }): Promise<AddressDTO> {
    return this.request<AddressDTO>('/addresses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAddress(
    id: string,
    data: { street: string; city: string; state: string; pincode: string }
  ): Promise<AddressDTO> {
    return this.request<AddressDTO>(`/addresses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAddress(id: string) {
    return this.request<{ message: string }>(`/addresses/${id}`, {
      method: 'DELETE',
    });
  }

  async setDefaultAddress(id: string): Promise<AddressDTO> {
    return this.request<AddressDTO>(`/addresses/${id}/default`, {
      method: 'PATCH',
    });
  }

  // Product APIs
  async getProducts(): Promise<Product[]> {
    return this.request<Product[]>('/products');
  }

  async getProduct(id: string): Promise<Product> {
    return this.request<Product>(`/products/${id}`);
  }

  // Order APIs
  async createOrder(data: CreateOrderRequest): Promise<Order> {
    return this.request<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMyOrders(): Promise<Order[]> {
    return this.request<Order[]>('/orders/my');
  }

  // Payment APIs
  async createRazorpayOrder(orderId: string): Promise<RazorpayOrder> {
    return this.request<RazorpayOrder>('/payment/razorpay/create', {
      method: 'POST',
      body: JSON.stringify({ orderId }),
    });
  }

  async verifyRazorpayPayment(data: RazorpayVerifyRequest): Promise<ApiResponse<null>> {
    return this.request<ApiResponse<null>>('/payment/razorpay/verify', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

// Export singleton instance
export const api = new ApiClient(API_BASE_URL);
