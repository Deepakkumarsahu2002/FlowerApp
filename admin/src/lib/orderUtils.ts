// Utility functions for converting between API and Admin frontend formats
import { Order as ApiOrder } from './api';
import { Order as AdminOrder } from '@/types/admin';

// Convert API order to Admin Order format
export function convertApiOrderToAdmin(apiOrder: ApiOrder): AdminOrder {
  const subtotal = apiOrder.items.reduce((sum, item) => sum + (item.price_at_purchase * item.quantity), 0);
  const shippingCost = apiOrder.total_amount - subtotal; // Calculate shipping from total
  
  return {
    id: apiOrder._id,
    userId: apiOrder.user_id._id,
    userName: apiOrder.user_id.name,
    userEmail: apiOrder.user_id.email,
    items: apiOrder.items.map(item => ({
      productId: item.product_id._id,
      productName: item.product_id.name,
      quantity: item.quantity,
      price: item.price_at_purchase,
      image: item.product_id.image,
    })),
    shippingAddress: apiOrder.shipping_address ? {
      street: apiOrder.shipping_address.street,
      city: apiOrder.shipping_address.city,
      state: apiOrder.shipping_address.state,
      pincode: apiOrder.shipping_address.pincode,
      country: 'India', // Default or from API if available
    } : {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
    },
    paymentMethod: apiOrder.payment_status === 'paid' ? 'razorpay' : 'cod',
    paymentStatus: apiOrder.payment_status,
    orderStatus: apiOrder.order_status === 'created' ? 'pending' : apiOrder.order_status as AdminOrder['orderStatus'],
    subtotal: subtotal,
    shippingCost: shippingCost > 0 ? shippingCost : 50, // Use calculated or default
    totalAmount: apiOrder.total_amount,
    razorpayOrderId: apiOrder.razorpay_order_id,
    razorpayPaymentId: apiOrder.razorpay_payment_id,
    createdAt: apiOrder.createdAt,
    updatedAt: apiOrder.updatedAt,
  };
}
