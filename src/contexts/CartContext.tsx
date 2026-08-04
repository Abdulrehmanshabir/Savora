'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const defaultCartContext: CartContextType = {
  items: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  totalItems: 0,
  totalPrice: 0,
};

const CartContext = createContext<CartContextType>(defaultCartContext);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

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
      clearCart,
      totalItems,
      totalPrice
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  return context || defaultCartContext;
}
