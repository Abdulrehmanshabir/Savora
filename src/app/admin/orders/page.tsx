'use client';

import { useEffect, useState } from 'react';
import { db } from '@/firebase/client';
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Receipt, Clock, CheckCircle2, ChevronDown, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { sendNotification } from '@/lib/notifications';
import { ReceiptModal, ReceiptOrder } from '@/components/orders/ReceiptModal';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<ReceiptOrder | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        const fetched: any[] = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
        setOrders(fetched);
        setFilteredOrders(fetched);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching orders:', error);
        toast.error('Failed to load orders');
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      setFilteredOrders(orders.filter(o =>
        o.id.toLowerCase().includes(q) ||
        o.customerEmail?.toLowerCase().includes(q) ||
        o.customerName?.toLowerCase().includes(q) ||
        o.contactInfo?.fullName?.toLowerCase().includes(q) ||
        o.contactInfo?.email?.toLowerCase().includes(q)
      ));
    } else {
      setFilteredOrders(orders);
    }
  }, [searchQuery, orders]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
      
      // Update local state
      const targetOrder = orders.find(o => o.id === orderId);
      const updated = orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
      setOrders(updated);

      // Send notification to customer
      if (targetOrder?.userId) {
        let statusTitle = `Order Status: ${newStatus.toUpperCase()}`;
        let statusMsg = `Your order #${orderId.slice(0, 6).toUpperCase()} status is now ${newStatus}.`;

        if (newStatus === 'preparing') {
          statusTitle = 'Order In Preparation 🍳';
          statusMsg = `Chef is preparing your order #${orderId.slice(0, 6).toUpperCase()}. It will be ready soon!`;
        } else if (newStatus === 'out_for_delivery') {
          statusTitle = 'Order Out for Delivery 🛵';
          statusMsg = `Good news! Your order #${orderId.slice(0, 6).toUpperCase()} is on its way to you.`;
        } else if (newStatus === 'delivered') {
          statusTitle = 'Order Delivered 🎉';
          statusMsg = `Your order #${orderId.slice(0, 6).toUpperCase()} has been delivered. Enjoy your meal!`;
        } else if (newStatus === 'cancelled') {
          statusTitle = 'Order Cancelled ❌';
          statusMsg = `Your order #${orderId.slice(0, 6).toUpperCase()} has been cancelled. Contact support for help.`;
        }

        await sendNotification({
          userId: targetOrder.userId,
          title: statusTitle,
          message: statusMsg,
          type: 'order',
          link: '/dashboard?tab=orders',
          metadata: { orderId, status: newStatus }
        });
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'delivered': return 'bg-green-500/10 text-green-600 border-green-200';
      case 'preparing': return 'bg-blue-500/10 text-blue-600 border-blue-200';
      case 'out_for_delivery': return 'bg-purple-500/10 text-purple-600 border-purple-200';
      case 'cancelled': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-amber-500/10 text-amber-600 border-amber-200';
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
            Orders Management
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-500/10 border border-green-200 rounded-full px-2.5 py-0.5">
              <span className="inline-flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              Live
            </span>
          </h1>
          <p className="text-muted-foreground">Track and update customer orders in real-time.</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search Order ID or Name..." 
            className="pl-9 bg-card rounded-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-card rounded-[2rem] border border-border/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground font-semibold uppercase tracking-wider text-xs border-b border-border/50">
              <tr>
                <th className="px-6 py-4">Order Details</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Status & Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    No orders found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/20 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <Receipt className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-mono font-semibold">#{order.id.slice(0, 6).toUpperCase()}</p>
                          <p className="text-xs text-muted-foreground">{order.items?.length || 0} items</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-foreground">{order.customerName || 'Guest'}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[150px]">{order.customerEmail || 'No email'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-base">${order.totalAmount?.toFixed(2)}</p>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        {order.createdAt ? new Date(order.createdAt.toMillis()).toLocaleDateString() : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Receipt Button */}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedReceiptOrder(order);
                            setIsReceiptOpen(true);
                          }}
                          className="rounded-full text-xs h-9 px-3 gap-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                          title="View / Print Receipt"
                        >
                          <Receipt className="h-4 w-4" />
                          <span className="hidden sm:inline">Receipt</span>
                        </Button>

                        {/* Status Dropdown */}
                        <DropdownMenu>
                          <DropdownMenuTrigger render={
                            <Button variant="outline" className={`rounded-full h-9 px-4 border ${getStatusColor(order.status)}`}>
                              {order.status}
                              <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                            </Button>
                          } />
                          <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-lg border-border/40">
                            <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'pending')} className="cursor-pointer font-medium hover:bg-amber-500/10 hover:text-amber-600 rounded-lg m-1">
                              Pending
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'preparing')} className="cursor-pointer font-medium hover:bg-blue-500/10 hover:text-blue-600 rounded-lg m-1">
                              Preparing
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'out_for_delivery')} className="cursor-pointer font-medium hover:bg-purple-500/10 hover:text-purple-600 rounded-lg m-1">
                              Out for Delivery
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'delivered')} className="cursor-pointer font-medium hover:bg-green-500/10 hover:text-green-600 rounded-lg m-1">
                              Delivered
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'cancelled')} className="cursor-pointer font-medium text-destructive hover:bg-destructive/10 rounded-lg m-1">
                              Cancelled
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Receipt Modal */}
      <ReceiptModal
        order={selectedReceiptOrder}
        open={isReceiptOpen}
        onOpenChange={setIsReceiptOpen}
      />
    </div>
  );
}
