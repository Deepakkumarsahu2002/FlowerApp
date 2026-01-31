import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, total, itemCount } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 animate-fade-in">
        <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="font-display text-2xl font-bold text-foreground mb-2">
          Your Cart is Empty
        </h1>
        <p className="text-muted-foreground mb-6">
          Start adding beautiful flowers to your cart!
        </p>
        <Link to="/categories">
          <Button>
            Browse Collection
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="container px-4 md:px-8 py-8 md:py-16">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-8">
          Shopping Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.product.id}
                className="flex gap-4 p-4 bg-card rounded-xl shadow-soft"
              >
                {/* ✅ PRODUCT IMAGE ONLY */}
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-24 h-24 object-cover rounded-lg"
                />

                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-semibold text-foreground truncate">
                    {item.product.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    ₹{item.product.price.toLocaleString()} each
                  </p>

                  <div className="flex items-center gap-2 mt-3">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() =>
                        updateQuantity(item.product.id, item.quantity - 1)
                      }
                    >
                      <Minus className="h-3 w-3" />
                    </Button>

                    <span className="w-8 text-center text-sm font-medium">
                      {item.quantity}
                    </span>

                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() =>
                        updateQuantity(item.product.id, item.quantity + 1)
                      }
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col items-end justify-between">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => removeFromCart(item.product.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>

                  <p className="font-display font-bold text-foreground">
                    ₹{(item.product.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl shadow-soft p-6 sticky top-24">
              <h2 className="font-display text-xl font-bold text-foreground mb-4">
                Order Summary
              </h2>

              <div className="space-y-3 border-b border-border pb-4 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">
                    ₹{total.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="text-sage font-medium">Free</span>
                </div>
              </div>

              <div className="flex justify-between mb-6">
                <span className="font-display font-semibold text-foreground">
                  Total
                </span>
                <span className="font-display text-xl font-bold text-primary">
                  ₹{total.toLocaleString()}
                </span>
              </div>

              <Button className="w-full" size="lg" onClick={handleCheckout}>
                {isAuthenticated ? 'Proceed to Checkout' : 'Login to Checkout'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>

              {!isAuthenticated && (
                <p className="text-xs text-muted-foreground text-center mt-3">
                  You need to be logged in to place an order
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
