import { Product } from '@/types';
import jumboBouquet from '@/assets/jumbo-bouquet.jpg';
import smallBouquet from '@/assets/small-bouquet.jpg';
import miniBouquet from '@/assets/mini-bouquet.jpg';
import customBouquet from '@/assets/custom-bouquet.jpg';
import flowerPot from '@/assets/flower-pot.jpg';

export const products: Product[] = [
  // Jumbo Bouquets
  {
    id: '1',
    name: 'Grand Romance',
    price: 4999,
    image: jumboBouquet,
    category: 'jumbo-bouquet',
    occasions: ['anniversary', 'valentines'],
    description: 'A stunning arrangement of 50 premium red roses with baby\'s breath and eucalyptus. Perfect for making a grand romantic gesture.',
    inStock: true,
  },
  {
    id: '2',
    name: 'Sunset Symphony',
    price: 5499,
    image: jumboBouquet,
    category: 'jumbo-bouquet',
    occasions: ['birthday', 'congratulations'],
    description: 'An extravagant mix of orange lilies, yellow roses, and pink gerberas creating a spectacular display.',
    inStock: true,
  },
  {
    id: '3',
    name: 'Royal Garden',
    price: 6999,
    image: jumboBouquet,
    category: 'jumbo-bouquet',
    occasions: ['anniversary', 'congratulations'],
    description: 'Our most luxurious arrangement featuring 100 mixed roses in shades of pink, red, and white.',
    inStock: true,
  },
  // Small Bouquets
  {
    id: '4',
    name: 'Sweet Blush',
    price: 1499,
    image: smallBouquet,
    category: 'small-bouquet',
    occasions: ['birthday', 'get-well'],
    description: 'Delicate pink roses and carnations wrapped in elegant kraft paper. A sweet gesture for any occasion.',
    inStock: true,
  },
  {
    id: '5',
    name: 'Sunshine Delight',
    price: 1299,
    image: smallBouquet,
    category: 'small-bouquet',
    occasions: ['get-well', 'congratulations'],
    description: 'Bright yellow daisies and sunflowers to bring sunshine to someone\'s day.',
    inStock: true,
  },
  {
    id: '6',
    name: 'Lavender Dreams',
    price: 1599,
    image: smallBouquet,
    category: 'small-bouquet',
    occasions: ['sorry', 'birthday'],
    description: 'Soothing lavender roses and purple lisianthus for a calming, elegant gift.',
    inStock: true,
  },
  // Mini Bouquets
  {
    id: '7',
    name: 'Petite Rose',
    price: 599,
    image: miniBouquet,
    category: 'mini-bouquets',
    occasions: ['birthday', 'get-well'],
    description: 'Three beautiful roses with greenery, perfect for a desk or bedside table.',
    inStock: true,
  },
  {
    id: '8',
    name: 'Tiny Treasures',
    price: 499,
    image: miniBouquet,
    category: 'mini-bouquets',
    occasions: ['sorry', 'congratulations'],
    description: 'A charming mini arrangement of mixed seasonal flowers.',
    inStock: true,
  },
  {
    id: '9',
    name: 'Mini Sunshine',
    price: 549,
    image: miniBouquet,
    category: 'mini-bouquets',
    occasions: ['get-well', 'birthday'],
    description: 'Bright and cheerful mini sunflowers to brighten any space.',
    inStock: true,
  },
  // Custom Bouquets
  {
    id: '10',
    name: 'Design Your Own',
    price: 2499,
    image: customBouquet,
    category: 'custom-bouquet',
    occasions: ['anniversary', 'birthday', 'valentines', 'sorry', 'congratulations', 'get-well'],
    description: 'Create your perfect bouquet! Choose your flowers, colors, and style. Our florists will bring your vision to life.',
    inStock: true,
  },
  {
    id: '11',
    name: 'Premium Custom',
    price: 4999,
    image: customBouquet,
    category: 'custom-bouquet',
    occasions: ['anniversary', 'birthday', 'valentines', 'sorry', 'congratulations', 'get-well'],
    description: 'Our luxury custom option with premium imported flowers and exclusive packaging.',
    inStock: true,
  },
  // Flower Pots
  {
    id: '12',
    name: 'Peace Lily',
    price: 899,
    image: flowerPot,
    category: 'flower-pots',
    occasions: ['congratulations', 'get-well'],
    description: 'An elegant peace lily in a ceramic pot. Low maintenance and air purifying.',
    inStock: true,
  },
  {
    id: '13',
    name: 'Orchid Elegance',
    price: 1999,
    image: flowerPot,
    category: 'flower-pots',
    occasions: ['anniversary', 'congratulations'],
    description: 'A stunning white orchid in a premium decorative pot. Lasts for months with proper care.',
    inStock: true,
  },
  {
    id: '14',
    name: 'Rose Plant',
    price: 1299,
    image: flowerPot,
    category: 'flower-pots',
    occasions: ['birthday', 'anniversary'],
    description: 'A beautiful potted rose plant that will bloom season after season.',
    inStock: true,
  },
  {
    id: '15',
    name: 'Succulent Garden',
    price: 799,
    image: flowerPot,
    category: 'flower-pots',
    occasions: ['birthday', 'congratulations', 'get-well'],
    description: 'A charming arrangement of mixed succulents in a modern planter.',
    inStock: true,
  },
];

export const categories = [
  { id: 'jumbo-bouquet', name: 'Jumbo Bouquet', description: 'Make a grand statement'},
  { id: 'small-bouquet', name: 'Small Bouquet', description: 'Perfect everyday gestures'},
  { id: 'mini-bouquets', name: 'Mini Bouquets', description: 'Small but meaningful'},
  { id: 'custom-bouquet', name: 'Custom Bouquet', description: 'Design your own'},
  { id: 'flower-pots', name: 'Flower Pots', description: 'Long-lasting beauty'},
];

export const occasions = [
  { id: 'anniversary', name: 'loved One', emoji: '💕' },
  { id: 'birthday', name: 'Birthday', emoji: '🎂' },
  { id: 'sorry', name: 'Sorry', emoji: '🙏' },
  { id: 'congratulations', name: 'Congratulations', emoji: '🎉' },
];
