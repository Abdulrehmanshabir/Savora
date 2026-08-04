import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gourmet Menu & Online Food Delivery',
  description: 'Explore Savora\'s artisanal menu featuring handcrafted appetizers, gourmet steaks, wood-fired pasta, and decadent desserts. Order online for fast delivery.',
  openGraph: {
    title: 'Gourmet Menu | Savora Luxury Dining',
    description: 'Explore Savora\'s artisanal culinary menu and order gourmet dishes to your doorstep.',
  },
};

export default function MenuLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
