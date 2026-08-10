'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

export interface CartItemAddon {
  id: string;
  name: string;
  price: number;
}

export interface CartItem {
  id: string; // Unique cart item ID (foodId + addons)
  foodId: string; // Original food ID
  name: string;
  price: number; // Base price + addons price
  image: string;
  quantity: number;
  addons?: CartItemAddon[];
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateCartItem: (oldId: string, newId: string, newPrice: number, newAddons: CartItemAddon[]) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
}

const defaultCartContext: CartContextType = {
  items: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  updateCartItem: () => {},
  clearCart: () => {},
  totalItems: 0,
  totalPrice: 0,
  isCartOpen: false,
  setIsCartOpen: () => {},
};

const CartContext = createContext<CartContextType>(defaultCartContext);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load from local storage
  useEffect(() => {
    const savedCart = localStorage.getItem('savora_cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart');
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to local storage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('savora_cart', JSON.stringify(items));
    }
  }, [items, isLoaded]);

  const addToCart = (item: Omit<CartItem, 'quantity'>, quantity = 1) => {
    const existingItem = items.find(i => i.id === item.id);

    if (existingItem) {
      toast.success(`Updated ${item.name}`, {
        description: `Total quantity in cart: ${existingItem.quantity + quantity}`,
        duration: 2000,
      });
    } else {
      toast.success(`Added ${item.name} to Cart`, {
        description: quantity > 1 ? `Added ${quantity} items to your cart` : `Ready in your bag • $${item.price.toFixed(2)}`,
        duration: 2000,
      });
    }

    setItems(currentItems => {
      const existing = currentItems.find(i => i.id === item.id);
      if (existing) {
        return currentItems.map(i =>
          i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...currentItems, { ...item, quantity }];
    });
  };

  const removeFromCart = (id: string) => {
    const itemToRemove = items.find(i => i.id === id);
    setItems(currentItems => currentItems.filter(i => i.id !== id));
    toast.info('Item Removed', {
      description: itemToRemove ? `${itemToRemove.name} was removed from your cart` : 'Item removed from your cart',
      duration: 2000,
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return;
    setItems(currentItems => 
      currentItems.map(i => i.id === id ? { ...i, quantity } : i)
    );
  };

  const updateCartItem = (oldId: string, newId: string, newPrice: number, newAddons: CartItemAddon[]) => {
    setItems(currentItems => {
      const oldItem = currentItems.find(i => i.id === oldId);
      if (!oldItem) return currentItems;
      
      const existingItem = currentItems.find(i => i.id === newId && i.id !== oldId);
      let newItems = currentItems.filter(i => i.id !== oldId);
      
      if (existingItem) {
        return newItems.map(i => i.id === newId ? { ...i, quantity: i.quantity + oldItem.quantity } : i);
      } else {
        newItems.push({
          ...oldItem,
          id: newId,
          price: newPrice,
          addons: newAddons
        });
        return newItems;
      }
    });
    
    toast.success('Cart updated successfully');
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = items.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      updateCartItem,
      clearCart,
      totalItems,
      totalPrice,
      isCartOpen,
      setIsCartOpen
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  return context || defaultCartContext;
}
