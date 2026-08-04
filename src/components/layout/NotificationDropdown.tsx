'use client';

import { useState, useEffect } from 'react';
import { db } from '@/firebase/client';
import { collection, query, onSnapshot, doc, updateDoc, writeBatch } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, CheckCircle2, MessageSquare, ShoppingBag, Calendar, Sparkles, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export function NotificationDropdown() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'notifications', user.uid, 'items'));
    const unsubscribe = onSnapshot(
      q, 
      (snapshot) => {
        const fetched: any[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        fetched.sort((a, b) => (b.createdAt?.toMillis ? b.createdAt.toMillis() : 0) - (a.createdAt?.toMillis ? a.createdAt.toMillis() : 0));
        setNotifications(fetched);
      },
      (error) => {
        console.warn("Notifications Firestore permission/listener warning:", error.message);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = async (id: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'notifications', user.uid, 'items', id), {
        isRead: true
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    if (!user || unreadCount === 0) return;
    try {
      const unread = notifications.filter(n => !n.isRead);
      for (const item of unread) {
        await updateDoc(doc(db, 'notifications', user.uid, 'items', item.id), {
          isRead: true
        });
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const handleNotificationClick = (notif: any) => {
    if (!notif.isRead) {
      markAsRead(notif.id);
    }
    if (notif.link) {
      router.push(notif.link);
    } else {
      router.push('/dashboard');
    }
  };

  const getNotifIcon = (type?: string) => {
    switch(type) {
      case 'review':
        return <div className="h-8 w-8 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0"><MessageSquare className="h-4 w-4" /></div>;
      case 'order':
        return <div className="h-8 w-8 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0"><ShoppingBag className="h-4 w-4" /></div>;
      case 'reservation':
        return <div className="h-8 w-8 rounded-full bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0"><Calendar className="h-4 w-4" /></div>;
      default:
        return <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0"><Sparkles className="h-4 w-4" /></div>;
    }
  };

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger 
        className="relative h-10 w-10 inline-flex shrink-0 items-center justify-center rounded-full bg-muted/50 font-medium transition-all hover:bg-primary/10 hover:text-primary border border-border/50 shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer [&_svg]:pointer-events-none [&_svg]:shrink-0"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4.5 min-w-4.5 px-1 flex items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold shadow-md ring-2 ring-background">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[360px] sm:w-[400px] p-0 rounded-2xl overflow-hidden border-border/50 shadow-2xl bg-card">
        <div className="flex items-center justify-between p-4 bg-muted/40 border-b border-border/40">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-foreground">Notifications</h3>
            {unreadCount > 0 && (
              <span className="bg-primary/15 text-primary text-xs px-2 py-0.5 rounded-full font-semibold">
                {unreadCount} new
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs text-primary hover:underline font-medium flex items-center gap-1"
            >
              <Check className="h-3 w-3" /> Mark all read
            </button>
          )}
        </div>
        
        <div className="max-h-[420px] overflow-y-auto divide-y divide-border/30">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm font-medium">No notifications yet</p>
              <p className="text-xs text-muted-foreground mt-1">We'll alert you about orders, reservations, and replies.</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <DropdownMenuItem 
                key={notif.id} 
                className={cn(
                  "flex items-start gap-3 p-3.5 cursor-pointer rounded-none transition-all border-b border-border/20 last:border-b-0",
                  !notif.isRead 
                    ? "bg-primary/[0.06] hover:bg-primary/[0.12] border-l-2 border-l-primary" 
                    : "hover:bg-muted/50 opacity-75 hover:opacity-100"
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
                      {notif.createdAt ? new Date(notif.createdAt.toMillis ? notif.createdAt.toMillis() : Date.now()).toLocaleDateString() : 'Just now'}
                    </span>
                    <span className="text-[10px] text-primary flex items-center font-semibold gap-0.5">
                      View details <ArrowRight className="h-2.5 w-2.5" />
                    </span>
                  </div>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>

        <div className="p-3 bg-muted/20 border-t border-border/40 text-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full text-xs text-muted-foreground hover:text-foreground h-8"
            onClick={() => router.push('/dashboard?tab=notifications')}
          >
            View All in Dashboard
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
