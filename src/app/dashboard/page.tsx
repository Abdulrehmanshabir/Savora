'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/firebase/client';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  ShoppingBag, 
  Utensils, 
  User, 
  Users, 
  LogOut, 
  Loader2, 
  MapPin, 
  Receipt, 
  CheckCircle2, 
  Bell, 
  Star, 
  MessageSquare, 
  Quote, 
  ArrowRight,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ReceiptModal, ReceiptOrder } from '@/components/orders/ReceiptModal';

function DashboardContent() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const initialTab = searchParams.get('tab') || 'orders';
  const [activeTab, setActiveTab] = useState(initialTab);

  const [orders, setOrders] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<ReceiptOrder | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      
      try {
        const ordersQuery = query(collection(db, 'orders'), where('userId', '==', user.uid));
        const ordersSnap = await getDocs(ordersQuery);
        const fetchedOrders: any[] = ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        fetchedOrders.sort((a, b) => (b.createdAt?.toMillis ? b.createdAt.toMillis() : 0) - (a.createdAt?.toMillis ? a.createdAt.toMillis() : 0));
        setOrders(fetchedOrders);

        const resQuery = query(collection(db, 'reservations'), where('userId', '==', user.uid));
        const resSnap = await getDocs(resQuery);
        const fetchedRes: any[] = resSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        fetchedRes.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setReservations(fetchedRes);

        const notifQuery = query(collection(db, 'notifications', user.uid, 'items'));
        const notifSnap = await getDocs(notifQuery);
        const fetchedNotif: any[] = notifSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        fetchedNotif.sort((a, b) => (b.createdAt?.toMillis ? b.createdAt.toMillis() : 0) - (a.createdAt?.toMillis ? a.createdAt.toMillis() : 0));
        setNotifications(fetchedNotif);

        const revQuery = query(collection(db, 'reviews'), where('userId', '==', user.uid));
        const revSnap = await getDocs(revQuery);
        const fetchedRev: any[] = revSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        fetchedRev.sort((a, b) => (b.createdAt?.toMillis ? b.createdAt.toMillis() : 0) - (a.createdAt?.toMillis ? a.createdAt.toMillis() : 0));
        setReviews(fetchedRev);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsFetching(false);
      }
    }

    if (user && !loading) {
      fetchData();
    }
  }, [user, loading]);

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  const markNotificationAsRead = async (id: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'notifications', user.uid, 'items', id), { isRead: true });
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleNotificationClick = (notif: any) => {
    if (!notif.isRead) {
      markNotificationAsRead(notif.id);
    }
    if (notif.link) {
      router.push(notif.link);
    }
  };

  const getNotifIcon = (type?: string, isRead?: boolean) => {
    switch(type) {
      case 'review':
        return (
          <div className={cn("h-12 w-12 rounded-full flex items-center justify-center shrink-0", isRead ? "bg-muted text-muted-foreground" : "bg-amber-500/15 text-amber-600")}>
            <MessageSquare className="h-5 w-5" />
          </div>
        );
      case 'order':
        return (
          <div className={cn("h-12 w-12 rounded-full flex items-center justify-center shrink-0", isRead ? "bg-muted text-muted-foreground" : "bg-blue-500/15 text-blue-600")}>
            <ShoppingBag className="h-5 w-5" />
          </div>
        );
      case 'reservation':
        return (
          <div className={cn("h-12 w-12 rounded-full flex items-center justify-center shrink-0", isRead ? "bg-muted text-muted-foreground" : "bg-purple-500/15 text-purple-600")}>
            <Calendar className="h-5 w-5" />
          </div>
        );
      default:
        return (
          <div className={cn("h-12 w-12 rounded-full flex items-center justify-center shrink-0", isRead ? "bg-muted text-muted-foreground" : "bg-primary/20 text-primary")}>
            <Sparkles className="h-5 w-5" />
          </div>
        );
    }
  };

  if (loading || isFetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="relative">
          <div className="absolute -inset-4 bg-primary/20 blur-xl rounded-full"></div>
          <Loader2 className="h-12 w-12 animate-spin text-primary relative z-10" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] pt-12 pb-24">
      <div className="container mx-auto px-4 max-w-5xl">
        
        {/* Modern Header */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-card rounded-[2rem] p-8 shadow-sm border border-border/40 mb-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          
          <div className="flex items-center gap-6 z-10 w-full md:w-auto mb-6 md:mb-0">
            <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-primary to-amber-400 p-1 shadow-lg shadow-primary/20 shrink-0">
              <div className="h-full w-full rounded-full bg-card flex items-center justify-center overflow-hidden border-2 border-background">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name || 'User'} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold text-primary">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                )}
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">{user.name || 'Guest User'}</h1>
              <p className="text-muted-foreground font-medium mt-1">{user.email}</p>
            </div>
          </div>
          
          <Button variant="outline" onClick={handleLogout} className="z-10 rounded-full px-6 h-12 border-border hover:bg-destructive/5 hover:text-destructive hover:border-destructive/30 transition-all w-full md:w-auto">
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex flex-wrap h-auto w-full md:w-fit bg-muted/50 p-1.5 rounded-2xl mb-10 mx-auto md:mx-0">
            <TabsTrigger value="orders" className="flex-1 min-w-[110px] rounded-xl py-3 text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all">
              <ShoppingBag className="w-4 h-4 mr-2" /> Orders
            </TabsTrigger>
            <TabsTrigger value="reservations" className="flex-1 min-w-[110px] rounded-xl py-3 text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all">
              <Calendar className="w-4 h-4 mr-2" /> Tables
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex-1 min-w-[110px] rounded-xl py-3 text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all">
              <Star className="w-4 h-4 mr-2" /> My Reviews
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex-1 min-w-[120px] rounded-xl py-3 text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all relative">
              <Bell className="w-4 h-4 mr-2" /> Notifications
              {notifications.some(n => !n.isRead) && (
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive animate-pulse"></span>
              )}
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex-1 min-w-[110px] rounded-xl py-3 text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all">
              <User className="w-4 h-4 mr-2" /> Profile
            </TabsTrigger>
          </TabsList>
          
          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6 focus-visible:outline-none focus-visible:ring-0">
            {orders.length === 0 ? (
              <div className="text-center py-24 bg-card rounded-[2rem] border border-border/40 shadow-sm flex flex-col items-center justify-center">
                <div className="h-24 w-24 bg-primary/5 rounded-full flex items-center justify-center mb-6">
                  <ShoppingBag className="h-10 w-10 text-primary/40" />
                </div>
                <h3 className="text-2xl font-bold mb-2">No orders yet</h3>
                <p className="text-muted-foreground mb-8 max-w-sm">Looks like you haven't tasted our amazing dishes yet. Order now!</p>
                <Button onClick={() => router.push('/menu')} className="rounded-full px-10 h-14 text-lg shadow-primary/25 shadow-lg">Explore Menu</Button>
              </div>
            ) : (
              <div className="grid gap-6">
                {orders.map((order) => (
                  <div key={order.id} className="bg-card rounded-[2rem] border border-border/40 p-6 md:p-8 shadow-sm hover:shadow-md transition-all">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-border/40 gap-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                          <Receipt className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-mono text-sm text-muted-foreground">ORDER #{order.id.slice(0, 8).toUpperCase()}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {order.createdAt ? new Date(order.createdAt.toMillis()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}
                          </p>
                        </div>
                      </div>
                      <Badge className={cn(
                        "rounded-full px-4 py-1 text-xs uppercase tracking-wider font-bold shadow-none",
                        order.status === 'delivered' ? "bg-green-500/10 text-green-600 border border-green-200" :
                        order.status === 'preparing' ? "bg-blue-500/10 text-blue-600 border border-blue-200" :
                        order.status === 'out_for_delivery' ? "bg-purple-500/10 text-purple-600 border border-purple-200" :
                        order.status === 'cancelled' ? "bg-destructive/10 text-destructive border border-destructive/20" :
                        "bg-amber-500/10 text-amber-600 border border-amber-200"
                      )}>
                        {order.status}
                      </Badge>
                    </div>

                    <div className="py-6 border-b border-border/40 space-y-4">
                      {order.items?.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center text-sm">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-primary">{item.quantity}x</span>
                            <span className="font-medium text-foreground">{item.name}</span>
                          </div>
                          <span className="font-semibold text-muted-foreground">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-6 gap-4 border-t border-border/20">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Deliver to: </span>
                        <span className="font-medium text-foreground">{order.deliveryAddress?.address || 'Pickup'}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 mr-2">
                          <span className="text-sm text-muted-foreground">Total:</span>
                          <span className="text-2xl font-black text-foreground">${order.totalAmount?.toFixed(2)}</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedReceiptOrder(order);
                            setIsReceiptOpen(true);
                          }}
                          className="rounded-full text-xs h-9 px-4 gap-1.5 border-primary/30 text-primary hover:bg-primary hover:text-white transition-all shadow-xs cursor-pointer"
                        >
                          <Receipt className="h-4 w-4" />
                          <span>View Receipt</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Tables/Reservations Tab */}
          <TabsContent value="reservations" className="space-y-6 focus-visible:outline-none focus-visible:ring-0">
            {reservations.length === 0 ? (
              <div className="text-center py-24 bg-card rounded-[2rem] border border-border/40 shadow-sm flex flex-col items-center justify-center">
                <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                  <Calendar className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-2">No table bookings</h3>
                <p className="text-muted-foreground mb-8 max-w-sm">Planning a dinner or family gathering? Reserve your preferred spot in advance!</p>
                <Button onClick={() => router.push('/reservation')} className="rounded-full px-10 h-14 text-lg shadow-primary/25 shadow-lg bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-600 text-white">Reserve a Table</Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center px-1">
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Your Table Bookings</h3>
                    <p className="text-xs text-muted-foreground">Manage your upcoming and past dining reservations</p>
                  </div>
                  <Button 
                    onClick={() => router.push('/reservation')} 
                    size="sm" 
                    className="rounded-full px-5 h-10 font-bold bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/20"
                  >
                    + Book New Table
                  </Button>
                </div>

                <div className="grid gap-4">
                  {reservations.map((res) => (
                    <div key={res.id} className="bg-card rounded-3xl border border-border/40 p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 hover:border-primary/30 transition-all">
                      <div className="flex items-center gap-5">
                        <div className="h-16 w-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col items-center justify-center text-amber-600 shrink-0 shadow-xs">
                          <span className="text-[11px] font-bold uppercase tracking-wider">{new Date(res.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                          <span className="text-2xl font-black leading-none">{new Date(res.date).getDate()}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2.5">
                            <h4 className="font-bold text-lg text-foreground">{res.guests} Guests Dining</h4>
                            <Badge className={cn(
                              "rounded-full px-3 py-0.5 text-[10px] uppercase tracking-wider font-bold shadow-none",
                              res.status === 'confirmed' ? "bg-green-500/10 text-green-600 border border-green-200" :
                              res.status === 'cancelled' ? "bg-destructive/10 text-destructive border border-destructive/20" :
                              res.status === 'completed' ? "bg-blue-500/10 text-blue-600 border border-blue-200" :
                              "bg-amber-500/10 text-amber-600 border border-amber-200"
                            )}>
                              {res.status}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mt-2">
                            <span className="flex items-center gap-1 font-medium text-foreground/80"><Clock className="h-3.5 w-3.5 text-primary" /> {res.time}</span>
                            <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" /> {res.userName}</span>
                            <span className="font-mono text-muted-foreground/70">ID: {res.id.slice(0, 8)}</span>
                          </div>
                          {res.specialRequests && (
                            <p className="text-xs text-muted-foreground/90 italic mt-2 bg-muted/40 px-3 py-1 rounded-lg border border-border/30 w-fit">
                              "{res.specialRequests}"
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-6 focus-visible:outline-none focus-visible:ring-0">
            {reviews.length === 0 ? (
              <div className="text-center py-24 bg-card rounded-[2rem] border border-border/40 shadow-sm flex flex-col items-center justify-center">
                <div className="h-24 w-24 bg-primary/5 rounded-full flex items-center justify-center mb-6">
                  <Star className="h-10 w-10 text-primary/40" />
                </div>
                <h3 className="text-2xl font-bold mb-2">No reviews yet</h3>
                <p className="text-muted-foreground mb-8 max-w-sm">You haven't left any feedback or food reviews yet.</p>
                <Button onClick={() => router.push('/reviews')} className="rounded-full px-10 h-14 text-lg shadow-primary/25 shadow-lg">Write a Review</Button>
              </div>
            ) : (
              <div className="space-y-6">
                {reviews.map((rev) => {
                  const targetLink = (!rev.itemId || rev.itemId === 'restaurant')
                    ? `/reviews#review-${rev.id}`
                    : `/menu/${rev.itemId}#review-${rev.id}`;

                  return (
                    <div key={rev.id} className="bg-card p-6 md:p-8 rounded-[2rem] border border-border/40 shadow-sm transition-all duration-300">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs font-semibold">
                              {rev.itemId === 'restaurant' ? 'Overall Restaurant Feedback' : `Dish: ${rev.itemName || 'Special Dish'}`}
                            </Badge>
                            <Badge className={cn("text-xs", rev.status === 'published' ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground")}>
                              {rev.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {rev.createdAt ? new Date(rev.createdAt.toMillis ? rev.createdAt.toMillis() : Date.now()).toLocaleDateString('en-US', {
                              month: 'long', day: 'numeric', year: 'numeric'
                            }) : 'Just now'}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 bg-secondary/10 px-3 py-1.5 rounded-full border border-secondary/20 w-fit">
                            <Star className="h-4 w-4 fill-secondary text-secondary" />
                            <span className="text-sm font-bold text-secondary">{rev.rating}.0</span>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="rounded-full text-xs text-primary hover:bg-primary/10 gap-1 h-8"
                            onClick={() => router.push(targetLink)}
                          >
                            View Live <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      <div className="bg-muted/30 p-4 rounded-2xl border border-border/40 text-foreground/90 text-sm italic">
                        "{rev.comment}"
                      </div>

                      {rev.adminResponse && (
                        <div className="mt-4 bg-primary/5 p-5 rounded-2xl border border-primary/10 relative ml-4 md:ml-8">
                          <p className="text-xs font-bold text-primary mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                            <MessageSquare className="h-4 w-4" />
                            Owner's Response
                          </p>
                          <p className="text-sm text-foreground/80 leading-relaxed">
                            {rev.adminResponse}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6 focus-visible:outline-none focus-visible:ring-0">
            {notifications.length === 0 ? (
              <div className="text-center py-24 bg-card rounded-[2rem] border border-border/40 shadow-sm flex flex-col items-center justify-center">
                <div className="h-24 w-24 bg-primary/5 rounded-full flex items-center justify-center mb-6">
                  <Bell className="h-10 w-10 text-primary/40" />
                </div>
                <h3 className="text-2xl font-bold mb-2">No notifications</h3>
                <p className="text-muted-foreground mb-8 max-w-sm">You're all caught up! Check back later for updates on your reviews and orders.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {notifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    onClick={() => handleNotificationClick(notif)}
                    className={cn(
                      "p-6 rounded-[2rem] border shadow-sm flex items-start gap-5 transition-all duration-300 cursor-pointer group hover:shadow-md", 
                      notif.isRead ? "bg-card border-border/40" : "bg-primary/5 border-primary/20 hover:bg-primary/10"
                    )}
                  >
                    {getNotifIcon(notif.type, notif.isRead)}
                    <div className="flex-1">
                      <div className="flex justify-between items-start gap-4 mb-1">
                        <h4 className={cn("font-bold text-lg leading-tight group-hover:text-primary transition-colors", notif.isRead ? "text-foreground" : "text-primary")}>
                          {notif.title}
                        </h4>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {notif.createdAt ? new Date(notif.createdAt.toMillis ? notif.createdAt.toMillis() : Date.now()).toLocaleDateString() : 'Just now'}
                          </span>
                          {!notif.isRead && (
                            <span className="relative flex h-2.5 w-2.5 shrink-0" title="Unread">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary shadow-sm"></span>
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-muted-foreground leading-relaxed text-sm">
                        {notif.message}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-primary font-semibold mt-3 opacity-80 group-hover:opacity-100 transition-opacity">
                        <span>Click to view details</span>
                        <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          {/* Profile Tab */}
          <TabsContent value="profile" className="focus-visible:outline-none focus-visible:ring-0">
            <div className="bg-card rounded-[2rem] border border-border/40 shadow-sm overflow-hidden relative">
              <div className="absolute top-0 right-0 w-full h-32 bg-gradient-to-br from-primary/10 via-background to-background"></div>
              
              <div className="p-8 md:p-12 relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">Account Details</h2>
                    <p className="text-muted-foreground">Update and manage your personal information.</p>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="bg-muted/30 p-4 rounded-2xl border border-border/40 flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <User className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Full Name</p>
                        <p className="font-semibold text-lg">{user.name || 'Not provided'}</p>
                      </div>
                    </div>

                    <div className="bg-muted/30 p-4 rounded-2xl border border-border/40 flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="overflow-hidden w-full">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Email Address</p>
                        <p className="font-semibold text-lg truncate">{user.email}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">Activity Stats</h2>
                    <p className="text-muted-foreground">A quick overview of your journey with Savora.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-card to-primary/5 p-6 rounded-2xl border border-primary/20 flex flex-col items-center justify-center text-center h-40">
                      <ShoppingBag className="h-8 w-8 text-primary mb-3" />
                      <p className="text-4xl font-black text-foreground">{orders.length}</p>
                      <p className="text-sm font-semibold text-muted-foreground mt-1">Total Orders</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-card to-amber-500/5 p-6 rounded-2xl border border-amber-500/20 flex flex-col items-center justify-center text-center h-40">
                      <Calendar className="h-8 w-8 text-amber-500 mb-3" />
                      <p className="text-4xl font-black text-foreground">{reservations.length}</p>
                      <p className="text-sm font-semibold text-muted-foreground mt-1">Reservations</p>
                    </div>
                  </div>
                  
                  <div className="bg-muted/30 p-4 rounded-2xl border border-border/40 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-foreground/5 flex items-center justify-center text-foreground shrink-0">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div className="overflow-hidden w-full">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Account ID</p>
                      <p className="font-mono text-xs text-muted-foreground truncate">{user.uid}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Order Receipt Modal */}
        <ReceiptModal
          order={selectedReceiptOrder}
          open={isReceiptOpen}
          onOpenChange={setIsReceiptOpen}
        />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
