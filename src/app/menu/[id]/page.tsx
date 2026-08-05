import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft, Star, Clock, ChefHat, Info } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getAdminServices } from '@/firebase/admin';
import { cn } from '@/lib/utils';
import { FoodDetailsInteractive } from '@/components/food/FoodDetailsInteractive';
import { FoodReviews } from '@/components/food/FoodReviews';
import { serializeData } from '@/lib/utils';

export const revalidate = 3600;

async function getFoodDetails(id: string) {
  try {
    const { adminDb } = await getAdminServices();
    const docSnap = await adminDb.collection('foods').doc(id).get();
    if (!docSnap.exists) return null;
    return serializeData({ id: docSnap.id, ...docSnap.data() });
  } catch (error) {
    console.error("Error fetching food details:", error);
    return null;
  }
}

export default async function FoodDetailsPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const resolvedParams = await params;
  const food = await getFoodDetails(resolvedParams.id);

  if (!food) {
    notFound();
  }

  return (
    <div className="min-h-[100dvh] bg-background pt-10 pb-20">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-6">
          <Link href="/menu" className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Menu
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Food Details */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
            <div className="bg-card border border-border/50 rounded-3xl overflow-hidden shadow-lg flex flex-col sm:flex-row">
              {/* Image Gallery */}
              <div className="relative h-[250px] sm:h-auto sm:w-2/5 min-h-[250px] bg-muted">
                <Image
                  src={food.image || (food.images && food.images.length > 0 ? food.images[0] : null) || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&q=80'}
                  alt={food.name}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 30vw"
                />
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {food.discountPrice && (
                    <Badge className="bg-destructive text-destructive-foreground font-semibold px-2 py-1 text-xs shadow-md">
                      Special Offer
                    </Badge>
                  )}
                  {food.isPopular && (
                    <Badge className="bg-secondary text-secondary-foreground font-semibold px-2 py-1 text-xs shadow-md">
                      Popular
                    </Badge>
                  )}
                </div>
              </div>

              {/* Details Content */}
              <div className="p-6 md:p-8 flex flex-col sm:w-3/5">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">{food.name}</h1>

                <div className="flex items-center gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-0.5 rounded-md font-medium cursor-default">
                    <Star className="h-3.5 w-3.5 fill-primary" />
                    <span>{food.rating} ({food.reviewsCount})</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{food.prepTimeMinutes} mins prep</span>
                  </div>
                </div>

                <p className="text-muted-foreground mb-6 leading-relaxed text-sm">
                  {food.description}
                </p>

                {/* Price */}
                <div className="mb-6">
                  {food.discountPrice ? (
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-bold text-primary">${food.discountPrice.toFixed(2)}</span>
                      <span className="text-lg text-muted-foreground line-through mb-0.5">${food.price.toFixed(2)}</span>
                    </div>
                  ) : (
                    <span className="text-3xl font-bold text-primary">${food.price.toFixed(2)}</span>
                  )}
                </div>
                
                <div className="flex-grow"></div>
                
                {/* Interactive component for cart logic */}
                <FoodDetailsInteractive food={food} />
              </div>
            </div>

            <div className="bg-card border border-border/50 rounded-2xl p-6 text-sm text-muted-foreground flex flex-col gap-3">
              <div className="flex items-start gap-2">
                <ChefHat className="h-4 w-4 shrink-0 text-secondary mt-0.5" />
                <p>Prepared by our master chefs with fresh, locally-sourced ingredients.</p>
              </div>
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                <p>Allergy info: If you have any allergies, please specify them in the special instructions during checkout.</p>
              </div>
            </div>
          </div>

          {/* Right Column: Reviews */}
          <div id="reviews" className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2 no-scrollbar scroll-mt-24">
            <FoodReviews foodId={food.id} foodName={food.name} />
          </div>
          
        </div>
      </div>
    </div>
  );
}
