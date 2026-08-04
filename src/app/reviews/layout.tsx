import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Guest Reviews & Dining Experiences',
  description: 'See what our valued guests and food connoisseurs say about Savora\'s ambiance, service, and signature culinary creations.',
  openGraph: {
    title: 'Customer Reviews & Ratings | Savora',
    description: 'Real stories and ratings from guests who experienced dining with Savora Restaurant.',
  },
};

export default function ReviewsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
