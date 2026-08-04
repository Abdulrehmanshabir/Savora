'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ShoppingCart, Menu, User, ShieldCheck, LogOut, LayoutDashboard, ChevronRight, ArrowLeft, Sparkles } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { SearchDialog } from '@/components/layout/SearchDialog';
import { CartSheet } from '@/components/cart/CartSheet';
import { NotificationDropdown } from '@/components/layout/NotificationDropdown';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  if (pathname.startsWith('/admin')) {
    return null;
  }

  if (pathname === '/login' || pathname === '/signup') {
    const isLogin = pathname === '/login';
    return (
      <header className="fixed top-0 w-full z-50 bg-background/85 backdrop-blur-xl border-b border-border/40 h-20 flex items-center transition-all duration-300">
        <div className="container mx-auto px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xs">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="text-2xl font-black text-primary tracking-tight">
              Savora
            </span>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <span className="text-xs text-muted-foreground hidden sm:inline">
              {isLogin ? "Don't have an account?" : "Already registered?"}
            </span>
            <Link
              href={isLogin ? "/signup" : "/login"}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-primary hover:text-primary/90 bg-primary/10 hover:bg-primary/15 border border-primary/25 px-4 py-2 rounded-full transition-all shadow-xs"
            >
              <span>{isLogin ? "Create Account" : "Sign In"}</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>
    );
  }

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  const links = [
    { name: 'Home', href: '/' },
    { name: 'Menu', href: '/menu' },
    { name: 'Offers', href: '/offers' },
    { name: 'Reservations', href: '/reservation' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-3xl font-extrabold text-primary tracking-tight">Savora</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
            {links.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-base font-semibold text-foreground/80 hover:text-primary transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </nav>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          <SearchDialog />
          <CartSheet />
          {user && <NotificationDropdown />}

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="relative h-10 w-10 flex items-center justify-center rounded-full p-0 overflow-hidden bg-muted border border-border/50 shadow-sm transition-all hover:ring-2 hover:ring-primary/30 hover:border-primary/50 outline-none focus:ring-2 focus:ring-primary cursor-pointer shrink-0">
                <Avatar className="h-full w-full">
                  <AvatarImage 
                    src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80'} 
                    alt={user.name || 'User'} 
                    className="h-full w-full object-cover" 
                  />
                  <AvatarFallback className="text-sm bg-primary/10 text-primary font-bold">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
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
                      src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80'} 
                      alt={user.name || 'User'} 
                      className="h-full w-full object-cover" 
                    />
                    <AvatarFallback className="bg-primary text-white text-sm font-bold">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-bold text-foreground truncate">{user.name || 'Customer'}</p>
                      {user.role === 'admin' && (
                        <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    <span className="inline-block mt-1 text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full w-fit capitalize border border-primary/20">
                      {user.role || 'customer'}
                    </span>
                  </div>
                </div>
                
                <div className="p-1.5 space-y-1">
                  {user.role === 'admin' && (
                    <DropdownMenuItem 
                      onClick={() => router.push('/admin')} 
                      className="flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors group"
                    >
                      <div className="flex items-center gap-2.5">
                        <ShieldCheck className="h-4 w-4 text-primary" />
                        <span className="text-xs font-semibold">Admin Dashboard</span>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem 
                    onClick={() => router.push('/dashboard')} 
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <User className="h-4 w-4 text-primary" />
                      <span className="text-xs font-semibold">My Orders & Profile</span>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                  </DropdownMenuItem>
                </div>
                
                <div className="p-1.5 border-t border-border/40 bg-muted/20">
                  <DropdownMenuItem 
                    onClick={handleLogout} 
                    className="flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer text-destructive focus:text-destructive hover:bg-destructive/10 transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <LogOut className="h-4 w-4" />
                      <span className="text-xs font-semibold">Log out</span>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden sm:flex gap-2">
              <Link href="/login" className={buttonVariants({ variant: "ghost" })}>
                Login
              </Link>
              <Link href="/signup" className={buttonVariants()}>
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
          <div className="md:hidden flex items-center">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "md:hidden h-10 w-10 rounded-full")}>
                <Menu className="h-5 w-5" />
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetTitle className="sr-only">Menu</SheetTitle>
                <nav className="flex flex-col gap-4 mt-8">
                  {links.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                    >
                      {link.name}
                    </Link>
                  ))}
                  
                  {!user && (
                    <div className="flex flex-col gap-2 mt-4 pt-4 border-t">
                      <Link href="/login" onClick={() => setIsOpen(false)} className={cn(buttonVariants({ variant: "outline" }), "w-full justify-start")}>
                        Login
                      </Link>
                      <Link href="/signup" onClick={() => setIsOpen(false)} className={cn(buttonVariants(), "w-full justify-start")}>
                        Sign Up
                      </Link>
                    </div>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
      </div>
    </header>
  );
}
