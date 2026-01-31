// Utility functions for converting between API and Admin frontend formats
import { Product as ApiProduct, CreateProductRequest } from './api';
import { Product as AdminProduct } from '@/types/admin';

// Convert API product to Admin Product format
export function convertApiProductToAdmin(apiProduct: ApiProduct): AdminProduct {
  return {
    id: apiProduct._id,
    name: apiProduct.name,
    price: apiProduct.price,
    image: apiProduct.image,
    category: apiProduct.category_id.name, // Use category name
    occasions: apiProduct.occasions.map(occ => occ.name), // Use occasion names
    description: apiProduct.description,
    inStock: apiProduct.in_stock,
    createdAt: apiProduct.createdAt || new Date().toISOString(),
    updatedAt: apiProduct.updatedAt || new Date().toISOString(),
  };
}

// Convert Admin Product form data to API CreateProductRequest
// Note: This assumes category_id and occasions are passed as IDs
// You may need to fetch categories/occasions first to get their IDs
export function convertAdminProductToApi(
  formData: {
    name: string;
    price: string;
    image: string;
    category: string;
    occasions: string[];
    description: string;
    inStock: boolean;
  },
  categoryId?: string, // If you have category ID mapping
  occasionIds?: string[] // If you have occasion ID mapping
): CreateProductRequest {
  return {
    name: formData.name,
    price: parseFloat(formData.price),
    image: formData.image || 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400',
    description: formData.description,
    category_id: categoryId || formData.category, // Use ID if provided, otherwise assume it's an ID
    occasions: occasionIds || formData.occasions, // Use IDs if provided, otherwise assume they're IDs
    in_stock: formData.inStock,
  };
}
