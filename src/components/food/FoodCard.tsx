'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Clock, Heart, ShoppingBag, Plus, Minus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

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

const AVAILABLE_ADDONS = [
  { id: 'fries', name: 'Regular Fries', price: 2.50 },
  { id: 'drink', name: 'Cold Drink', price: 1.50 },
  { id: 'cheese', name: 'Extra Cheese', price: 1.00 },
];

export function FoodCard({ food }: { food: FoodProps }) {
  const { addToCart } = useCart();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Modal State
  const [quantity, setQuantity] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  const basePrice = food.discountPrice || food.price;
  
  const addonsTotal = selectedAddons.reduce((sum, addonId) => {
    const addon = AVAILABLE_ADDONS.find(a => a.id === addonId);
    return sum + (addon ? addon.price : 0);
  }, 0);
  
  const totalPrice = (basePrice + addonsTotal) * quantity;

  const handleOpenModal = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuantity(1);
    setSelectedAddons([]);
    setIsModalOpen(true);
  };

  const handleAddToCart = () => {
    // Generate unique ID based on food ID and selected addons (sorted so order doesn't matter)
    const sortedAddonIds = [...selectedAddons].sort();
    const cartItemId = `${food.id}-${sortedAddonIds.join('-')}`;
    
    const cartAddons = sortedAddonIds.map(id => {
      const addon = AVAILABLE_ADDONS.find(a => a.id === id)!;
      return { id: addon.id, name: addon.name, price: addon.price };
    });

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
    setSelectedAddons(prev => 
      prev.includes(addonId) ? prev.filter(id => id !== addonId) : [...prev, addonId]
    );
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
            onClick={(e) => {
              e.stopPropagation();
              // wish list logic could go here
            }}
          >
            <Heart className="h-4 w-4 text-black" />
          </Button>
        </div>
        
        <CardContent className="p-4 flex-grow flex flex-col gap-2">
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">{food.name}</h3>
            <div className="flex items-center gap-1 bg-muted px-1.5 py-0.5 rounded-md">
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
        <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden rounded-[2rem] gap-0">
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
              
              <div className="space-y-3">
                {AVAILABLE_ADDONS.map(addon => (
                  <label 
                    key={addon.id} 
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                      selectedAddons.includes(addon.id) ? 'border-primary bg-primary/5' : 'border-border/50 hover:bg-muted/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox 
                        checked={selectedAddons.includes(addon.id)} 
                        onCheckedChange={() => toggleAddon(addon.id)}
                      />
                      <span className="font-medium text-sm">{addon.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-muted-foreground">+${addon.price.toFixed(2)}</span>
                  </label>
                ))}
              </div>
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
