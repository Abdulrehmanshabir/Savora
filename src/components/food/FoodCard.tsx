'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Clock, Heart, ShoppingBag, Plus, Minus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

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

export const ADDON_CATEGORIES = [
  {
    id: 'drink',
    name: 'Choose a Drink',
    type: 'single',
    options: [
      { id: 'pepsi', name: 'Pepsi', price: 1.50 },
      { id: 'coke', name: 'Coca Cola', price: 1.50 },
      { id: 'sprite', name: 'Sprite', price: 1.50 },
      { id: 'fanta', name: 'Fanta', price: 1.50 },
    ]
  },
  {
    id: 'fries',
    name: 'Choose Fries',
    type: 'single',
    options: [
      { id: 'reg_fries', name: 'Regular Fries', price: 2.50 },
      { id: 'lrg_fries', name: 'Large Fries', price: 3.50 },
      { id: 'curly_fries', name: 'Curly Fries', price: 4.00 },
    ]
  },
  {
    id: 'extras',
    name: 'Extra Toppings',
    type: 'multiple',
    options: [
      { id: 'cheese', name: 'Extra Cheese', price: 1.00 },
      { id: 'sauce', name: 'Extra Sauce', price: 0.50 },
      { id: 'jalapeno', name: 'Jalapenos', price: 0.75 },
    ]
  }
];

