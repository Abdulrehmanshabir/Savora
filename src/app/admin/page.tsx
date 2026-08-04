'use client';

import { useEffect, useState, useMemo } from 'react';
import { db } from '@/firebase/client';
import { collection, getDocs } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingBag, Calendar, DollarSign, Loader2, Clock, 
  TrendingUp, Utensils, Receipt, ArrowRight, Eye, ChevronRight,
  Flame, CheckCircle2, AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { ReceiptModal, ReceiptOrder } from '@/components/orders/ReceiptModal';

type TimeFrame = 'today' | 'yesterday' | 'week' | 'month' | 'all';

interface OrderItem {
  id?: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface OrderData {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: any;
  items?: OrderItem[];
  customerName?: string;
  customerEmail?: string;
  contactInfo?: {
    fullName?: string;
    phone?: string;
    email?: string;
  };
  deliveryAddress?: {
    address?: string;
    city?: string;
  };
  address?: string;
  city?: string;
  specialInstructions?: string;
  paymentMethod?: string;
}

export default function AdminOverview() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('today');
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<ReceiptOrder | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [ordersSnap, resSnap] = await Promise.all([
          getDocs(collection(db, 'orders')),
          getDocs(collection(db, 'reservations'))
        ]);

        const fetchedOrders: OrderData[] = ordersSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as OrderData));

        fetchedOrders.sort((a, b) => {
          const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0);
          const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0);
          return bTime - aTime;
        });

        const fetchedRes = resSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setOrders(fetchedOrders);
        setReservations(fetchedRes);
      } catch (error) {
        console.error("Error fetching admin data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Helper to extract timestamp from Firestore field
  const getOrderTimestamp = (order: OrderData): number => {
    if (!order.createdAt) return 0;
    if (order.createdAt.toMillis) return order.createdAt.toMillis();
    if (order.createdAt.seconds) return order.createdAt.seconds * 1000;
    if (order.createdAt.toDate) return order.createdAt.toDate().getTime();
    return new Date(order.createdAt).getTime() || 0;
  };

  // Filter orders based on selected timeFrame
  const filteredOrders = useMemo(() => {
    const now = new Date();
    
    // Start of Today (00:00:00)
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    
    // Start of Yesterday (00:00:00)
    const yesterdayStart = todayStart - 24 * 60 * 60 * 1000;
    
    // Start of Week (7 days ago)
    const weekStart = now.getTime() - 7 * 24 * 60 * 60 * 1000;
    
    // Start of Month (1st day of current month)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    return orders.filter(order => {
      const orderTime = getOrderTimestamp(order);
      if (orderTime === 0) return timeFrame === 'all';

      switch (timeFrame) {
        case 'today':
          return orderTime >= todayStart;
        case 'yesterday':
          return orderTime >= yesterdayStart && orderTime < todayStart;
        case 'week':
          return orderTime >= weekStart;
        case 'month':
          return orderTime >= monthStart;
        case 'all':
        default:
          return true;
      }
    });
  }, [orders, timeFrame]);

  // Aggregated calculations for selected timeframe
  const metrics = useMemo(() => {
    const periodRevenue = filteredOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const periodOrdersCount = filteredOrders.length;
    const avgOrderValue = periodOrdersCount > 0 ? periodRevenue / periodOrdersCount : 0;
    
    const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;
    const pendingResCount = reservations.filter(r => r.status === 'pending').length;

    // Item breakdown: what was ordered in this timeframe
    const itemMap = new Map<string, { name: string; quantity: number; totalRevenue: number; image?: string }>();
    
    filteredOrders.forEach(order => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
          const key = item.name || 'Unknown Dish';
          const existing = itemMap.get(key) || { name: key, quantity: 0, totalRevenue: 0, image: item.image };
          existing.quantity += item.quantity || 1;
          existing.totalRevenue += (item.price || 0) * (item.quantity || 1);
          if (!existing.image && item.image) existing.image = item.image;
          itemMap.set(key, existing);
        });
      }
    });

    const itemBreakdown = Array.from(itemMap.values()).sort((a, b) => b.quantity - a.quantity);

    return {
      periodRevenue,
      periodOrdersCount,
      avgOrderValue,
      pendingOrdersCount,
      pendingResCount,
      itemBreakdown
    };
  }, [filteredOrders, orders, reservations]);

  const handleOpenReceipt = (order: OrderData) => {
    setSelectedReceiptOrder(order);
    setIsReceiptOpen(true);
  };

  const getTimeFrameLabel = () => {
    switch (timeFrame) {
      case 'today': return "Today's";
      case 'yesterday': return "Yesterday's";
      case 'week': return "Last 7 Days";
      case 'month': return "This Month's";
      case 'all': return "All-Time";
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'delivered': 
        return <Badge className="bg-green-500/10 text-green-600 border-green-200">Delivered</Badge>;
      case 'preparing': 
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-200">Preparing</Badge>;
      case 'out_for_delivery': 
        return <Badge className="bg-purple-500/10 text-purple-600 border-purple-200">Out for Delivery</Badge>;
      case 'cancelled': 
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Cancelled</Badge>;
      default: 
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-200">Pending</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-8">
      {/* Header & Time Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-card p-6 rounded-3xl border border-border/50 shadow-xs">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Sales & Analytics Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time sales revenue, ordered food breakdown, and order receipts.
          </p>
        </div>

        {/* Timeframe Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 bg-muted/60 p-1.5 rounded-2xl border border-border/40">
          <Button
            size="sm"
            variant={timeFrame === 'today' ? 'default' : 'ghost'}
            onClick={() => setTimeFrame('today')}
            className={`rounded-xl text-xs font-semibold h-9 px-3.5 transition-all ${timeFrame === 'today' ? 'shadow-xs' : 'text-muted-foreground'}`}
          >
            Today
          </Button>
          <Button
            size="sm"
            variant={timeFrame === 'yesterday' ? 'default' : 'ghost'}
            onClick={() => setTimeFrame('yesterday')}
            className={`rounded-xl text-xs font-semibold h-9 px-3.5 transition-all ${timeFrame === 'yesterday' ? 'shadow-xs' : 'text-muted-foreground'}`}
          >
            Yesterday
          </Button>
          <Button
            size="sm"
            variant={timeFrame === 'week' ? 'default' : 'ghost'}
            onClick={() => setTimeFrame('week')}
            className={`rounded-xl text-xs font-semibold h-9 px-3.5 transition-all ${timeFrame === 'week' ? 'shadow-xs' : 'text-muted-foreground'}`}
          >
            Last 7 Days
          </Button>
          <Button
            size="sm"
            variant={timeFrame === 'month' ? 'default' : 'ghost'}
            onClick={() => setTimeFrame('month')}
            className={`rounded-xl text-xs font-semibold h-9 px-3.5 transition-all ${timeFrame === 'month' ? 'shadow-xs' : 'text-muted-foreground'}`}
          >
            This Month
          </Button>
          <Button
            size="sm"
            variant={timeFrame === 'all' ? 'default' : 'ghost'}
            onClick={() => setTimeFrame('all')}
            className={`rounded-xl text-xs font-semibold h-9 px-3.5 transition-all ${timeFrame === 'all' ? 'shadow-xs' : 'text-muted-foreground'}`}
          >
            Lifetime
          </Button>
        </div>
      </div>

      {/* Dynamic Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Sales in Selected Timeframe */}
        <Card className="rounded-3xl border-border/50 shadow-xs bg-gradient-to-br from-card to-emerald-500/5 hover:border-emerald-500/30 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {getTimeFrameLabel()} Sales
            </CardTitle>
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <DollarSign className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black tracking-tight text-foreground">
              ${metrics.periodRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 font-medium">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              <span>{metrics.periodOrdersCount} orders placed in this period</span>
            </p>
          </CardContent>
        </Card>

        {/* Orders Placed in Selected Timeframe */}
        <Card className="rounded-3xl border-border/50 shadow-xs bg-gradient-to-br from-card to-primary/5 hover:border-primary/30 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {getTimeFrameLabel()} Orders
            </CardTitle>
            <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <ShoppingBag className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black tracking-tight text-foreground">
              {metrics.periodOrdersCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">
              Average: <span className="text-foreground font-bold">${metrics.avgOrderValue.toFixed(2)}</span> / order
            </p>
          </CardContent>
        </Card>

        {/* Pending Orders (Requires Action) */}
        <Card className="rounded-3xl border-border/50 shadow-xs bg-gradient-to-br from-card to-amber-500/5 hover:border-amber-500/30 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Pending Orders
            </CardTitle>
            <div className="h-10 w-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Clock className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black tracking-tight text-amber-500">
              {metrics.pendingOrdersCount}
            </div>
            <Link 
              href="/admin/orders" 
              className="text-xs text-primary hover:underline font-bold mt-1 inline-flex items-center gap-1"
            >
              <span>Manage live orders</span>
              <ChevronRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>

        {/* Pending Table Reservations */}
        <Card className="rounded-3xl border-border/50 shadow-xs bg-gradient-to-br from-card to-blue-500/5 hover:border-blue-500/30 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Pending Tables
            </CardTitle>
            <div className="h-10 w-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Calendar className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black tracking-tight text-blue-500">
              {metrics.pendingResCount}
            </div>
            <Link 
              href="/admin/reservations" 
              className="text-xs text-primary hover:underline font-bold mt-1 inline-flex items-center gap-1"
            >
              <span>Review bookings</span>
              <ChevronRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: What Was Ordered Breakdown + Recent Orders with Receipts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Orders within Selected Timeframe & Receipt Action */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-3xl border border-border/50 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/40">
              <div>
                <h3 className="text-lg font-bold tracking-tight">
                  {getTimeFrameLabel()} Orders List
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Showing {filteredOrders.length} order(s) for this timeframe
                </p>
              </div>

              <Link href="/admin/orders">
                <Button variant="outline" size="sm" className="rounded-full text-xs gap-1.5">
                  <span>View All Orders</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground flex flex-col items-center justify-center">
                <div className="h-14 w-14 rounded-2xl bg-muted/60 flex items-center justify-center mb-3 text-muted-foreground">
                  <ShoppingBag className="h-6 w-6" />
                </div>
                <p className="font-semibold text-foreground">No orders recorded for {getTimeFrameLabel().toLowerCase()} period</p>
                <p className="text-xs text-muted-foreground mt-1">Try switching to "This Month" or "Lifetime" to see all order histories.</p>
              </div>
            ) : (
              <div className="divide-y divide-border/40">
                {filteredOrders.slice(0, 8).map((order) => {
                  const orderDate = order.createdAt?.toDate 
                    ? order.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : 'Recent';
                  const customer = order.contactInfo?.fullName || order.customerName || 'Guest User';
                  
                  return (
                    <div key={order.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/20 px-2 rounded-2xl transition-colors">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="h-10 w-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 text-primary font-bold text-xs mt-0.5">
                          <Receipt className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-sm text-foreground truncate">
                              #{order.id.slice(0, 6).toUpperCase()}
                            </p>
                            {getStatusBadge(order.status)}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            By <span className="font-semibold text-foreground">{customer}</span> • {order.items?.length || 0} items • {orderDate}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                        <span className="font-black text-base text-foreground">
                          ${order.totalAmount?.toFixed(2)}
                        </span>
                        
                        {/* Receipt Button */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenReceipt(order)}
                          className="rounded-full text-xs h-8 px-3 gap-1.5 border-primary/30 text-primary hover:bg-primary hover:text-white transition-all shadow-2xs cursor-pointer"
                        >
                          <Receipt className="h-3.5 w-3.5" />
                          <span>Receipt</span>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: "What Was Ordered" Item Breakdown */}
        <div className="space-y-6">
          <div className="bg-card rounded-3xl border border-border/50 p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border/40">
              <div className="h-8 w-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Flame className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-base font-bold">What Was Ordered</h3>
                <p className="text-xs text-muted-foreground">Dishes sold in {getTimeFrameLabel().toLowerCase()} timeframe</p>
              </div>
            </div>

            {metrics.itemBreakdown.length === 0 ? (
              <div className="py-10 text-center text-xs text-muted-foreground">
                No item sales recorded for this timeframe.
              </div>
            ) : (
              <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
                {metrics.itemBreakdown.map((item, idx) => {
                  const maxQty = metrics.itemBreakdown[0]?.quantity || 1;
                  const percent = Math.min(100, Math.round((item.quantity / maxQty) * 100));

                  return (
                    <div key={idx} className="space-y-1.5 p-3 rounded-2xl bg-muted/30 border border-border/30">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          <span className="h-5 w-5 rounded-full bg-primary/10 text-primary font-bold text-[10px] flex items-center justify-center shrink-0">
                            #{idx + 1}
                          </span>
                          <p className="font-bold text-foreground truncate">{item.name}</p>
                        </div>
                        <span className="font-black text-primary shrink-0">
                          ${item.totalRevenue.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>Quantity Sold: <strong className="text-foreground">{item.quantity}x</strong></span>
                        <span>{percent}% of top</span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-primary to-amber-400 h-full rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Management Short-links */}
          <div className="bg-card rounded-3xl border border-border/50 p-6 shadow-xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Admin Quick Actions
            </h4>
            <div className="grid grid-cols-2 gap-2.5">
              <Link href="/admin/menu" className="p-3 rounded-2xl bg-muted/40 hover:bg-primary/10 hover:text-primary transition-all border border-border/30 flex flex-col items-center text-center gap-1.5">
                <Utensils className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold">Manage Menu</span>
              </Link>

              <Link href="/admin/reservations" className="p-3 rounded-2xl bg-muted/40 hover:bg-primary/10 hover:text-primary transition-all border border-border/30 flex flex-col items-center text-center gap-1.5">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold">Table Bookings</span>
              </Link>
            </div>
          </div>
        </div>

      </div>

      {/* Global Receipt Modal */}
      <ReceiptModal
        order={selectedReceiptOrder}
        open={isReceiptOpen}
        onOpenChange={setIsReceiptOpen}
      />
    </div>
  );
}
