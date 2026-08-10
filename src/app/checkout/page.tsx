'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MapPin, CreditCard, Clock, ChevronLeft, CheckCircle2, ShoppingBag, Loader2, Info, Phone, User } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const checkoutSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Valid phone number is required'),
  address: z.string().min(10, 'Please enter your full delivery address'),
  city: z.string().min(2, 'City is required'),
  instructions: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const { items, totalPrice, clearCart, setIsCartOpen } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: user?.name || '',
    }
  });

  useEffect(() => {
    // If cart is empty and order wasn't just placed, redirect to menu
    if (items.length === 0 && !orderSuccess) {
      router.push('/menu');
    }
  }, [items, orderSuccess, router]);

  const onSubmit = async (data: CheckoutFormValues) => {
    if (!user) {
      toast.error('You must be logged in to place an order');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Prepare data for API
      const orderPayload = {
        customerInfo: data,
        items: items,
        paymentMethod: 'cod', // Default or from state
        orderNotes: data.instructions || ''
      };

      // Call Secure Backend API
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process order');
      }

      // API handles creating order, notifications, and security validation

      clearCart();
      setOrderSuccess(true);
      toast.success('Order placed successfully!');
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="min-h-[100dvh] bg-background flex items-center justify-center pt-16">
        <div className="max-w-md w-full bg-card p-8 rounded-3xl shadow-xl text-center border border-border/50">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Order Received!</h2>
          <p className="text-muted-foreground mb-8">
            Your delicious meal is being prepared. We'll send you an update once it's out for delivery.
          </p>
          <Button 
            onClick={() => router.push('/dashboard')} 
            className="w-full rounded-full h-12 shadow-md"
          >
            Track Order Status
          </Button>
          <Button 
            variant="ghost"
            onClick={() => router.push('/menu')} 
            className="w-full rounded-full h-12 mt-3"
          >
            Order More Food
          </Button>
        </div>
      </div>
    );
  }

  if (items.length === 0) return null; // Prevent flicker before redirect

  const handleBackToCart = () => {
    setIsCartOpen(true);
    router.back();
  };

  return (
    <div className="min-h-[100dvh] bg-muted/30 pt-8 pb-20">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-6">
          <button 
            onClick={handleBackToCart} 
            className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Cart
          </button>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold mb-8 tracking-tight">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <div className="bg-card border border-border/50 rounded-3xl p-6 md:p-8 shadow-sm">
              <h2 className="text-xl font-bold mb-6 border-b pb-4">Delivery Details</h2>
              
              <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" /> Full Name
                    </label>
                    <input 
                      {...register('fullName')}
                      className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      placeholder="John Doe"
                    />
                    {errors.fullName && <p className="text-destructive text-sm mt-1">{errors.fullName.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" /> Phone Number
                    </label>
                    <input 
                      {...register('phone')}
                      className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      placeholder="+1 (555) 000-0000"
                    />
                    {errors.phone && <p className="text-destructive text-sm mt-1">{errors.phone.message}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" /> Delivery Address
                  </label>
                  <input 
                    {...register('address')}
                    className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    placeholder="123 Main St, Apt 4B"
                  />
                  {errors.address && <p className="text-destructive text-sm mt-1">{errors.address.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">City</label>
                  <input 
                    {...register('city')}
                    className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    placeholder="New York"
                  />
                  {errors.city && <p className="text-destructive text-sm mt-1">{errors.city.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Special Instructions (Optional)</label>
                  <textarea 
                    {...register('instructions')}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                    placeholder="E.g., Please ring the bell upon arrival, allergy to peanuts, etc."
                  ></textarea>
                </div>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-sm sticky top-24">
              <h2 className="text-xl font-bold mb-6 border-b pb-4">Order Summary</h2>
              
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 items-start">
                    <div className="relative h-16 w-16 rounded-lg overflow-hidden shrink-0 border border-border">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm line-clamp-1">{item.name}</h4>
                      {item.addons && item.addons.length > 0 && (
                        <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                          + {item.addons.map(a => a.name).join(', ')}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mb-1 mt-0.5">Qty: {item.quantity}</p>
                      <p className="font-bold text-sm text-primary">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="space-y-3 text-sm border-t pt-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span className="font-medium">$5.00</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-3 border-t">
                  <span>Total</span>
                  <span className="text-primary">${(totalPrice + 5).toFixed(2)}</span>
                </div>
              </div>

              <Button 
                type="submit" 
                form="checkout-form"
                disabled={isSubmitting}
                className="w-full h-14 text-lg rounded-xl shadow-lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...
                  </>
                ) : (
                  'Place Order'
                )}
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-4">
                By placing this order, you agree to our Terms of Service.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