export function FoodCard({ food, globalAddons }: { food: FoodProps, globalAddons?: any[] }) {
  const router = useRouter();
  const { addToCart } = useCart();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const currentAddons = globalAddons && globalAddons.length > 0 ? globalAddons : ADDON_CATEGORIES;
  
  // Favorites State
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const checkFavorite = () => {
      const favs = JSON.parse(localStorage.getItem('savora_favorites') || '[]');
      setIsFavorite(favs.includes(food.id));
    };
    
    checkFavorite();
    window.addEventListener('savora_favorites_changed', checkFavorite);
    window.addEventListener('storage', (e) => {
      if (e.key === 'savora_favorites') checkFavorite();
    });
    
    return () => {
      window.removeEventListener('savora_favorites_changed', checkFavorite);
      window.removeEventListener('storage', checkFavorite);
    };
  }, [food.id]);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    const favs = JSON.parse(localStorage.getItem('savora_favorites') || '[]');
    if (isFavorite) {
      const newFavs = favs.filter((id: string) => id !== food.id);
      localStorage.setItem('savora_favorites', JSON.stringify(newFavs));
      setIsFavorite(false);
      toast.success('Removed from favorites');
      window.dispatchEvent(new Event('savora_favorites_changed'));
    } else {
      favs.push(food.id);
      localStorage.setItem('savora_favorites', JSON.stringify(favs));
      setIsFavorite(true);
      toast.success('Added to favorites');
      window.dispatchEvent(new Event('savora_favorites_changed'));
    }
  };
  
  // Modal State
  const [quantity, setQuantity] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState<Record<string, string>>({});

  const basePrice = food.discountPrice || food.price;
  
  const addonsTotal = Object.values(selectedAddons)
    .flatMap(val => val.split(',').filter(Boolean))
    .reduce((sum, optionId) => {
      let price = 0;
      for (const cat of currentAddons) {
        const opt = cat.options?.find((o: any) => o.id === optionId);
        if (opt) price = opt.price;
      }
      return sum + price;
    }, 0);
  
  const totalPrice = (basePrice + addonsTotal) * quantity;

  const handleOpenModal = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuantity(1);
    setSelectedAddons({});
    setIsModalOpen(true);
  };

  const handleAddToCart = () => {
    // Generate unique ID based on food ID and selected addons (sorted so order doesn't matter)
    const allSelectedIds = Object.values(selectedAddons)
      .flatMap(val => val.split(',').filter(Boolean))
      .sort();
    const cartItemId = `${food.id}-${allSelectedIds.join('-')}`;
    
    const cartAddons = allSelectedIds.map(id => {
      let found: any = null;
      for (const cat of currentAddons) {
        const opt = cat.options?.find((o: any) => o.id === id);
        if (opt) found = opt;
      }
      return found ? { id: found.id, name: found.name, price: found.price } : null;
    }).filter(Boolean) as any[];

    addToCart({
      id: cartItemId,
      foodId: food.id,
      name: food.name,
      price: basePrice + addonsTotal,
      image: food.image || (food.images && food.images[0]) || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80',
      addons: cartAddons
    }, quantity);
    
    setIsModalOpen(false);
  };

  const toggleAddon = (addonId: string) => {
    // This is handled directly inline now for multiple categories
  };

  return (
    <>
      <Card 
        className="overflow-hidden group flex flex-col h-full bg-card hover:shadow-xl transition-all duration-300 border-border/50 cursor-pointer"
        onClick={handleOpenModal}
      >
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
            onClick={toggleFavorite}
          >
            <Heart className={cn("h-4 w-4", isFavorite ? "fill-red-500 text-red-500" : "text-black")} />
          </Button>
        </div>
        
        <CardContent className="p-4 flex-grow flex flex-col gap-2">
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">{food.name}</h3>
            <div 
              className="flex items-center gap-1 bg-muted px-1.5 py-0.5 rounded-md hover:bg-primary/20 cursor-pointer transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                router.push('/reviews');
              }}
            >
              <Star className="h-3 w-3 fill-secondary text-secondary" />
              <span className="text-xs font-medium">{food.rating}</span>
            </div>
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
            onClick={handleOpenModal}
          >
            <ShoppingBag className="h-4 w-4 mr-1.5" /> Add
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden rounded-[2rem] gap-0 [&>button]:hidden">
          <div className="relative h-48 w-full">
            <Image
              src={food.image || (food.images && food.images.length > 0 ? food.images[0] : null) || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80'}
              alt={food.name}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <Button 
              variant="ghost" 
              size="icon"
              className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 text-white rounded-full h-8 w-8"
              onClick={() => setIsModalOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <h2 className="text-2xl font-bold">{food.name}</h2>
              <p className="text-white/80 text-sm line-clamp-1">{food.description}</p>
            </div>
          </div>

          <div className="p-6 overflow-y-auto max-h-[50vh] space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Add-ons</h3>
                <span className="text-sm text-muted-foreground">Optional</span>
              </div>
              
              <Accordion defaultValue={currentAddons[0]?.id ? [currentAddons[0].id] : []} className="w-full">
                {currentAddons.map(category => (
                  <AccordionItem key={category.id} value={category.id} className="border-b-0 mb-4 bg-muted/20 rounded-2xl overflow-hidden border border-border/50">
                    <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/30 transition-colors data-[state=open]:border-b border-border/50">
                      <div className="flex flex-col items-start text-left">
                        <span className="font-semibold text-base">{category.name}</span>
                        <span className="text-xs text-muted-foreground font-normal mt-0.5">
                          {category.type === 'single' ? 'Choose up to 1' : 'Choose multiple'}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-5 py-4 pb-5 space-y-3 bg-background">
                      {category.options && category.options.map((option: any) => {
                        const currentSelections = selectedAddons[category.id] || '';
                        const isSelected = currentSelections.includes(option.id);
                        
                        return (
                          <div 
                            key={option.id}
                            className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                              isSelected ? 'border-primary bg-primary/5 shadow-sm' : 'border-border/50 hover:bg-muted/40'
                            }`}
                            onClick={() => {
                              setSelectedAddons(prev => {
                                const current = prev[category.id] || '';
                                if (category.type === 'single') {
                                  // Toggle off if already selected, otherwise select
                                  return { ...prev, [category.id]: current === option.id ? '' : option.id };
                                } else {
                                  // Multiple selection logic (stored as comma separated string or handling it carefully)
                                  // For simplicity since the type is string in state, we handle it as array conversion
                                  const currentArr = current ? current.split(',') : [];
                                  const newArr = currentArr.includes(option.id) 
                                    ? currentArr.filter(id => id !== option.id) 
                                    : [...currentArr, option.id];
                                  return { ...prev, [category.id]: newArr.join(',') };
                                }
                              });
                            }}
                          >
                            <div className="flex items-center gap-3.5">
                              {/* Custom Radio Dot / Checkbox */}
                              <div 
                                className={`flex items-center justify-center transition-colors ${
                                  category.type === 'single' 
                                    ? `w-5 h-5 rounded-full border-2 ${isSelected ? 'border-primary' : 'border-muted-foreground/30'}`
                                    : `w-5 h-5 rounded-md border-2 ${isSelected ? 'border-primary bg-primary' : 'border-muted-foreground/30'}`
                                }`}
                              >
                                {isSelected && category.type === 'single' && (
                                  <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                                )}
                                {isSelected && category.type === 'multiple' && (
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-primary-foreground"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                )}
                              </div>
                              <span className={`font-medium text-sm ${isSelected ? 'text-primary' : ''}`}>{option.name}</span>
                            </div>
                            {option.price > 0 && (
                              <span className="text-sm font-semibold text-muted-foreground">+${option.price.toFixed(2)}</span>
                            )}
                          </div>
                        );
                      })}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            <div className="space-y-4 pt-2 border-t border-border/50">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Quantity</h3>
                <div className="flex items-center gap-3 bg-muted/50 rounded-full p-1 border border-border/50">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-full hover:bg-background shadow-sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-4 text-center font-bold">{quantity}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-full hover:bg-background shadow-sm"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-muted/20 border-t border-border/50 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground font-medium">Total Price</span>
              <span className="text-2xl font-bold text-primary">${totalPrice.toFixed(2)}</span>
            </div>
            <Button 
              className="rounded-full px-8 shadow-lg hover:shadow-xl transition-all font-semibold" 
              size="lg"
              onClick={handleAddToCart}
            >
              Add to Cart
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
