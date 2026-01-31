import { Link } from 'react-router-dom';
import { Category } from '@/types';
import jumboBouquet from '@/assets/jumbo-bouquet.jpg';
import smallBouquet from '@/assets/small-bouquet.jpg';
import miniBouquet from '@/assets/mini-bouquet.jpg';
import customBouquet from '@/assets/custom-bouquet.jpg';
import flowerPot from '@/assets/flower-pot.jpg';

const categoryImages: Record<Category, string> = {
  'jumbo-bouquet': jumboBouquet,
  'small-bouquet': smallBouquet,
  'mini-bouquets': miniBouquet,
  'custom-bouquet': customBouquet,
  'flower-pots': flowerPot,
};

interface CategoryCardProps {
  id: Category;
  name: string;
  description: string;
  icon: string;
}

export function CategoryCard({ id, name, description, icon }: CategoryCardProps) {
  return (
    <Link
      to={`/category/${id}`}
      className="group relative overflow-hidden rounded-2xl aspect-[4/5] shadow-soft hover:shadow-elevated transition-all duration-500"
    >
      <img
        src={categoryImages[id]}
        alt={name}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-purple/90 via-purple/40 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6 text-primary-foreground">
        <span className="text-4xl mb-2 block">{icon}</span>
        <h3 className="font-display text-xl font-bold mb-1">{name}</h3>
        <p className="text-primary-foreground/80 text-sm">{description}</p>
      </div>
    </Link>
  );
}
