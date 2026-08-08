'use client';

import { useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, Copy, Check, Sparkles, MapPin, Phone, Mail, Calendar, Clock, CreditCard, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

interface ReceiptItem {
  id?: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  addons?: any[];
}

export interface ReceiptOrder {
  id: string;
  totalAmount: number;
  status: string;
  createdAt?: any;
  items?: ReceiptItem[];
  contactInfo?: {
    fullName?: string;
    phone?: string;
    email?: string;
  };
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  deliveryAddress?: {
    address?: string;
    city?: string;
  };
  address?: string;
  city?: string;
  specialInstructions?: string;
  paymentMethod?: string;
}

interface ReceiptModalProps {
  order: ReceiptOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReceiptModal({ order, open, onOpenChange }: ReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!order) return null;

  // Normalized variables
  const orderId = order.id ? order.id.slice(0, 8).toUpperCase() : 'N/A';
  const customerName = order.contactInfo?.fullName || order.customerName || 'Valued Guest';
  const customerPhone = order.contactInfo?.phone || order.customerPhone || 'N/A';
  const customerEmail = order.contactInfo?.email || order.customerEmail || 'N/A';
  const address = order.deliveryAddress?.address || order.address || 'Dining / Takeout';
  const city = order.deliveryAddress?.city || order.city || '';
  const fullAddress = city ? `${address}, ${city}` : address;
  const items = order.items || [];
  
  // Date calculation
  let orderDate = 'N/A';
  let orderTime = 'N/A';
  if (order.createdAt) {
    let dateObj: Date;
    if (order.createdAt.toDate) {
      dateObj = order.createdAt.toDate();
    } else if (order.createdAt.toMillis) {
      dateObj = new Date(order.createdAt.toMillis());
    } else if (order.createdAt.seconds) {
      dateObj = new Date(order.createdAt.seconds * 1000);
    } else {
      dateObj = new Date(order.createdAt);
    }

    if (!isNaN(dateObj.getTime())) {
      orderDate = dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      orderTime = dateObj.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }

  // Calculate pricing breakdown
  const grandTotal = order.totalAmount || 0;
  const deliveryFee = 5.00;
  const calculatedSubtotal = items.length > 0 
    ? items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    : Math.max(0, grandTotal - deliveryFee);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyReceipt = () => {
    const textSummary = `
🧾 SAVORA RESTAURANT - OFFICIAL INVOICE
=====================================
Order ID: #${orderId}
Date: ${orderDate} at ${orderTime}
Customer: ${customerName}
Phone: ${customerPhone}
Address: ${fullAddress}
Status: ${order.status.toUpperCase()}

ITEMS ORDERED:
${items.map(it => `- ${it.name} x${it.quantity} ($${(it.price * it.quantity).toFixed(2)})`).join('\n')}

Subtotal: $${calculatedSubtotal.toFixed(2)}
Delivery Fee: $${deliveryFee.toFixed(2)}
-------------------------------------
TOTAL AMOUNT: $${grandTotal.toFixed(2)}
=====================================
Thank you for dining with Savora!
    `.trim();

    navigator.clipboard.writeText(textSummary);
    toast.success('Receipt details copied to clipboard!');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl w-full p-0 overflow-hidden rounded-3xl bg-card border border-border/60 shadow-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Order Receipt #{orderId}</DialogTitle>
        </DialogHeader>

        {/* Printable Area */}
        <div ref={receiptRef} className="print-area p-6 sm:p-8 bg-card text-foreground max-h-[85vh] overflow-y-auto">
          {/* Header Branding */}
          <div className="text-center pb-6 border-b border-dashed border-border/80 relative">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary mb-3">
              <Sparkles className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-foreground uppercase">
              Savora Restaurant
            </h2>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">
              Luxury Dining & Gourmet Delivery
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">
              100 Culinary Avenue, Suite 400 • Tel: +1 (555) 728-6721
            </p>
            
            <div className="mt-4 flex items-center justify-center gap-2">
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-mono text-xs px-3 py-1">
                INVOICE #{orderId}
              </Badge>
              <Badge className="capitalize text-xs px-3 py-1 font-semibold">
                {order.status}
              </Badge>
            </div>
          </div>

          {/* Invoice Meta Grid */}
          <div className="grid grid-cols-2 gap-4 py-5 border-b border-dashed border-border/80 text-xs">
            <div>
              <p className="text-muted-foreground uppercase tracking-wider font-semibold text-[10px]">Billed To</p>
              <p className="font-bold text-foreground mt-1 text-sm">{customerName}</p>
              <p className="text-muted-foreground mt-0.5">{customerPhone}</p>
              <p className="text-muted-foreground">{customerEmail}</p>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground uppercase tracking-wider font-semibold text-[10px]">Order Details</p>
              <p className="font-semibold text-foreground mt-1">{orderDate}</p>
              <p className="text-muted-foreground mt-0.5">{orderTime}</p>
              <p className="text-muted-foreground mt-0.5">
                Pay: <span className="font-medium text-foreground">{order.paymentMethod || 'Cash on Delivery'}</span>
              </p>
            </div>
          </div>

          {/* Delivery Location */}
          <div className="py-3.5 border-b border-dashed border-border/80 text-xs">
            <p className="text-muted-foreground uppercase tracking-wider font-semibold text-[10px] mb-1">
              Delivery Address
            </p>
            <div className="flex items-start gap-1.5 text-foreground font-medium">
              <MapPin className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
              <span>{fullAddress}</span>
            </div>
            {order.specialInstructions && (
              <p className="text-[11px] text-muted-foreground mt-1.5 italic bg-muted/40 p-2 rounded-lg">
                Note: {order.specialInstructions}
              </p>
            )}
          </div>

          {/* Itemized Table */}
          <div className="py-5 border-b border-dashed border-border/80">
            <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider text-muted-foreground pb-2 border-b border-border/40">
              <span>Item Description</span>
              <div className="flex gap-8">
                <span>Qty</span>
                <span className="w-16 text-right">Total</span>
              </div>
            </div>

            <div className="divide-y divide-border/20 py-2">
              {items.length === 0 ? (
                <div className="py-4 text-center text-xs text-muted-foreground">
                  Order items details archived
                </div>
              ) : (
                items.map((item, idx) => (
                  <div key={item.id || idx} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex-1 min-w-0 pr-4">
                      <p className="font-semibold text-foreground truncate">{item.name}</p>
                      {item.addons && item.addons.length > 0 && (
                        <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                          + {item.addons.map((a: any) => a.name).join(', ')}
                        </p>
                      )}
                      <p className="text-[11px] text-muted-foreground mt-0.5">${item.price.toFixed(2)} each</p>
                    </div>
                    <div className="flex items-center gap-8 font-medium">
                      <span className="text-muted-foreground">x{item.quantity}</span>
                      <span className="w-16 text-right font-bold text-foreground">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Pricing Totals */}
          <div className="py-4 border-b border-border/60 space-y-2 text-xs">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span className="font-medium text-foreground">${calculatedSubtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Delivery Fee</span>
              <span className="font-medium text-foreground">${deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-foreground pt-2 border-t border-dashed border-border/80">
              <span className="text-primary">Grand Total</span>
              <span className="text-primary">${grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Footer Note & Barcode Mock */}
          <div className="text-center pt-6 space-y-3">
            <p className="text-xs font-semibold text-foreground">
              Thank you for ordering with Savora! 🥂
            </p>
            <p className="text-[10px] text-muted-foreground max-w-xs mx-auto">
              For any questions regarding your order or billing, please contact our support team at support@savora-restaurant.com.
            </p>
            
            {/* Visual Barcode */}
            <div className="pt-2 flex flex-col items-center justify-center opacity-70">
              <div className="h-7 w-48 bg-gradient-to-r from-foreground via-muted-foreground to-foreground opacity-30 flex items-center justify-center rounded-sm">
                <span className="font-mono text-[9px] tracking-[0.3em] font-bold text-background bg-foreground px-2 py-0.5">
                  *{orderId}*
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls (Hidden on print) */}
        <div className="p-4 bg-muted/30 border-t border-border/60 flex flex-wrap gap-2.5 justify-end print:hidden">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopyReceipt}
            className="rounded-full text-xs gap-1.5 h-10 px-4"
          >
            <Copy className="h-3.5 w-3.5" />
            <span>Copy Text</span>
          </Button>

          <Button
            type="button"
            onClick={handlePrint}
            className="rounded-full text-xs gap-1.5 h-10 px-5 shadow-sm"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print Receipt</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
