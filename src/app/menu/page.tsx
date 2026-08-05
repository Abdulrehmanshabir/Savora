'use client';

import { useEffect, useState, Suspense } from 'react';
import Image from 'next/image';
import { db } from '@/firebase/client';
import { collection, getDocs } from 'firebase/firestore';
import { FoodCard } from '@/components/food/FoodCard';
import { MenuFilter } from '@/components/food/MenuFilter';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

function MenuContent() {
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category') || 'all';
  const searchQuery = searchParams.get('search') || '';

  const [foods, setFoods] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMenu() {
      try {
        const [foodsSnap, categoriesSnap] = await Promise.all([
          getDocs(collection(db, 'foods')),
          getDocs(collection(db, 'categories'))
        ]);
        
        let fetchedFoods: any[] = foodsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        const fetchedCats: any[] = categoriesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));

        setCategories(fetchedCats);

        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          fetchedFoods = fetchedFoods.filter((f: any) => 
            f.name?.toLowerCase().includes(q) || 
            f.description?.toLowerCase().includes(q) ||
            (fetchedCats.find((c: any) => c.id === f.categoryId) as any)?.name?.toLowerCase().includes(q)
          );
        } else if (currentCategory && currentCategory !== 'all') {
          const catId = fetchedCats.find((c: any) => c.slug === currentCategory)?.id;
          if (catId) {
            fetchedFoods = fetchedFoods.filter((f: any) => f.categoryId === catId);
          }
        }

        setFoods(fetchedFoods);
      } catch (error) {
        console.error("Error fetching menu:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchMenu();
  }, [currentCategory, searchQuery]);

  return (
    <div className="flex flex-col min-h-[100dvh]">
      {/* Page Header */}
      <section className="relative h-[40vh] min-h-[300px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1920&q=80"
            alt="Our Menu"
            fill
            className="object-cover brightness-50"
            priority
          />
        </div>
        <div className="container relative z-10 mx-auto px-4 text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">Our Menu</h1>
          <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto font-light">
            Explore our diverse selection of carefully curated dishes, prepared with passion and the finest ingredients.
          </p>
        </div>
      </section>

      {/* Menu Content */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <MenuFilter categories={categories} currentCategory={currentCategory} />
          
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : foods.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-10">
              {foods.map((food: any) => (
                <FoodCard key={food.id} food={food} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <h3 className="text-2xl font-semibold mb-2">No items found</h3>
              <p className="text-muted-foreground">We couldn't find any dishes in this category.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default function MenuPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[100dvh]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <MenuContent />
    </Suspense>
  );
}
