import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Instagram, Facebook, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container px-4 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="inline-block">
              <span className="font-display text-2xl font-bold text-primary-foreground">Flowers</span>
              <span className="font-display text-2xl text-lavender-light"> Forever</span>
            </Link>
            <p className="text-primary-foreground/80 text-sm leading-relaxed">
              Bringing joy through flowers since 2025. We craft beautiful bouquets for every occasion with love and care.
            </p>
            <div className="flex gap-4">
              <a
  href="https://www.instagram.com/flowers._forever._/"
  target="_blank"
  rel="noopener noreferrer"
  className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
>
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display text-lg font-semibold text-primary-foreground mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { href: '/categories', label: 'Shop All' },
                { href: '/about', label: 'About Us' },
                { href: '/contact', label: 'Contact Us' },
                { href: '/cart', label: 'My Cart' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-primary-foreground/80 text-sm hover:text-primary-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-display text-lg font-semibold text-primary-foreground mb-4">Categories</h3>
            <ul className="space-y-2">
              {[
                { href: '/category/jumbo-bouquet', label: 'Jumbo Bouquet' },
                { href: '/category/small-bouquet', label: 'Small Bouquet' },
                { href: '/category/mini-bouquets', label: 'Mini Bouquets' },
                { href: '/category/custom-bouquet', label: 'Custom Bouquet' },
                { href: '/category/flower-pots', label: 'Flower Pots' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-primary-foreground/80 text-sm hover:text-primary-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display text-lg font-semibold text-primary-foreground mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-lavender-light mt-0.5 flex-shrink-0" />
                <span className="text-primary-foreground/80 text-sm">Whitefield, Bangalore, India 560066</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-lavender-light flex-shrink-0" />
                <span className="text-primary-foreground/80 text-sm">+91 76550 42406</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-lavender-light flex-shrink-0" />
                <span className="text-primary-foreground/80 text-sm">Flowersforeverofficial@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-primary-foreground/20 text-center">
          <p className="text-primary-foreground/60 text-sm">
            © {new Date().getFullYear()} Flowers Forever. All rights reserved. Crafted with love by our team. Designed by Deepak.
          </p>
        </div>
      </div>
    </footer>
  );
}
