import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CategoryCard } from '@/components/CategoryCard';
import { OccasionCard } from '@/components/OccasionCard';
import { categories, occasions } from '@/data/products';
import { Category, Occasion } from '@/types';

export default function CategoriesPage() {
  return (
    <div className="animate-fade-in">
      {/* Header */}
      <section className="py-12 md:py-16 bg-hero-gradient">
        <div className="container px-4 md:px-8">
          <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground text-center">
            Shop Our Collection
          </h1>
          <p className="text-muted-foreground text-center mt-4 max-w-2xl mx-auto">
            Explore our carefully curated categories and find the perfect flowers for any occasion.
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-8">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-8">
            Browse by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                id={category.id as Category}
                name={category.name}
                description={category.description}
                icon={category.icon}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Occasions */}
      <section className="py-16 md:py-24 bg-muted">
        <div className="container px-4 md:px-8">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-8">
            Shop by Occasion
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {occasions.map((occasion) => (
              <OccasionCard
                key={occasion.id}
                id={occasion.id as Occasion}
                name={occasion.name}
                emoji={occasion.emoji}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
