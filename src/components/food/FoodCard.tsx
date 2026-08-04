'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Star, Clock, Heart, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';

interface FoodProps {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number | null;
  images: string[];
  image?: string;
  rating: number;
  reviewsCount: number;
  prepTimeMinutes: number;
  isPopular?: boolean;
}

export function FoodCard({ food }: { food: FoodProps }) {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: food.id,
      name: food.name,
      price: food.discountPrice || food.price,
      image: food.images[0]
    });
  };

  return (
    <Card className="overflow-hidden group flex flex-col h-full bg-card hover:shadow-xl transition-all duration-300 border-border/50">
      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src={food.image || (food.images && food.images.length > 0 ? food.images[0] : null) || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80'}
          alt={food.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {food.discountPrice && (
          <Badge className="absolute top-3 right-3 bg-destructive text-destructive-foreground font-semibold px-2 py-1">
            Sale
          </Badge>
        )}
        {food.isPopular && !food.discountPrice && (
          <Badge className="absolute top-3 left-3 bg-secondary text-secondary-foreground font-semibold px-2 py-1">
            Popular
          </Badge>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute bottom-3 right-3 bg-white/80 backdrop-blur-md hover:bg-white text-dark rounded-full h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Heart className="h-4 w-4" />
        </Button>
      </div>
      
      <CardContent className="p-4 flex-grow flex flex-col gap-2">
        <div className="flex justify-between items-start gap-2">
          <Link href={`/menu/${food.id}`} className="hover:text-primary transition-colors">
            <h3 className="font-semibold text-lg line-clamp-1">{food.name}</h3>
          </Link>
          <Link href={`/menu/${food.id}#reviews`} className="flex items-center gap-1 bg-muted hover:bg-primary/10 transition-colors px-1.5 py-0.5 rounded-md cursor-pointer">
            <Star className="h-3 w-3 fill-secondary text-secondary" />
            <span className="text-xs font-medium">{food.rating}</span>
          </Link>
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-2">
          {food.description}
        </p>
        
        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span>{food.prepTimeMinutes} mins</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 flex items-center justify-between border-t border-border/50 mt-auto bg-muted/10">
        <div className="flex items-center gap-2">
          {food.discountPrice ? (
            <>
              <span className="text-lg font-bold text-primary">${food.discountPrice.toFixed(2)}</span>
              <span className="text-sm text-muted-foreground line-through">${food.price.toFixed(2)}</span>
            </>
          ) : (
            <span className="text-lg font-bold">${food.price.toFixed(2)}</span>
          )}
        </div>
        
        <Button 
          size="sm" 
          className="rounded-full px-4 font-medium shadow-md hover:shadow-lg transition-all"
          onClick={handleAddToCart}
        >
          <ShoppingBag className="h-4 w-4 mr-1.5" /> Add
        </Button>
      </CardFooter>
    </Card>
  );
}
