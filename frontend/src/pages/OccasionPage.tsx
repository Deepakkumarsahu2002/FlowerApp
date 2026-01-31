import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { ProductCard } from '@/components/ProductCard';
import { occasions } from '@/data/products';
import { useProducts } from '@/hooks/useProducts';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Occasion } from '@/types';

export default function OccasionPage() {
  const { id } = useParams<{ id: string }>();
  const { products, loading } = useProducts();

  const [sortOrder, setSortOrder] = useState<'low' | 'high' | ''>('');

  const occasion = occasions.find((o) => o.id === id);

  const occasionProducts = products.filter((p) =>
    p.occasions.includes(id as Occasion)
  );

  // ✅ SORTED PRODUCTS (no logic change, just derived data)
  const sortedProducts = [...occasionProducts].sort((a, b) => {
    if (sortOrder === 'low') return a.price - b.price;
    if (sortOrder === 'high') return b.price - a.price;
    return 0;
  });

  if (!occasion) {
    return (
      <div className="container px-4 md:px-8 py-20 text-center">
        <h1 className="font-display text-2xl font-bold text-foreground mb-4">
          Occasion Not Found
        </h1>
        <Link to="/categories" className="text-primary hover:underline">
          ← Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <section className="py-12 md:py-16 bg-hero-gradient">
        <div className="container px-4 md:px-8">
          <Link
            to="/categories"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            All Categories
          </Link>

          <div className="flex items-center gap-4">
            <span className="text-5xl">{occasion.emoji}</span>
            <div>
              <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground">
                {occasion.name}
              </h1>
              <p className="text-muted-foreground mt-2">
                Perfect flowers for {occasion.name.toLowerCase()}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="py-12 md:py-16">
        <div className="container px-4 md:px-8">
          {/* ✅ FILTER BAR */}
          {!loading && occasionProducts.length > 0 && (
            <div className="flex justify-end mb-6">
              <select
                value={sortOrder}
                onChange={(e) =>
                  setSortOrder(e.target.value as 'low' | 'high' | '')
                }
                className="border border-border rounded-lg px-3 py-2 text-sm bg-background"
              >
                <option value="">Sort by</option>
                <option value="low">Price: Low to High</option>
                <option value="high">Price: High to Low</option>
              </select>
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading products...</p>
            </div>
          ) : sortedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-12">
              No products found for this occasion.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
