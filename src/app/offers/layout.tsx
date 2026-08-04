import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Special Deals & Dining Offers',
  description: 'Unlock exclusive promo codes, combo meal discounts, and seasonal gourmet offers at Savora Restaurant.',
  openGraph: {
    title: 'Dining Deals & Promo Offers | Savora',
    description: 'Save on your favorite gourmet meals with active promotional discounts and chef specials.',
  },
};

export default function OffersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
