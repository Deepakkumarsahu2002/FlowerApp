// Utility functions for converting between API and Admin frontend formats
import { Product as ApiProduct, CreateProductRequest } from './api';
import { Product as AdminProduct } from '@/types/admin';

// Convert API product to Admin Product format
export function convertApiProductToAdmin(apiProduct: ApiProduct): AdminProduct {
  return {
    id: apiProduct._id,
    name: apiProduct.name,
    price: apiProduct.price,

    // ✅ FIX: take images directly from API product
    images: apiProduct.images,

    // Use category name
    category: apiProduct.category_id.name,

    // Use occasion names
    occasions: apiProduct.occasions.map((occ) => occ.name),

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
    images: string[];
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

    // ✅ FIX: send images array to backend
    images: formData.images.length
      ? formData.images
      : ['https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400'],

    description: formData.description,

    // Use ID if provided, otherwise assume it's already an ID
    category_id: categoryId || formData.category,

    // Use IDs if provided, otherwise assume they're IDs
    occasions: occasionIds || formData.occasions,

    in_stock: formData.inStock,
  };
}
