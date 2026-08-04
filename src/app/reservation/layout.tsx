import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reserve a Luxury Dining Table',
  description: 'Book your exclusive table at Savora. Experience world-class hospitality, romantic ambient lighting, and bespoke chef creations.',
  openGraph: {
    title: 'Table Reservation | Savora Luxury Restaurant',
    description: 'Book a VIP dining experience with private dining booths, outdoor terraces, and gourmet tastings.',
  },
};

export default function ReservationLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
