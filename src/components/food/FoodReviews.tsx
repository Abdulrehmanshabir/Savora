'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/firebase/client';
import { collection, addDoc, query, where, getDocs, orderBy, serverTimestamp, doc, deleteDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, Loader2, MessageSquare, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { sendAdminNotification } from '@/lib/notifications';

interface FoodReviewsProps {
  foodId: string;
  foodName: string;
}

export function FoodReviews({ foodId, foodName }: FoodReviewsProps) {
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
        const q = query(
          collection(db, 'reviews'), 
          where('itemId', '==', foodId),
          where('status', '==', 'published')
        );
        const snap = await getDocs(q);
        const fetched: any[] = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        // Sort manually since we need a composite index to use orderBy with where
        fetched.sort((a, b) => (b.createdAt?.toMillis ? b.createdAt.toMillis() : 0) - (a.createdAt?.toMillis ? a.createdAt.toMillis() : 0));
        setReviews(fetched);

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
  }, [foodId]);

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
        itemId: foodId,
        itemName: foodName,
        userId: user.uid,
        userName: user.name || 'Anonymous',
        userEmail: user.email,
        rating,
        comment,
        status: 'published', // auto-publish for now, admin can hide it later
        createdAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'reviews'), newReview);
      
      await sendAdminNotification({
        title: `New Review for ${foodName} (${rating} ⭐)`,
        message: `${user.name || 'A customer'} reviewed ${foodName}: "${comment.slice(0, 50)}${comment.length > 50 ? '...' : ''}"`,
        type: 'review',
        link: `/admin/reviews#review-${docRef.id}`,
        metadata: { reviewId: docRef.id, foodId, foodName, rating, userName: user.name }
      });

      // Optimistically add to list
      setReviews([{ id: docRef.id, ...newReview, createdAt: { toMillis: () => Date.now() } }, ...reviews]);
      setComment('');
      setRating(5);
      toast.success('Thank you for your review!');
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
            className={`h-5 w-5 ${interactive ? 'cursor-pointer transition-transform hover:scale-110' : ''} ${star <= count ? 'fill-secondary text-secondary' : 'text-muted-foreground/30'}`} 
            onClick={() => interactive && setRating(star)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="mt-2 w-full">
      <div className="flex items-center justify-between mb-8 border-b border-border/50 pb-4">
        <h2 className="text-2xl font-bold tracking-tight">Customer Reviews</h2>
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 fill-primary text-primary" />
          <span className="font-semibold text-lg">{reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : '0.0'}</span>
          <span className="text-muted-foreground">({reviews.length} reviews)</span>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        {/* Leave a review form */}
        <div className="bg-muted/30 p-6 rounded-2xl h-fit border border-border/50">
          <h3 className="font-semibold text-lg mb-4">Write a Review</h3>
          {user ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Rating</p>
                {renderStars(rating, true)}
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Your Comment</p>
                <Textarea 
                  placeholder="What did you like or dislike?" 
                  className="resize-none bg-background"
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={submitting} className="w-full rounded-full">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <MessageSquare className="h-4 w-4 mr-2" />}
                Submit Review
              </Button>
            </form>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground mb-4">You must be logged in to write a review.</p>
              <Button render={<a href="/login" />} nativeButton={false} className="rounded-full px-8">
                Log In
              </Button>
            </div>
          )}
        </div>

        {/* Reviews List */}
        <div>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-border/60 rounded-2xl">
              <Star className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="font-medium text-lg">No reviews yet</p>
              <p className="text-muted-foreground text-sm">Be the first to review this dish!</p>
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
                      "p-6 rounded-2xl border transition-all duration-300",
                      isHighlighted ? "border-primary ring-2 ring-primary/40 bg-primary/5" : "border-border/40 bg-card/40"
                    )}
                  >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {review.userName?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold">{review.userName}</p>
                        <p className="text-xs text-muted-foreground">
                          {review.createdAt ? new Date(review.createdAt.toMillis ? review.createdAt.toMillis() : Date.now()).toLocaleDateString() : 'Just now'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {renderStars(review.rating)}
                      {user?.uid === review.userId && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive" 
                          onClick={() => handleDelete(review.id)}
                          title="Delete your review"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="text-muted-foreground mt-3 pl-13 text-sm leading-relaxed">
                    {review.comment}
                  </p>
                  {review.adminResponse && (
                    <div className="mt-4 ml-13 p-4 bg-muted/50 rounded-xl border border-border/50 relative">
                      <p className="text-xs font-bold text-foreground mb-1 uppercase tracking-wider flex items-center gap-1.5">
                        <MessageSquare className="h-3.5 w-3.5" />
                        Response from Owner
                      </p>
                      <p className="text-sm text-muted-foreground leading-relaxed">
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
  );
}
