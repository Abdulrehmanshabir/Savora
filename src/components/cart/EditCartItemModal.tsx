'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { X, Edit2 } from 'lucide-react';
import Image from 'next/image';
import { CartItem, useCart } from '@/contexts/CartContext';
import { ADDON_CATEGORIES } from '@/components/food/FoodCard';

export function EditCartItemModal({ item }: { item: CartItem }) {
  const { updateCartItem } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  
  // Reconstruct selected addons into the format used by FoodCard ({ categoryId: 'comma,separated,ids' })
  const getInitialSelectedAddons = () => {
    const selected: Record<string, string> = {};
    if (!item.addons) return selected;
    
    // We need to map each addon ID back to its category
    item.addons.forEach(addon => {
      for (const cat of ADDON_CATEGORIES) {
        if (cat.options.some(opt => opt.id === addon.id)) {
          const current = selected[cat.id] || '';
          selected[cat.id] = current ? `${current},${addon.id}` : addon.id;
        }
      }
    });
    return selected;
  };

  const [selectedAddons, setSelectedAddons] = useState<Record<string, string>>(getInitialSelectedAddons());

  // Calculate base price
  const currentAddonsPrice = item.addons?.reduce((sum, a) => sum + a.price, 0) || 0;
  const basePrice = (item.price / item.quantity) - currentAddonsPrice;

  // Calculate new addons price
  const addonsTotal = Object.values(selectedAddons)
    .flatMap(val => val.split(',').filter(Boolean))
    .reduce((sum, optionId) => {
      let price = 0;
      for (const cat of ADDON_CATEGORIES) {
        const opt = cat.options?.find((o: any) => o.id === optionId);
        if (opt) price = opt.price;
      }
      return sum + price;
    }, 0);
    
  const newPrice = basePrice + addonsTotal;

  const handleUpdate = () => {
    const allSelectedIds = Object.values(selectedAddons)
      .flatMap(val => val.split(',').filter(Boolean))
      .sort();
      
    const newCartItemId = `${item.foodId}-${allSelectedIds.join('-')}`;
    
    const cartAddons = allSelectedIds.map(id => {
      let found: any = null;
      for (const cat of ADDON_CATEGORIES) {
        const opt = cat.options?.find((o: any) => o.id === id);
        if (opt) found = opt;
      }
      return found ? { id: found.id, name: found.name, price: found.price } : null;
    }).filter(Boolean) as any[];

    updateCartItem(item.id, newCartItemId, newPrice, cartAddons);
    setIsOpen(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (open) {
      setSelectedAddons(getInitialSelectedAddons());
    }
    setIsOpen(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 mr-1"
        >
          <Edit2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden rounded-[2rem] gap-0 [&>button]:hidden">
        <div className="relative h-40 w-full">
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <Button 
            variant="ghost" 
            size="icon"
            className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 text-white rounded-full h-8 w-8 z-10"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h2 className="text-xl font-bold">Edit {item.name}</h2>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[50vh] space-y-6">
          <div className="space-y-4">
            <Accordion defaultValue={ADDON_CATEGORIES[0]?.id ? [ADDON_CATEGORIES[0].id] : []} className="w-full">
              {ADDON_CATEGORIES.map(category => (
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
                                return { ...prev, [category.id]: current === option.id ? '' : option.id };
                              } else {
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
        </div>

        <div className="p-4 bg-muted/20 border-t border-border/50 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground font-medium">Item Price</span>
            <span className="text-2xl font-bold text-primary">${newPrice.toFixed(2)}</span>
          </div>
          <Button 
            className="rounded-full px-8 shadow-lg hover:shadow-xl transition-all font-semibold" 
            size="lg"
            onClick={handleUpdate}
          >
            Update Item
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
