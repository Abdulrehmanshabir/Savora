'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { cn } from '@/lib/utils';
  LayoutDashboard, ShoppingBag, Calendar, UtensilsCrossed, 
  LogOut, Loader2, Star, Settings, Bell, Search, ExternalLink, Menu, ShieldCheck, ChevronRight, Tag
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

import { AdminNotificationDropdown } from '@/components/admin/AdminNotificationDropdown';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'admin') {
        router.push('/dashboard');
      }
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'admin') {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Menu', href: '/admin/menu', icon: UtensilsCrossed },
    { name: 'Food Orders', href: '/admin/orders', icon: ShoppingBag },
    { name: 'Reservations', href: '/admin/reservations', icon: Calendar },
    { name: 'Reviews', href: '/admin/reviews', icon: Star },
    { name: 'Offers', href: '/admin/offers', icon: Tag },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-[100dvh] bg-muted/20 flex flex-col md:flex-row">
      {/* Mobile Header (Sidebar Toggle) */}
      <div className="md:hidden flex items-center justify-between bg-card border-b border-border/50 p-4">
        <div className="flex items-center gap-2">
          <span className="bg-primary text-primary-foreground p-1.5 rounded-lg">
            <LayoutDashboard className="h-5 w-5" />
          </span>
          <h2 className="text-xl font-bold text-primary">Savora</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Admin Sidebar */}
      <aside className={cn(
        "w-full md:w-64 bg-card border-r border-border/50 shrink-0 md:min-h-[100dvh] md:sticky md:top-0 transition-transform duration-300 md:block z-40 flex flex-col",
        isSidebarOpen ? "block fixed inset-0 overflow-y-auto" : "hidden"
      )}>
        <div className="p-6 hidden md:flex items-center gap-2">
          <span className="bg-primary text-primary-foreground p-1.5 rounded-lg">
            <LayoutDashboard className="h-5 w-5" />
          </span>
          <h2 className="text-xl font-bold text-primary tracking-tight">Savora Admin</h2>
        </div>
        
        <div className="px-6 pb-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-4 md:mt-0">
          Main Menu
        </div>
        
        <nav className="px-4 pb-6 space-y-1 flex-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                    : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive ? "text-primary-foreground" : "opacity-70")} />
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-border/10 space-y-3 mt-auto">
          <Link href="/" className="flex items-center justify-center gap-3 px-4 py-3 rounded-2xl font-semibold bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-sm">
            <ExternalLink className="h-5 w-5" />
            Go to Website
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl font-semibold bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition-all shadow-sm">
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden flex flex-col min-w-0">
        {/* Admin Top Header */}
        <header className="h-20 bg-card/80 backdrop-blur-md border-b border-border/50 sticky top-0 z-30 flex items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative hidden md:block max-w-md w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/70 pointer-events-none" />
              <Input 
                placeholder="Search everything..." 
                className="h-10 pl-10 pr-4 bg-muted/40 border border-primary/80 hover:border-primary focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/25 rounded-full text-sm font-medium transition-all shadow-xs" 
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <AdminNotificationDropdown />
            
            <DropdownMenu>
              <DropdownMenuTrigger className="relative h-10 w-10 flex items-center justify-center rounded-full p-0 overflow-hidden bg-muted border border-border/50 shadow-sm transition-all hover:ring-2 hover:ring-primary/30 hover:border-primary/50 outline-none focus:ring-2 focus:ring-primary cursor-pointer shrink-0">
                <Avatar className="h-full w-full">
                  <AvatarImage 
                    src={user.avatarUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&q=80'} 
                    alt={user.name || 'Admin'} 
                    className="h-full w-full object-cover" 
                  />
                  <AvatarFallback className="text-base bg-primary/10 text-primary font-bold">
                    {user.name?.charAt(0).toUpperCase() || 'A'}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                className="w-72 rounded-2xl p-0 overflow-hidden border border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl z-50 animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2" 
                align="end" 
                sideOffset={8}
              >
                <div className="p-4 bg-gradient-to-br from-primary/10 via-background to-background border-b border-border/40 flex items-center gap-3">
                  <Avatar className="h-11 w-11 border border-border/60 shadow-sm shrink-0">
                    <AvatarImage 
                      src={user.avatarUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&q=80'} 
                      alt={user.name || 'Admin'} 
                      className="h-full w-full object-cover" 
                    />
                    <AvatarFallback className="bg-primary text-white text-sm font-bold">
                      {user.name?.charAt(0).toUpperCase() || 'A'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="text-sm font-bold text-foreground truncate">{user.name || 'Admin'}</p>
                      <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" />
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    <span className="inline-block mt-1 text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full w-fit capitalize border border-primary/20">
                      {user.role}
                    </span>
                  </div>
                </div>
                
                <div className="p-1.5">
                  <DropdownMenuItem 
                    onClick={() => router.push('/admin/settings')} 
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Settings className="h-4 w-4 text-primary group-hover:rotate-45 transition-transform duration-300" />
                      <span className="text-xs font-semibold">Settings & Profile</span>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 md:p-8 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
