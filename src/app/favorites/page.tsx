'use client';

import { useEffect, useState } from 'react';
import { db } from '@/firebase/client';
import { collection, getDocs } from 'firebase/firestore';
import { FoodCard } from '@/components/food/FoodCard';
import { Loader2, HeartCrack } from 'lucide-react';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';

export default function FavoritesPage() {
  const [favoriteFoods, setFavoriteFoods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalAddons, setGlobalAddons] = useState<any[]>([]);

  useEffect(() => {
    async function fetchFavorites() {
      try {
        const favIds = JSON.parse(localStorage.getItem('savora_favorites') || '[]');
        if (favIds.length === 0) {
          setLoading(false);
          return;
        }

        const [foodsSnap, addonsSnap] = await Promise.all([
          getDocs(collection(db, 'foods')),
          getDocs(collection(db, 'addons'))
        ]);
        
        const allFoods = foodsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const fetchedAddons = addonsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        const favs = allFoods.filter(food => favIds.includes(food.id));
        
        setFavoriteFoods(favs);
        setGlobalAddons(fetchedAddons);
      } catch (error) {
        console.error("Error fetching favorites:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchFavorites();
  }, []);

  return (
    <div className="container mx-auto px-4 py-12 min-h-[70vh]">
      <h1 className="text-3xl font-bold mb-8">My Favorites</h1>
      
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : favoriteFoods.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favoriteFoods.map((food: any) => (
            <FoodCard key={food.id} food={food} globalAddons={globalAddons} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-muted/20 rounded-3xl border border-dashed border-border">
          <HeartCrack className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-2xl font-semibold mb-2">No favorites yet</h3>
          <p className="text-muted-foreground max-w-md mb-8">
            You haven't added any dishes to your favorites yet. Explore our menu and tap the heart icon on dishes you love!
          </p>
          <Link href="/menu" className={buttonVariants({ size: "lg", className: "rounded-full" })}>
            Explore Menu
          </Link>
        </div>
      )}
    </div>
  );
}
