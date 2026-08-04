'use client';

import { useEffect, useState } from 'react';
import { db } from '@/firebase/client';
import { collection, getDocs, doc, deleteDoc, updateDoc, orderBy, query, addDoc, serverTimestamp } from 'firebase/firestore';
import { Loader2, Star, Trash2, Search, Eye, EyeOff, MessageCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { sendNotification } from '@/lib/notifications';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [replyReview, setReplyReview] = useState<any>(null);
  const [replyText, setReplyText] = useState('');
  const [savingReply, setSavingReply] = useState(false);

  const fetchReviews = async () => {
    try {
      // Assuming a 'reviews' collection exists
      const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const fetched = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReviews(fetched);
      setFilteredReviews(fetched);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error('Failed to load reviews');
      // If collection doesn't exist yet, we'll just show empty state without crashing entirely
      setReviews([]);
      setFilteredReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      setFilteredReviews(reviews.filter(r => 
        r.userName?.toLowerCase().includes(q) || 
        r.comment?.toLowerCase().includes(q) ||
        r.itemName?.toLowerCase().includes(q)
      ));
    } else {
      setFilteredReviews(reviews);
    }
  }, [searchQuery, reviews]);

  const toggleReviewVisibility = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'hidden' ? 'published' : 'hidden';
    try {
      await updateDoc(doc(db, 'reviews', id), { status: newStatus });
      toast.success(`Review ${newStatus === 'hidden' ? 'hidden' : 'published'} successfully`);
      setReviews(reviews.map(r => r.id === id ? { ...r, status: newStatus } : r));
    } catch (error) {
      console.error("Error updating review:", error);
      toast.error('Failed to update review status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    
    try {
      await deleteDoc(doc(db, 'reviews', id));
      toast.success('Review deleted successfully');
      setReviews(reviews.filter(r => r.id !== id));
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error('Failed to delete review');
    }
  };

  const handleOpenReply = (review: any) => {
    setReplyReview(review);
    if (review.adminResponse) {
      setReplyText(review.adminResponse);
    } else {
      setReplyText('');
    }
  };

  const handleSaveReply = async () => {
    if (!replyReview) return;
    setSavingReply(true);
    try {
      await updateDoc(doc(db, 'reviews', replyReview.id), { adminResponse: replyText });
      
      if (replyReview.userId) {
        const link = (!replyReview.itemId || replyReview.itemId === 'restaurant')
          ? `/reviews#review-${replyReview.id}`
          : `/menu/${replyReview.itemId}#review-${replyReview.id}`;

        await sendNotification({
          userId: replyReview.userId,
          title: 'The owner responded to your review 💬',
          message: replyText || 'The restaurant owner has replied to your review. Click to view.',
          type: 'review',
          link,
          metadata: { reviewId: replyReview.id, itemId: replyReview.itemId }
        });
      }

      toast.success('Response saved successfully');
      setReviews(reviews.map(r => r.id === replyReview.id ? { ...r, adminResponse: replyText } : r));
      setReplyReview(null);
    } catch (error) {
      console.error("Error saving reply:", error);
      toast.error('Failed to save response');
    } finally {
      setSavingReply(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star} 
            className={`h-4 w-4 ${star <= (rating || 0) ? 'fill-secondary text-secondary' : 'text-muted-foreground/30'}`} 
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Customer Reviews</h1>
          <p className="text-muted-foreground">Manage and moderate customer feedback and ratings.</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search reviews..." 
            className="pl-9 bg-card rounded-full shadow-sm border-border/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-card rounded-[2rem] border border-border/50 shadow-sm overflow-hidden">
        {filteredReviews.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center text-muted-foreground">
            <Star className="h-12 w-12 mb-4 opacity-20" />
            <p className="text-lg font-medium">No reviews found</p>
            <p className="text-sm">When customers leave reviews, they will appear here.</p>
          </div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground font-semibold uppercase tracking-wider text-xs border-b border-border/50">
              <tr>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Rating & Review</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filteredReviews.map((review) => {
                const date = review.createdAt ? new Date(review.createdAt.toMillis()).toLocaleDateString() : 'Unknown';
                const isHidden = review.status === 'hidden';
                
                return (
                  <tr key={review.id} className={`hover:bg-muted/20 transition-colors ${isHidden ? 'opacity-60' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {review.userName?.charAt(0).toUpperCase() || 'C'}
                        </div>
                        <div>
                          <p className="font-bold">{review.userName || 'Anonymous'}</p>
                          <p className="text-xs text-muted-foreground">{review.userEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-1">
                          {review.itemId === 'restaurant' ? (
                            <Badge className="bg-primary/20 text-primary border-primary/30 hover:bg-primary/30">Overall Restaurant</Badge>
                          ) : (
                            <Badge variant="outline" className="border-secondary/50 text-secondary bg-secondary/10">Food Item: {review.itemName}</Badge>
                          )}
                        </div>
                        {renderStars(review.rating)}
                        <p className="text-muted-foreground line-clamp-2 mt-1 italic text-sm">"{review.comment}"</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground font-medium">
                      {date}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        isHidden ? 'bg-secondary/10 text-secondary' : 'bg-primary/10 text-primary'
                      }`}>
                        {isHidden ? 'Hidden' : 'Published'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleOpenReply(review)}
                          title="Reply to Review"
                          className="hover:bg-primary/10 hover:text-primary"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => toggleReviewVisibility(review.id, review.status)}
                          title={isHidden ? "Publish Review" : "Hide Review"}
                          className="hover:bg-primary/10 hover:text-primary"
                        >
                          {isHidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive" 
                          onClick={() => handleDelete(review.id)}
                          title="Delete Review"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <Dialog open={!!replyReview} onOpenChange={(open) => !open && setReplyReview(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Respond to Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="text-sm p-4 bg-muted/30 rounded-xl border border-border/50">
              <span className="font-semibold">{replyReview?.userName}</span> rated {replyReview?.rating} stars
              <p className="italic text-muted-foreground mt-2 text-base">"{replyReview?.comment}"</p>
            </div>
            <div>
              <label className="text-sm font-bold block mb-3 text-foreground">Your Response</label>
              <Textarea 
                value={replyText} 
                onChange={(e) => setReplyText(e.target.value)} 
                rows={5} 
                className="resize-none"
                placeholder="Type your response here..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReplyReview(null)}>Cancel</Button>
            <Button onClick={handleSaveReply} disabled={savingReply}>
              {savingReply ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Response
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
