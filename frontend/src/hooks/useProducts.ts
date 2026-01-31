import { useState, useEffect } from 'react';
import { api, Product as ApiProduct } from '@/lib/api';
import { Product } from '@/types';
import { toast } from 'sonner';

// Convert API product to frontend Product type
const convertProduct = (apiProduct: ApiProduct): Product => {
  return {
    id: apiProduct._id,
    name: apiProduct.name,
    price: apiProduct.price,
    image: apiProduct.image,
    category: apiProduct.category_id.name.toLowerCase().replace(/\s+/g, '-') as Product['category'],
    occasions: apiProduct.occasions.map(occ => occ.name.toLowerCase().replace(/\s+/g, '-') as Product['occasions'][0]),
    description: apiProduct.description,
    inStock: apiProduct.in_stock,
  };
};

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const apiProducts = await api.getProducts();
      const convertedProducts = apiProducts.map(convertProduct);
      setProducts(convertedProducts);
    } catch (err: any) {
      console.error('Error fetching products:', err);
      setError(err.message || 'Failed to load products');
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  return { products, loading, error, refetch: fetchProducts };
}

export function useProduct(id: string | undefined) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchProduct(id);
    } else {
      setLoading(false);
    }
  }, [id]);

  const fetchProduct = async (productId: string) => {
    try {
      setLoading(true);
      setError(null);
      const apiProduct = await api.getProduct(productId);
      const convertedProduct = convertProduct(apiProduct);
      setProduct(convertedProduct);
    } catch (err: any) {
      console.error('Error fetching product:', err);
      setError(err.message || 'Failed to load product');
      toast.error('Product not found');
    } finally {
      setLoading(false);
    }
  };

  return { product, loading, error };
}
