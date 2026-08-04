'use client';

import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface MenuFilterProps {
  categories: any[];
  currentCategory: string;
}

export function MenuFilter({ categories, currentCategory }: MenuFilterProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleCategoryChange = (slug: string) => {
    if (slug === 'all') {
      router.push(pathname);
    } else {
      router.push(`${pathname}?category=${slug}`);
    }
  };

  return (
    <div className="w-full relative">
      <ScrollArea className="w-full whitespace-nowrap rounded-lg pb-4">
        <div className="flex w-max space-x-2 p-1">
          <Button
            variant={currentCategory === 'all' ? 'default' : 'outline'}
            className={cn(
              "rounded-full px-6 transition-all",
              currentCategory === 'all' ? "shadow-md" : ""
            )}
            onClick={() => handleCategoryChange('all')}
          >
            All Menu
          </Button>
          
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={currentCategory === cat.slug ? 'default' : 'outline'}
              className={cn(
                "rounded-full px-6 transition-all",
                currentCategory === cat.slug ? "shadow-md" : ""
              )}
              onClick={() => handleCategoryChange(cat.slug)}
            >
              {cat.name}
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="hidden" />
      </ScrollArea>
    </div>
  );
}
