// API Base Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Log API base URL for debugging
console.log("Admin API Base URL:", API_BASE_URL);

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export interface LoginResponse {
  token: string;
}

export interface AdminUser {
  _id: string;
  email: string;
  name: string;
  role: string;
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
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProductRequest {
  name: string;
  price: number;
  image: string;
  description: string;
  category_id: string;
  occasions: string[];
  in_stock?: boolean;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {}

export interface Order {
  _id: string;
  order_number: string;
  user_id: {
    _id: string;
    name: string;
    email: string;
  };
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
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateOrderStatusRequest {
  status: string;
}

// Helper function to get auth token
const getToken = (): string | null => {
  return localStorage.getItem('adminToken');
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
    // Only login endpoint doesn't need auth, all others do
    const needsAuth = endpoint !== '/auth/login';
    const response = await fetch(url, {
      ...options,
      headers: {
        ...getHeaders(needsAuth),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      const errorMessage = error.message || `HTTP error! status: ${response.status}`;
      const errorWithStatus = new Error(errorMessage);
      (errorWithStatus as any).status = response.status;
      (errorWithStatus as any).statusText = response.statusText;
      throw errorWithStatus;
    }

    return response.json();
  }

  // Auth APIs
  async login(data: { email: string; password: string }): Promise<LoginResponse> {
    return this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMe(): Promise<AdminUser> {
    return this.request<AdminUser>('/auth/me');
  }

  // Product APIs
  async getProducts(): Promise<Product[]> {
    return this.request<Product[]>('/products');
  }

  async getProduct(id: string): Promise<Product> {
    return this.request<Product>(`/products/${id}`);
  }

  async createProduct(data: CreateProductRequest): Promise<Product> {
    return this.request<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProduct(id: string, data: UpdateProductRequest): Promise<Product> {
    return this.request<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProduct(id: string): Promise<ApiResponse<null>> {
    return this.request<ApiResponse<null>>(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  // Order APIs
  async getOrders(): Promise<Order[]> {
    return this.request<Order[]>('/orders');
  }

  async updateOrderStatus(id: string, data: UpdateOrderStatusRequest): Promise<Order> {
    return this.request<Order>(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

    async updatePaymentStatus(id: string, data: UpdateOrderStatusRequest): Promise<Order> {
    return this.request<Order>(`/orders/${id}/cod-payment`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Category & Occasion APIs
  async getCategories(): Promise<Array<{ _id: string; name: string }>> {
    return this.request<Array<{ _id: string; name: string }>>('/categories');
  }

  async getOccasions(): Promise<Array<{ _id: string; name: string }>> {
    return this.request<Array<{ _id: string; name: string }>>('/occasions');
  }
}

// Export singleton instance
export const api = new ApiClient(API_BASE_URL);
