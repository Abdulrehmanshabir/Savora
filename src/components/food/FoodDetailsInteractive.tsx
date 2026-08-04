'use client';

import { useState } from 'react';
import { Minus, Plus, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';

export function FoodDetailsInteractive({ food }: { food: any }) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  const increment = () => setQuantity(q => q + 1);
  const decrement = () => setQuantity(q => (q > 1 ? q - 1 : 1));

  const handleAddToCart = () => {
    addToCart({
      id: food.id,
      name: food.name,
      price: food.discountPrice || food.price,
      image: food.images[0]
    }, quantity);
    setQuantity(1);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <div className="flex items-center border border-border rounded-full p-1 bg-background w-full sm:w-auto h-14">
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full h-10 w-10 shrink-0"
          onClick={decrement}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="w-12 text-center font-semibold text-lg">{quantity}</span>
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full h-10 w-10 shrink-0"
          onClick={increment}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      <Button 
        size="lg" 
        className="w-full sm:w-auto rounded-full h-14 px-8 text-lg shadow-lg hover:shadow-xl transition-all"
        onClick={handleAddToCart}
      >
        <ShoppingBag className="mr-2 h-5 w-5" />
        Add to Cart - ${( (food.discountPrice || food.price) * quantity ).toFixed(2)}
      </Button>
    </div>
  );
}
