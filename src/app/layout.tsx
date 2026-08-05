import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://savora-restaurant.com'),
  title: {
    default: 'Savora | Luxury Dining & Gourmet Food Delivery',
    template: '%s | Savora Restaurant',
  },
  description: 'Experience fine dining at its best. Savor handcrafted gourmet dishes, reserve luxury tables, and enjoy lightning-fast doorstep delivery with Savora.',
  keywords: [
    'Savora Restaurant',
    'Luxury Dining',
    'Gourmet Food Delivery',
    'Table Reservation',
    'Fine Dining Restaurant',
    'Online Food Ordering',
    'Steaks and Pasta',
    'Chef Specials',
  ],
  authors: [{ name: 'Savora Culinary Group' }],
  creator: 'Savora',
  publisher: 'Savora Hospitality Ltd.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://savora-restaurant.com',
    siteName: 'Savora Restaurant',
    title: 'Savora | Luxury Dining & Gourmet Delivery',
    description: 'Discover exquisite culinary artistry, luxury ambiance, and seamless food ordering with Savora.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1200&q=80',
        width: 1200,
        height: 630,
        alt: 'Savora Luxury Dining Atmosphere',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Savora | Luxury Dining & Gourmet Delivery',
    description: 'Experience fine dining at its best with Savora. Order online or reserve your table.',
    images: ['https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1200&q=80'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const restaurantStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'Restaurant',
  name: 'Savora Restaurant & Gourmet Lounge',
  image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1200&q=80',
  description: 'Experience fine dining at its best. Savor handcrafted gourmet dishes and reserve luxury tables with Savora.',
  servesCuisine: ['Fine Dining', 'Italian', 'Steakhouse', 'Continental', 'Artisan Desserts'],
  priceRange: '$$$',
  telephone: '+1-555-728-6721',
  url: 'https://savora-restaurant.com',
  menu: 'https://savora-restaurant.com/menu',
  acceptsReservations: 'True',
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '11:00',
      closes: '23:30',
    },
  ],
  address: {
    '@type': 'PostalAddress',
    streetAddress: '100 Culinary Avenue, Suite 400',
    addressLocality: 'Downtown Luxury District',
    addressRegion: 'NY',
    postalCode: '10001',
    addressCountry: 'US',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantStructuredData) }}
        />
      </head>
      <body className={`${poppins.variable} font-sans antialiased min-h-[100dvh] flex flex-col`}>
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
            <Toaster position="top-right" richColors offset={{ top: 80, right: 16 }} duration={2000} />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
