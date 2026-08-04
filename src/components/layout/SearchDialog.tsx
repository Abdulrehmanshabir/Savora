'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2, ArrowRight, UtensilsCrossed, CupSoda, CakeSlice } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      setLoading(true);
      setTimeout(() => {
        setOpen(false);
        setLoading(false);
        router.push(`/menu?search=${encodeURIComponent(searchQuery)}`);
        setQuery('');
      }, 300); // Small delay for UX feel
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  const quickLinks = [
    { name: 'Drinks', icon: CupSoda, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { name: 'Desserts', icon: CakeSlice, color: 'text-pink-500', bg: 'bg-pink-500/10' },
    { name: 'Main Course', icon: UtensilsCrossed, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="hidden sm:inline-flex shrink-0 items-center justify-center rounded-full bg-muted/50 font-medium transition-all hover:bg-primary/10 hover:text-primary h-10 w-10 shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 border border-border/50" aria-label="Search">
        <Search className="h-5 w-5" />
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden rounded-[2rem] border-border/40 shadow-2xl bg-card/95 backdrop-blur-xl">
        <DialogHeader className="p-0 border-b border-border/50 bg-muted/30">
          <DialogTitle className="sr-only">Search the Menu</DialogTitle>
          <form onSubmit={onSubmit} className="flex items-center pl-6 pr-14 py-4 relative">
            <Search className={cn("h-6 w-6 mr-3 shrink-0 transition-colors", query ? "text-primary" : "text-muted-foreground")} />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What are you craving today?"
              className="border-0 focus-visible:ring-0 shadow-none text-xl px-0 bg-transparent placeholder:text-muted-foreground/60 font-medium h-12 [&::-webkit-search-cancel-button]:hidden"
              autoFocus
              type="search"
            />
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin text-primary ml-3 shrink-0" />
            ) : query && (
              <button 
                type="submit"
                className="ml-3 shrink-0 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground p-2 rounded-full transition-all"
                aria-label="Submit search"
              >
                <ArrowRight className="h-5 w-5" />
              </button>
            )}
          </form>
        </DialogHeader>
        
        <div className="p-6">
          {!query ? (
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Quick Searches</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {quickLinks.map((link) => (
                    <button
                      key={link.name}
                      onClick={() => handleSearch(link.name)}
                      className="flex items-center gap-3 p-3 rounded-2xl border border-border/50 hover:border-primary/30 hover:shadow-md hover:bg-primary/5 transition-all text-left group"
                    >
                      <div className={cn("h-10 w-10 rounded-full flex items-center justify-center shrink-0", link.bg)}>
                        <link.icon className={cn("h-5 w-5", link.color)} />
                      </div>
                      <span className="font-semibold text-sm group-hover:text-primary transition-colors">{link.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="bg-muted/30 rounded-2xl p-4 flex items-center justify-between border border-border/40">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-background border flex items-center justify-center shadow-sm">
                    <span className="text-xs font-bold font-mono">⌘</span>
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">+</span>
                  <div className="h-8 w-8 rounded-full bg-background border flex items-center justify-center shadow-sm">
                    <span className="text-xs font-bold font-mono">K</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground font-medium">Press anywhere to open search</p>
              </div>
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Search className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="text-lg font-semibold">Press Enter to search</p>
                <p className="text-sm text-muted-foreground mt-1">Search the entire menu for "{query}"</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
