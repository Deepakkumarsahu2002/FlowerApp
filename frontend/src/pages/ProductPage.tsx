import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { useProduct } from '@/hooks/useProducts';
import {
  ArrowLeft,
  ShoppingBag,
  Minus,
  Plus,
  Check,
  Loader2,
} from 'lucide-react';
import { useState } from 'react';

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { product, loading } = useProduct(id);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (loading) {
    return (
      <div className="container px-4 py-24 text-center">
        <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground text-sm">
          Loading product details…
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container px-4 py-24 text-center">
        <h1 className="text-2xl font-bold mb-3">Product Not Found</h1>
        <Link to="/categories" className="text-primary hover:underline">
          ← Back to Shop
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="animate-fade-in bg-muted/30">
      <div className="container px-4 md:px-8 py-10 md:py-16">

        {/* BACK */}
        <Link
          to="/categories"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-10"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Shop
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20">

          {/* IMAGE CARD (UPDATED FOR MULTIPLE IMAGES) */}
          <div className="rounded-3xl overflow-hidden shadow-xl bg-background">
            <div className="flex overflow-x-auto snap-x snap-mandatory">
              {product.images.map((img: string, index: number) => (
                <div key={index} className="min-w-full snap-center">
                  <img
                    src={img}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* DETAILS CARD */}
          <div className="bg-background rounded-3xl shadow-lg p-6 md:p-8 space-y-6">

            {/* CATEGORY + TITLE */}
            <div>
              <span className="inline-block text-xs font-medium px-3 py-1 rounded-full bg-primary/10 text-primary mb-3">
                {product.category_id?.name || 'Product Details'}
              </span>
              <h1 className="text-3xl md:text-4xl font-bold leading-tight">
                {product.name}
              </h1>
            </div>

            {/* PRICE */}
            <p className="text-4xl font-extrabold text-primary">
              ₹{product.price.toLocaleString()}
            </p>

            {/* DESCRIPTION */}
            <p className="text-muted-foreground leading-relaxed text-sm">
              {product.description || 'No description available.'}
            </p>

            {/* STOCK BADGE */}
            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl w-fit">
              <Check className="h-5 w-5" />
              <span className="text-sm font-medium">
                In Stock
              </span>
            </div>

            {/* HIGHLIGHTS */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                'Premium Quality',
                'Handcrafted with Care',
                'Secure Packaging',
                'Perfect for Gifting',
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 bg-muted/40 px-3 py-2 rounded-lg"
                >
                  <Check className="h-4 w-4 text-primary" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            {/* DELIVERY INFO */}
            <div className="border border-border rounded-2xl p-4 space-y-1 text-sm">
              <p className="font-semibold text-foreground">
                Delivery & Returns
              </p>
              <p className="text-muted-foreground">
                • Free delivery on all orders
              </p>
              <p className="text-muted-foreground">
                • Delivered in 5–7 business days
              </p>
              <p className="text-muted-foreground">
                • All India shipping available
              </p>
            </div>

            {/* QUANTITY */}
            <div className="flex items-center justify-between pt-4 border-t">
              <span className="text-sm text-muted-foreground">
                Quantity
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>

                <span className="w-12 text-center font-semibold">
                  {quantity}
                </span>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex gap-4 pt-4">
              <Button
                size="lg"
                className="flex-1 gap-2"
                onClick={handleAddToCart}
                disabled={added}
              >
                {added ? (
                  <>
                    <Check className="h-5 w-5" />
                    Added
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-5 w-5" />
                    Add to Cart
                  </>
                )}
              </Button>

              <Button
                variant="gold"
                size="lg"
                onClick={() => {
                  handleAddToCart();
                  navigate('/cart');
                }}
              >
                Buy Now
              </Button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
