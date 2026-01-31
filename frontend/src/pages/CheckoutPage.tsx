import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { CreditCard, Banknote, ArrowLeft, Truck } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import jumboBouquet from '@/assets/jumbo-bouquet.jpg';
import smallBouquet from '@/assets/small-bouquet.jpg';
import miniBouquet from '@/assets/mini-bouquet.jpg';
import customBouquet from '@/assets/custom-bouquet.jpg';
import flowerPot from '@/assets/flower-pot.jpg';

// Declare Razorpay types
declare global {
  interface Window {
    Razorpay: any;
  }
}

const categoryImages: Record<string, string> = {
  'jumbo-bouquet': jumboBouquet,
  'small-bouquet': smallBouquet,
  'mini-bouquets': miniBouquet,
  'custom-bouquet': customBouquet,
  'flower-pots': flowerPot,
};

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    notes: '',
  });

  // Load Razorpay script
  useEffect(() => {
    if (paymentMethod === 'online' && !window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
      
      return () => {
        document.body.removeChild(script);
      };
    }
  }, [paymentMethod]);

  if (!isAuthenticated) {
    navigate('/auth');
    return null;
  }

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.phone || !formData.address || !formData.city || !formData.state || !formData.pincode) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      // Calculate shipping cost (free for now, but can be dynamic)
      const shippingCost = 0; // You can make this dynamic based on location
      const subtotal = total;
      const totalAmount = subtotal + shippingCost;

      // Prepare order items
      const orderItems = items.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
        price_at_purchase: item.product.price,
      }));

      // Create order in backend
      const order = await api.createOrder({
        items: orderItems,
        subtotal,
        shipping_cost: shippingCost,
        total_amount: totalAmount,
        payment_method: paymentMethod, // Send payment method: 'cod' or 'online'
        address: {
          name: formData.name,
          phone: formData.phone,
          street: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
        },
      });

      if (paymentMethod === 'online') {
        // Validate Razorpay key
        const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
        if (!razorpayKeyId || razorpayKeyId === '') {
          toast.error('Razorpay is not configured. Please set VITE_RAZORPAY_KEY_ID in your .env file.');
          setLoading(false);
          return;
        }

        // Create Razorpay order
        let razorpayOrder;
        try {
          razorpayOrder = await api.createRazorpayOrder(order._id);
        } catch (error: any) {
          console.error('Error creating Razorpay order:', error);
          if (error.status === 401 || error.message?.includes('RAZORPAY_AUTH_ERROR')) {
            toast.error('Razorpay authentication failed. Please check your API keys in backend .env file.');
          } else {
            toast.error(error.message || 'Failed to create payment order. Please try again.');
          }
          setLoading(false);
          return;
        }

        // Open Razorpay checkout
        if (!window.Razorpay) {
          toast.error('Payment gateway is loading. Please try again.');
          setLoading(false);
          return;
        }

        const options = {
          key: razorpayKeyId,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          name: 'FlowersForever',
          description: `Order ${order.order_number}`,
          order_id: razorpayOrder.id,
          handler: async function (response: any) {
            try {
              // Verify payment
              await api.verifyRazorpayPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId: order._id,
              });

              toast.success('Payment successful!');
              clearCart();
              navigate('/order-confirmation', { state: { orderId: order._id } });
            } catch (error: any) {
              console.error('Payment verification error:', error);
              toast.error(error.message || 'Payment verification failed');
            } finally {
              setLoading(false);
            }
          },
          prefill: {
            name: formData.name,
            email: formData.email,
            contact: formData.phone,
          },
          theme: {
            color: '#c13d6b',
          },
          modal: {
            ondismiss: function() {
              setLoading(false);
              toast.info('Payment cancelled');
            },
          },
        };

        try {
          const rzp = new window.Razorpay(options);
          
          // Handle payment failures
          rzp.on('payment.failed', function (response: any) {
            console.error('Razorpay payment failed:', response);
            toast.error(`Payment failed: ${response.error?.description || response.error?.reason || 'Unknown error'}`);
            setLoading(false);
          });

          // Handle Razorpay errors (like 401 authentication errors)
          rzp.on('error', function (error: any) {
            console.error('Razorpay error:', error);
            if (error.error?.code === 'BAD_REQUEST_ERROR' || error.error?.code === 'UNAUTHORIZED') {
              toast.error('Razorpay authentication failed. Please check your API key configuration.');
            } else {
              toast.error(`Payment error: ${error.error?.description || error.error?.reason || 'Unknown error'}`);
            }
            setLoading(false);
          });

          rzp.open();
        } catch (error: any) {
          console.error('Error initializing Razorpay:', error);
          toast.error('Failed to initialize payment gateway. Please check your Razorpay configuration.');
          setLoading(false);
        }
      } else {
        // COD order - already created, just redirect
        toast.success('Order placed successfully!');
        clearCart();
        navigate('/order-confirmation', { state: { orderId: order._id } });
        setLoading(false);
      }
    } catch (error: any) {
      console.error('Order creation error:', error);
      toast.error(error.message || 'Failed to create order. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="container px-4 md:px-8 py-8 md:py-16">
        <Link to="/cart" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Cart
        </Link>

        <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-8">
          Checkout
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2 space-y-8">
              {/* Delivery Details */}
              <div className="bg-card rounded-xl shadow-soft p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Truck className="h-5 w-5 text-primary" />
                  <h2 className="font-display text-xl font-bold text-foreground">Delivery Details</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Delivery Address *</Label>
                    <Textarea
                      id="address"
                      name="address"
                      placeholder="Street address, City, etc."
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">State *</Label>
                    <Input
                      id="city"
                      name="city"
                      placeholder="Maharashtra"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">PIN Code *</Label>
                    <Input
                      id="state"
                      name="state"
                      placeholder="400001"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pincode">Delivery Contact Number *</Label>
                    <Input
                      id="pincode"
                      name="pincode"
                      placeholder="+91 98765 43210"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="notes">Delivery Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      placeholder="Any special instructions for delivery..."
                      value={formData.notes}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-card rounded-xl shadow-soft p-6">
                <h2 className="font-display text-xl font-bold text-foreground mb-6">Payment Method</h2>
                
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(val) => setPaymentMethod(val as 'cod' | 'online')}
                  className="space-y-4"
                >
                  <div className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-colors cursor-pointer ${paymentMethod === 'cod' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod" className="flex items-center gap-3 cursor-pointer flex-1">
                      <Banknote className="h-5 w-5 text-sage" />
                      <div>
                        <p className="font-medium text-foreground">Cash on Delivery</p>
                        <p className="text-sm text-muted-foreground">Pay when you receive your order</p>
                      </div>
                    </Label>
                  </div>
                  
                  <div className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-colors cursor-pointer ${paymentMethod === 'online' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                    <RadioGroupItem value="online" id="online" />
                    <Label htmlFor="online" className="flex items-center gap-3 cursor-pointer flex-1">
                      <CreditCard className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium text-foreground">Pay Online (Razorpay)</p>
                        <p className="text-sm text-muted-foreground">UPI, Cards, Net Banking, Wallets</p>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-xl shadow-soft p-6 sticky top-24">
                <h2 className="font-display text-xl font-bold text-foreground mb-4">Order Summary</h2>
                
                <div className="space-y-4 border-b border-border pb-4 mb-4 max-h-60 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex gap-3">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground text-sm truncate">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        <p className="text-sm font-medium text-foreground">
                          ₹{(item.product.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 border-b border-border pb-4 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">₹{total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery</span>
                    <span className="text-foreground">₹Free</span>
                  </div>
                </div>

                <div className="flex justify-between mb-6">
                  <span className="font-display font-semibold text-foreground">Total</span>
                  <span className="font-display text-xl font-bold text-primary">
                    ₹{(total + 0).toLocaleString()}
                  </span>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? 'Processing...' : paymentMethod === 'cod' ? 'Place Order (COD)' : 'Pay with Razorpay'}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
