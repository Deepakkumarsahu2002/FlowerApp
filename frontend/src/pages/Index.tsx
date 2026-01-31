import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CategoryCard } from '@/components/CategoryCard';
import { OccasionCard } from '@/components/OccasionCard';
import { ProductCard } from '@/components/ProductCard';
import { categories, occasions } from '@/data/products';
import { useProducts } from '@/hooks/useProducts';
import { ArrowRight, Truck, Shield, Heart } from 'lucide-react';
import heroDesktop from '@/assets/hero-flowers.jpg';
import heroMobile from '@/assets/hero-flowers-mobile.jpg';
import { Category } from '@/types';

const Index = () => {
  const { products, loading } = useProducts();
  const featuredProducts = products.slice(0, 4);

  return (
    <div className="animate-fade-in">
      {/* ================= HERO SECTION ================= */}
      <section className="relative min-h-[65vh] sm:min-h-[75vh] lg:min-h-[85vh] flex items-center">
        <div className="absolute inset-0">
          <picture>
            {/* Desktop image */}
            <source
              srcSet={heroDesktop}
              media="(min-width: 768px)"
            />

            {/* Mobile image (default) */}
            <img
              src={heroMobile}
              alt="Beautiful flower bouquet"
              className="w-full h-full object-cover"
            />
          </picture>

          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-transparent" />
        </div>

        <div className="container relative px-4 md:px-8 py-12 sm:py-16 lg:py-20">
          <div className="max-w-2xl animate-slide-up">
            <h1 className="font-display text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight mb-4 sm:mb-6">
              Flower Bouquets, <br />
              <span className="text-primary">That stays Forever</span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-lg">
              Handcrafted bouquets for every occasion. From grand gestures to everyday joy,
              we bring it to your doorstep.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/categories">
                <Button variant="hero" size="xl" className="w-full sm:w-auto">
                  Shop Now
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>

              <Link to="/category/custom-bouquet">
                <Button variant="outline" size="xl" className="w-full sm:w-auto">
                  Create Custom Bouquet
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FEATURED PRODUCTS ================= */}
      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
                Bestsellers
              </h2>
              <p className="text-muted-foreground">
                Our most loved arrangements
              </p>
            </div>

            <Link to="/categories">
              <Button variant="outline">
                View All
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* ================= CATEGORIES ================= */}
      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Shop by Category
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From grand jumbo bouquets to charming mini arrangements,
              find the perfect bouquets for every moment.
            </p>
          </div>

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

      {/* ================= OCCASIONS ================= */}
      <section className="py-16 md:py-24 bg-hero-gradient">
        <div className="container px-4 md:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Shop by Occasion
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Celebrate life's special moments with the perfect floral arrangement.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {occasions.map((occasion) => (
              <OccasionCard
                key={occasion.id}
                id={occasion.id as any}
                name={occasion.name}
                emoji={occasion.emoji}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="py-12 bg-muted">
        <div className="container px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Truck, title: 'Fast Delivery', desc: 'Pan India Delivery within 5-7 Days.' },
              { icon: Shield, title: 'Stays Forever', desc: 'Forever Lasting promise on all Bouquets.' },
              { icon: Heart, title: 'Crafted with Love', desc: 'Each bouquet is handcrafted by us.' },
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-8 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Need Something Special?
          </h2>

          <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-8">
            Our florists can create custom arrangements tailored to your preferences.
            Let us bring your vision to life.
          </p>

          <Link to="/category/custom-bouquet">
            <Button variant="secondary" size="xl">
              Create Custom Bouquet
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Index;
