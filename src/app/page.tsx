'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Star, ChefHat, Clock, Utensils } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { FoodCard } from '@/components/food/FoodCard';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';
import { db } from '@/firebase/client';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';

export default function Home() {
  const [popularFoods, setPopularFoods] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [foodsSnap, categoriesSnap] = await Promise.all([
          getDocs(collection(db, 'foods')),
          getDocs(collection(db, 'categories'))
        ]);
        
        const allFoods = foodsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const popular = allFoods.filter((f: any) => f.isPopular).slice(0, 4);
        
        const allCats = categoriesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const topCats = allCats.slice(0, 4);
        
        setPopularFoods(popular);
        setCategories(topCats);
      } catch (error) {
        console.error("Error fetching homepage data:", error);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="flex flex-col min-h-[100dvh]">
      {/* Hero Section */}
      <section className="relative h-[85dvh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1920&q=80"
            alt="Hero Background"
            fill
            className="object-cover brightness-50"
            priority
          />
        </div>
        <div className="container relative z-10 mx-auto px-4 text-center text-white flex flex-col items-center">
          <Badge className="bg-primary/20 text-primary-foreground border-primary/50 mb-6 backdrop-blur-md px-4 py-1.5 text-sm">
            Experience Premium Dining
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight max-w-4xl leading-tight">
            Flavors that tell a <span className="text-primary italic">Story</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl font-light">
            Discover culinary excellence with our carefully crafted menu. 
            Fresh ingredients, master chefs, and an unforgettable atmosphere await you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto max-w-sm sm:max-w-none">
            <Link href="/menu" className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto rounded-full px-8 text-lg h-14 shadow-lg shadow-primary/30")}>
              Order Now <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link href="/reservation" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full sm:w-auto rounded-full px-8 text-lg h-14 bg-white/10 border-white/30 text-white hover:bg-white hover:text-black backdrop-blur-sm")}>
              Reserve a Table
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Row */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Explore by Category</h2>
            <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((cat: any) => (
              <Link key={cat.id} href={`/menu?category=${cat.slug}`} className="group block">
                <div className="relative h-40 md:h-56 rounded-2xl overflow-hidden shadow-md">
                  <Image
                    src={cat.imageUrl}
                    alt={cat.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end justify-center pb-6">
                    <h3 className="text-white font-semibold text-xl tracking-wide group-hover:-translate-y-2 transition-transform duration-300">{cat.name}</h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Foods */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold mb-3">Popular Dishes</h2>
              <p className="text-muted-foreground">Most loved by our customers</p>
            </div>
            <Link href="/menu" className="hidden sm:flex items-center text-primary font-medium hover:underline">
              View full menu <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularFoods.map((food: any) => (
              <FoodCard key={food.id} food={food} />
            ))}
          </div>
          
          <div className="mt-8 text-center sm:hidden">
            <Link href="/menu" className={cn(buttonVariants({ variant: "outline" }), "w-full")}>
              View full menu
            </Link>
          </div>
        </div>
      </section>

      {/* Features/Stats */}
      <section className="py-20 bg-zinc-900 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="flex flex-col items-center">
              <div className="h-20 w-20 bg-primary/20 rounded-full flex items-center justify-center mb-6">
                <ChefHat className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Master Chefs</h3>
              <p className="text-gray-400">Our culinary team brings years of experience from top restaurants around the world.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="h-20 w-20 bg-secondary/20 rounded-full flex items-center justify-center mb-6">
                <Utensils className="h-10 w-10 text-secondary" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Fresh Ingredients</h3>
              <p className="text-gray-400">We source our ingredients daily from local farmers to ensure maximum freshness and quality.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="h-20 w-20 bg-primary/20 rounded-full flex items-center justify-center mb-6">
                <Clock className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Fast Delivery</h3>
              <p className="text-gray-400">Enjoy our premium meals from the comfort of your home, delivered hot and fresh.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Active Offer Banner */}
      {activeOffer && (
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src={activeOffer.imageUrl || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1920&q=80'}
              alt="Special Offer"
              fill
              className="object-cover brightness-50"
            />
          </div>
          <div className="container relative z-10 mx-auto px-4 flex flex-col items-center text-center text-white">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">{activeOffer.title}</h2>
            <p className="text-xl max-w-2xl mx-auto mb-8 text-gray-200">{activeOffer.description}</p>
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
              <div className="text-left">
                <p className="text-sm text-gray-300 uppercase tracking-wider font-semibold mb-1">Use Code</p>
                <p className="text-2xl font-bold text-secondary">SAVORA20</p>
              </div>
              <div className="w-px h-12 bg-white/20 mx-2"></div>
              <Link href="/menu" className={cn(buttonVariants({ size: "lg" }), "rounded-full shadow-lg")}>
                Claim Offer
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Newsletter */}
      <section className="py-24 bg-accent">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4 text-accent-foreground">Join our Culinary Club</h2>
          <p className="text-muted-foreground mb-8">Subscribe to our newsletter for exclusive offers, new menu reveals, and chef's tips.</p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <input 
              type="email" 
              placeholder="Enter your email address" 
              className="flex-grow rounded-full px-6 py-4 outline-none border border-border focus:border-primary focus:ring-1 focus:ring-primary bg-background"
              required
            />
            <Button size="lg" className="rounded-full px-8 py-4 h-auto shadow-md">
              Subscribe
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}
