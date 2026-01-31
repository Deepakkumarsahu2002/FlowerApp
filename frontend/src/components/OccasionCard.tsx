import { Link } from 'react-router-dom';
import { Occasion } from '@/types';

interface OccasionCardProps {
  id: Occasion;
  name: string;
  emoji: string;
}

export function OccasionCard({ id, name, emoji }: OccasionCardProps) {
  return (
    <Link
      to={`/occasion/${id}`}
      className="group flex flex-col items-center gap-3 p-6 rounded-2xl bg-card shadow-soft hover:shadow-elevated hover:-translate-y-1 transition-all duration-300"
    >
      <span className="text-5xl group-hover:animate-float">{emoji}</span>
      <span className="font-display text-sm font-medium text-foreground">{name}</span>
    </Link>
  );
}
