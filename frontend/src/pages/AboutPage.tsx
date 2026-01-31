import { Heart, Award, Leaf, Users } from 'lucide-react';
import heroImage from '@/assets/hero-flowers.jpg';
import pratikshaImg from "@/assets/pratiksha.jpg";
import deepakImg from "@/assets/deepak.jpg";


export default function AboutPage() {
  return (
    <div className="animate-fade-in">

      {/* Hero */}
      <section className="relative py-20 md:py-32">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Our flower shop"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-forest/80" />
        </div>
        <div className="container relative px-4 md:px-8 text-center">
          <h1 className="font-display text-4xl md:text-6xl font-bold text-cream mb-4">
            About Us
          </h1>
          <p className="text-sage-light/90 text-lg md:text-xl max-w-2xl mx-auto">
            Bringing joy through flowers since 2025
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
              Our Story
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Flowers Forever began with <b>Pratiksha’s</b> love for creating beautiful handmade bouquets and her desire to turn emotions
              into something people could hold, gift, and cherish. What started as a small creative passion slowly grew into a vision 
              of building something meaningful through everlasting flowers that never fade. Each bouquet is crafted with care, creativity, 
              and attention to detail, making every piece truly special. As the dream grew, it was strengthened by the support behind the 
              scenes — bringing technology into Flowers Forever to build its online presence, streamline the journey, and help this heartfelt idea reach more people.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Our team handcrafts each bouquet with love, ensuring that every arrangement tells a unique story and delivers more than just flowers — it delivers feelings.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 md:py-24 bg-muted">
        <div className="container px-4 md:px-8">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground text-center mb-12">
            What We Stand For
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Heart,
                title: 'Made with Love',
                desc: 'Every bouquet is crafted with passion and attention to detail.',
              },
              {
                icon: Award,
                title: 'Premium Quality',
                desc: 'We focus on beauty, durability, and elegant finishing.',
              },
              {
                icon: Leaf,
                title: 'Everlasting Flowers',
                desc: 'Designed to stay beautiful and meaningful for a long time.',
              },
              {
                icon: Users,
                title: 'Customer First',
                desc: 'Every order is handled with care and personal attention.',
              },
            ].map((value, idx) => (
              <div key={idx} className="bg-card rounded-xl p-6 shadow-soft text-center">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <value.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-display text-xl font-bold text-foreground mb-2">
                  {value.title}
                </h3>
                <p className="text-muted-foreground text-sm">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-8 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Meet Our Team
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-12">
            The people behind Flowers Forever.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {[
              {
                name: 'Pratiksha',
                role: 'Founder & Creator',
                image: pratikshaImg,
              },
              {
                name: 'Deepak',
                role: 'Technology & Growth',
                image: deepakImg,
              },
            ].map((member, idx) => (
              <div key={idx} className="bg-card rounded-xl p-6 shadow-soft">

                <img
                  src={member.image}
                  alt={member.name}
                  className="w-32 h-32 mx-auto mb-4 rounded-full object-cover shadow-md"
                />

                <h3 className="font-display text-lg font-bold text-foreground">
                  {member.name}
                </h3>
                <p className="text-muted-foreground text-sm">{member.role}</p>

              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
