'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/firebase/client';
import { collection, addDoc, query, where, getDocs, serverTimestamp, doc, deleteDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Star, Loader2, MessageSquare, Quote, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { sendAdminNotification } from '@/lib/notifications';

export default function RestaurantReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [highlightedReviewId, setHighlightedReviewId] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        // Fetch reviews where itemId is either null or 'restaurant'
        const q = query(
          collection(db, 'reviews'), 
          where('itemId', '==', 'restaurant'),
          where('status', '==', 'published')
        );
        const snap = await getDocs(q);
        const fetched: any[] = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        fetched.sort((a, b) => (b.createdAt?.toMillis ? b.createdAt.toMillis() : 0) - (a.createdAt?.toMillis ? a.createdAt.toMillis() : 0));
        setReviews(fetched);

        // Check if hash exists in url
        if (typeof window !== 'undefined' && window.location.hash) {
          const id = window.location.hash.replace('#review-', '');
          setHighlightedReviewId(id);
          setTimeout(() => {
            const el = document.getElementById(`review-${id}`);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 300);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be logged in to leave a review.');
      return;
    }
    if (!comment.trim()) {
      toast.error('Please write a comment.');
      return;
    }

    setSubmitting(true);
    try {
      const newReview = {
        itemId: 'restaurant',
        itemName: 'General Feedback',
        userId: user.uid,
        userName: user.name || 'Anonymous',
        userEmail: user.email,
        rating,
        comment,
        status: 'published',
        createdAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'reviews'), newReview);
      
      await sendAdminNotification({
        title: `New Restaurant Review (${rating} ⭐)`,
        message: `${user.name || 'A customer'} left a review: "${comment.slice(0, 50)}${comment.length > 50 ? '...' : ''}"`,
        type: 'review',
        link: `/admin/reviews#review-${docRef.id}`,
        metadata: { reviewId: docRef.id, rating, userName: user.name }
      });

      setReviews([{ id: docRef.id, ...newReview, createdAt: { toMillis: () => Date.now() } }, ...reviews]);
      setComment('');
      setRating(5);
      toast.success('Thank you for your feedback!');
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete your review?')) return;
    
    try {
      await deleteDoc(doc(db, 'reviews', id));
      toast.success('Review deleted successfully');
      setReviews(reviews.filter(r => r.id !== id));
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error('Failed to delete review');
    }
  };

  const renderStars = (count: number, interactive = false) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star} 
            className={`h-6 w-6 ${interactive ? 'cursor-pointer transition-transform hover:scale-110' : ''} ${star <= count ? 'fill-secondary text-secondary' : 'text-muted-foreground/30'}`} 
            onClick={() => interactive && setRating(star)}
          />
        ))}
      </div>
    );
  };

  const averageRating = reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : '0.0';

  return (
    <div className="min-h-[100dvh] bg-background pb-24">
      {/* Hero Section */}
      <div className="relative bg-zinc-900 py-24 mb-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/40 z-10" />
          <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&q=80" alt="Restaurant Interior" className="w-full h-full object-cover opacity-60" />
        </div>
        <div className="container relative z-20 mx-auto px-4 text-center">
          <Badge className="bg-primary/20 text-primary border-primary/30 mb-6 px-4 py-1.5 backdrop-blur-md">
            Customer Feedback
          </Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-6">
            Hear from our <span className="text-primary italic">Guests</span>
          </h1>
          <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto font-light">
            Real stories and experiences from the people who make our restaurant special. Your feedback helps us grow.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid lg:grid-cols-[1fr_2fr] gap-12 lg:gap-16 items-start">
          {/* Write a Review Section */}
          <div className="flex flex-col gap-8 lg:sticky lg:top-24">
            
            {/* Average Score Card */}
            <div className="bg-gradient-to-br from-card to-muted p-8 rounded-[2rem] border border-border/50 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-700" />
              <div className="flex items-center gap-6 relative z-10">
                <div className="bg-background p-5 rounded-full shadow-inner border border-border/50">
                  <Star className="h-10 w-10 text-primary fill-primary drop-shadow-sm" />
                </div>
                <div>
                  <p className="text-5xl font-black text-foreground mb-1">{averageRating} <span className="text-xl text-muted-foreground font-medium">/ 5</span></p>
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Based on {reviews.length} reviews</p>
                </div>
              </div>
            </div>

            <div className="bg-card p-8 rounded-[2rem] border border-border/50 shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
              <h3 className="font-bold text-2xl mb-6 relative z-10">Leave your feedback</h3>
              {user ? (
                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                  <div className="bg-background p-4 rounded-2xl border border-border/40">
                    <p className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Overall Rating</p>
                    {renderStars(rating, true)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Your Experience</p>
                    <Textarea 
                      placeholder="Tell us about the food, service, and atmosphere..." 
                      className="resize-none bg-background rounded-2xl p-5 border-border/40 focus:ring-primary/20 text-base"
                      rows={5}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                  </div>
                  <Button type="submit" disabled={submitting} className="w-full rounded-full h-14 text-base font-semibold shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform">
                    {submitting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <MessageSquare className="h-5 w-5 mr-2" />}
                    Submit Feedback
                  </Button>
                </form>
              ) : (
                <div className="text-center py-10 bg-background rounded-2xl border border-dashed border-border/60 relative z-10">
                  <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground mb-6 font-medium">Please log in to share your experience.</p>
                  <Button render={<a href="/login" />} nativeButton={false} className="rounded-full px-10 h-12">
                    Log In to Review
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Reviews List */}
          <div>
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-20 bg-card rounded-3xl border border-border/50 shadow-sm">
                <Quote className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">No feedback yet</h3>
                <p className="text-muted-foreground">Be the first to tell us about your experience!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {reviews.map((review) => {
                  const isHighlighted = highlightedReviewId === review.id;
                  return (
                    <div 
                      key={review.id} 
                      id={`review-${review.id}`}
                      className={cn(
                        "bg-card p-8 rounded-[2rem] border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative group overflow-hidden",
                        isHighlighted ? "border-primary ring-2 ring-primary/40 shadow-xl bg-primary/5" : "border-border/40"
                      )}
                    >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-500" />
                    
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6 relative z-10">
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white font-bold text-xl shadow-md">
                          {review.userName?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-lg leading-tight text-foreground">{review.userName}</p>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {review.createdAt ? new Date(review.createdAt.toMillis ? review.createdAt.toMillis() : Date.now()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Just now'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 bg-secondary/10 px-3 py-1.5 rounded-full border border-secondary/20">
                          <Star className="h-4 w-4 fill-secondary text-secondary" />
                          <span className="text-sm font-bold text-secondary">{review.rating}.0</span>
                        </div>
                        {user?.uid === review.userId && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0" 
                            onClick={() => handleDelete(review.id)}
                            title="Delete your review"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="relative z-10 bg-muted/30 p-5 rounded-2xl border border-border/40">
                      <Quote className="h-8 w-8 text-primary/20 absolute -top-3 -left-2 rotate-180" />
                      <p className="text-foreground/80 leading-relaxed text-base relative z-10 pl-4">
                        {review.comment}
                      </p>
                    </div>
                    {review.adminResponse && (
                      <div className="mt-4 bg-primary/5 p-5 rounded-2xl border border-primary/10 relative z-10 ml-4 md:ml-12">
                        <p className="text-xs font-bold text-primary mb-2 uppercase tracking-wider flex items-center gap-1.5">
                          <MessageSquare className="h-4 w-4" />
                          Response from Owner
                        </p>
                        <p className="text-sm text-foreground/80 leading-relaxed">
                          {review.adminResponse}
                        </p>
                      </div>
                    )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
