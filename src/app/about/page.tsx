import Image from 'next/image';
import { Metadata } from 'next';
import { ChefHat, Utensils, Award, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Our Story & Culinary Heritage',
  description: 'Learn about the philosophy, award-winning chefs, and artisanal food traditions behind Savora Luxury Dining.',
};

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero */}
      <section className="relative h-[40vh] min-h-[300px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=1920&q=80"
            alt="About Savora"
            fill
            className="object-cover brightness-50"
            priority
          />
        </div>
        <div className="container relative z-10 mx-auto px-4 text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">Our Story</h1>
          <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto font-light">
            A journey of flavors, passion, and culinary excellence.
          </p>
        </div>
      </section>

      {/* Story Content */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6 text-primary">A Passion for Culinary Arts</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Founded in 2010, Savora began with a simple vision: to bring authentic, high-quality, and innovative dishes to our local community. What started as a small family-owned bistro has blossomed into an award-winning culinary destination.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Our philosophy is centered around sourcing the freshest local ingredients and combining them with both traditional techniques and modern flair. Every dish that leaves our kitchen is a testament to our dedication to the craft of cooking.
              </p>
            </div>
            <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?w=800&q=80"
                alt="Chef cooking"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Our Core Values</h2>
            <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-card p-8 rounded-2xl shadow-sm text-center border border-border/50">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <ChefHat className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Excellence</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">We strive for perfection in every dish we create and every service we provide.</p>
            </div>
            
            <div className="bg-card p-8 rounded-2xl shadow-sm text-center border border-border/50">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Utensils className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Authenticity</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">Staying true to traditional flavors while embracing modern culinary innovation.</p>
            </div>

            <div className="bg-card p-8 rounded-2xl shadow-sm text-center border border-border/50">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Quality</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">Only the finest, locally-sourced ingredients make it into our kitchen.</p>
            </div>

            <div className="bg-card p-8 rounded-2xl shadow-sm text-center border border-border/50">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Experience</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">Creating memorable moments for our guests through exceptional hospitality.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
