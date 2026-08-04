import Image from 'next/image';
import Link from 'next/link';
import { getAdminServices } from '@/firebase/admin';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Tag } from 'lucide-react';
import { cn, serializeData } from '@/lib/utils';

export const revalidate = 0;

async function getOffers() {
  try {
    const { adminDb } = await getAdminServices();
    const offersSnap = await adminDb.collection('offers').where('isActive', '==', true).get();
    return offersSnap.docs.map(doc => serializeData({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching offers:", error);
    return [];
  }
}

export default async function OffersPage() {
  const offers = await getOffers();

  return (
    <div className="flex flex-col min-h-screen">
      <section className="relative h-[30vh] min-h-[250px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1920&q=80"
            alt="Special Offers"
            fill
            className="object-cover brightness-50"
            priority
          />
        </div>
        <div className="container relative z-10 mx-auto px-4 text-center text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Special Offers</h1>
          <p className="text-lg text-gray-200 max-w-2xl mx-auto font-light">
            Exclusive deals and seasonal specials crafted just for you.
          </p>
        </div>
      </section>

      <section className="py-16 bg-background flex-grow">
        <div className="container mx-auto px-4">
          {offers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {offers.map((offer: any) => (
                <Card key={offer.id} className="overflow-hidden flex flex-col h-full bg-card hover:shadow-xl transition-all duration-300 border-border/50">
                  <div className="relative h-48 w-full">
                    <Image
                      src={offer.imageUrl || 'https://images.unsplash.com/photo-1544025162-8360d80119e8?w=800&q=80'}
                      alt={offer.title}
                      fill
                      className="object-cover"
                    />
                    <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground font-semibold px-3 py-1 shadow-md">
                      {offer.discountPercentage}% OFF
                    </Badge>
                  </div>
                  <CardHeader className="p-6 pb-2">
                    <h3 className="text-2xl font-bold">{offer.title}</h3>
                  </CardHeader>
                  <CardContent className="p-6 pt-0 flex-grow">
                    <p className="text-muted-foreground mb-4 line-clamp-3">
                      {offer.description}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4">
                      <Clock className="h-4 w-4" />
                      <span>Valid until: {new Date(offer.validUntil).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="p-6 pt-0 flex items-center justify-between border-t border-border/50 mt-auto bg-muted/20">
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Promo Code</span>
                      <span className="text-lg font-bold flex items-center gap-1.5">
                        <Tag className="h-4 w-4 text-primary" /> {offer.code || 'SAVORAOFFER'}
                      </span>
                    </div>
                    <Link href="/menu" className={cn(buttonVariants(), "rounded-full shadow-md")}>
                      Order Now
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <h3 className="text-2xl font-semibold mb-2">No Active Offers</h3>
              <p className="text-muted-foreground">Check back later for new deals and promotions!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
