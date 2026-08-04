'use client';

import { useState, useEffect } from 'react';
import { db } from '@/firebase/client';
import { collection, query, onSnapshot, doc, updateDoc, orderBy, limit } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Bell, Check, MessageSquare, ShoppingBag, Calendar, 
  Sparkles, ArrowRight, UserCheck, Star 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export function AdminNotificationDropdown() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!user || user.role !== 'admin') return;

    // Listen to admin_notifications collection
    const q = query(
      collection(db, 'admin_notifications'),
      orderBy('createdAt', 'desc'),
      limit(25)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetched: any[] = snapshot.docs.map(d => ({
          id: d.id,
          ...d.data(),
        } as any));
        
        fetched.sort((a, b) => {
          const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0);
          const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0);
          return timeB - timeA;
        });

        setNotifications(fetched);
      },
      (error) => {
        console.warn("Admin notifications listener notice:", error.message);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'admin_notifications', id), {
        isRead: true,
      });
    } catch (error) {
      console.error("Error marking admin notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    if (unreadCount === 0) return;
    try {
      const unread = notifications.filter(n => !n.isRead);
      for (const item of unread) {
        await updateDoc(doc(db, 'admin_notifications', item.id), {
          isRead: true,
        });
      }
    } catch (error) {
      console.error("Error marking all admin notifications as read:", error);
    }
  };

  const handleNotificationClick = (notif: any) => {
    if (!notif.isRead) {
      markAsRead(notif.id);
    }
    if (notif.link) {
      router.push(notif.link);
    } else {
      router.push('/admin');
    }
  };

  const getNotifIcon = (type?: string) => {
    switch (type) {
      case 'review':
        return (
          <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 shadow-sm border border-amber-500/20">
            <Star className="h-4 w-4 fill-amber-500/20" />
          </div>
        );
      case 'order':
        return (
          <div className="h-9 w-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0 shadow-sm border border-blue-500/20">
            <ShoppingBag className="h-4 w-4" />
          </div>
        );
      case 'reservation':
        return (
          <div className="h-9 w-9 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0 shadow-sm border border-purple-500/20">
            <Calendar className="h-4 w-4" />
          </div>
        );
      case 'user':
        return (
          <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 shadow-sm border border-emerald-500/20">
            <UserCheck className="h-4 w-4" />
          </div>
        );
      default:
        return (
          <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-sm border border-primary/20">
            <Sparkles className="h-4 w-4" />
          </div>
        );
    }
  };

  const formatTimestamp = (createdAt: any) => {
    if (!createdAt) return 'Just now';
    const millis = createdAt.toMillis ? createdAt.toMillis() : (createdAt.seconds ? createdAt.seconds * 1000 : 0);
    if (!millis) return 'Just now';

    const diff = Date.now() - millis;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    return new Date(millis).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger 
        className="relative h-10 w-10 inline-flex shrink-0 items-center justify-center rounded-full bg-muted/50 font-medium transition-all hover:bg-primary/10 hover:text-primary border border-border/50 shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer [&_svg]:pointer-events-none [&_svg]:shrink-0"
        aria-label="Admin Notifications"
      >
        <Bell className="h-5 w-5 text-foreground/80" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4.5 min-w-4.5 px-1 flex items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold shadow-md ring-2 ring-background">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        align="end" 
        className="w-[360px] sm:w-[420px] p-0 rounded-2xl overflow-hidden border-border/50 shadow-2xl bg-card z-50"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-muted/40 border-b border-border/40">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-foreground text-sm">Admin Alerts</h3>
            {unreadCount > 0 && (
              <span className="bg-primary/15 text-primary text-xs px-2.5 py-0.5 rounded-full font-semibold">
                {unreadCount} new
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs text-primary hover:underline font-medium flex items-center gap-1 cursor-pointer"
            >
              <Check className="h-3 w-3" /> Mark all read
            </button>
          )}
        </div>
        
        {/* Notifications List */}
        <div className="max-h-[420px] overflow-y-auto divide-y divide-border/20">
          {notifications.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground">
              <Bell className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm font-semibold">No admin alerts yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                You'll be alerted when customers place orders, reserve tables, or write reviews.
              </p>
            </div>
          ) : (
            notifications.map((notif) => (
              <DropdownMenuItem 
                key={notif.id} 
                className={cn(
                  "flex items-start gap-3 p-3.5 cursor-pointer rounded-none transition-all",
                  !notif.isRead 
                    ? "bg-primary/[0.06] hover:bg-primary/[0.12] border-l-2 border-l-primary" 
                    : "hover:bg-muted/50 opacity-80 hover:opacity-100"
                )}
                onClick={() => handleNotificationClick(notif)}
              >
                {getNotifIcon(notif.type)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className={cn("text-xs font-bold leading-tight truncate", !notif.isRead ? "text-foreground font-semibold" : "text-muted-foreground")}>
                      {notif.title}
                    </h4>
                    {!notif.isRead && (
                      <span className="relative flex h-2.5 w-2.5 shrink-0 mt-0.5" title="Unread">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary shadow-sm"></span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                    {notif.message}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-muted-foreground">
                      {formatTimestamp(notif.createdAt)}
                    </span>
                    <span className="text-[10px] text-primary flex items-center font-semibold gap-0.5">
                      Open Action <ArrowRight className="h-2.5 w-2.5" />
                    </span>
                  </div>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>

        {/* Footer Quick Links */}
        <div className="p-2.5 bg-muted/20 border-t border-border/40 flex items-center justify-around text-xs text-muted-foreground">
          <button 
            onClick={() => router.push('/admin/orders')}
            className="hover:text-primary transition-colors py-1 px-2 rounded-lg hover:bg-muted font-medium"
          >
            Orders
          </button>
          <span className="opacity-30">•</span>
          <button 
            onClick={() => router.push('/admin/reservations')}
            className="hover:text-primary transition-colors py-1 px-2 rounded-lg hover:bg-muted font-medium"
          >
            Reservations
          </button>
          <span className="opacity-30">•</span>
          <button 
            onClick={() => router.push('/admin/reviews')}
            className="hover:text-primary transition-colors py-1 px-2 rounded-lg hover:bg-muted font-medium"
          >
            Reviews
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
