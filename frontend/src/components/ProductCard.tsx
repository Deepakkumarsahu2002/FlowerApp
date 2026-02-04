import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  // 🔹 Frontend-only pricing logic
  const sellingPrice: number = product.price;
  const markupPercentage: number = 20;

  const mrp: number = Math.round(
    sellingPrice + (sellingPrice * markupPercentage) / 100
  );

  return (
    <div className="group bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-elevated transition-all duration-300">
      <Link
        to={`/product/${product.id}`}
        className="block aspect-square overflow-hidden"
      >
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </Link>

      <div className="p-4 space-y-3">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        <p className="text-sm text-muted-foreground line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between pt-2">
          {/* ✅ MRP (struck) + Selling Price */}
          <div className="flex flex-col gap-1">
           <div className="flex items-center gap-2 text-base text-muted-foreground">
            <span>MRP</span>
             <span className="line-through">
             ₹{mrp.toLocaleString()}
             </span>
             </div>

            <span className="font-price text-xl font-bold text-primary">
              ₹{sellingPrice.toLocaleString()}
            </span>
          </div>

          <Button
            size="sm"
            className="gap-2"
            onClick={(e) => {
              e.preventDefault();
              addToCart(product);
            }}
          >
            <ShoppingBag className="h-4 w-4" />
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
}
