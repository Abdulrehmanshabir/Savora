'use client';

import { useEffect, useState } from 'react';
import { db } from '@/firebase/client';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';
import { Loader2, Calendar, Users, Clock, Search, CheckCircle, XCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { sendNotification } from '@/lib/notifications';

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchReservations = async () => {
    try {
      const snap = await getDocs(collection(db, 'reservations'));
      const fetched: any[] = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      // Sort by date (closest first)
      fetched.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setReservations(fetched);
      setFilteredReservations(fetched);
    } catch (error) {
      console.error("Error fetching reservations:", error);
      toast.error('Failed to load reservations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      setFilteredReservations(reservations.filter(r => 
        r.id.toLowerCase().includes(q) || 
        r.name?.toLowerCase().includes(q) || 
        r.email?.toLowerCase().includes(q)
      ));
    } else {
      setFilteredReservations(reservations);
    }
  }, [searchQuery, reservations]);

  const updateReservationStatus = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'reservations', id), { status: newStatus });
      toast.success(`Reservation ${newStatus}`);
      const targetRes = reservations.find(r => r.id === id);
      const updated = reservations.map(r => r.id === id ? { ...r, status: newStatus } : r);
      setReservations(updated);

      if (targetRes?.userId) {
        let resTitle = `Reservation Status: ${newStatus.toUpperCase()}`;
        let resMsg = `Your reservation for ${targetRes.date} at ${targetRes.time} is now ${newStatus}.`;

        if (newStatus === 'confirmed') {
          resTitle = 'Reservation Confirmed! ✅';
          resMsg = `Your table reservation for ${targetRes.date} at ${targetRes.time} (${targetRes.guests} guests) has been confirmed! We look forward to hosting you.`;
        } else if (newStatus === 'cancelled') {
          resTitle = 'Reservation Cancelled ❌';
          resMsg = `Your table reservation for ${targetRes.date} at ${targetRes.time} has been cancelled.`;
        } else if (newStatus === 'completed') {
          resTitle = 'Dining Completed 🍽️';
          resMsg = `Thank you for dining with us! We would love to hear your feedback on your experience.`;
        }

        await sendNotification({
          userId: targetRes.userId,
          title: resTitle,
          message: resMsg,
          type: 'reservation',
          link: newStatus === 'completed' ? '/reviews' : '/dashboard?tab=reservations',
          metadata: { reservationId: id, status: newStatus }
        });
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'confirmed': return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 shadow-none border-green-200 uppercase tracking-wider text-[10px]">Confirmed</Badge>;
      case 'cancelled': return <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/20 shadow-none border-destructive/20 uppercase tracking-wider text-[10px]">Cancelled</Badge>;
      case 'completed': return <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 shadow-none border-blue-200 uppercase tracking-wider text-[10px]">Completed</Badge>;
      default: return <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 shadow-none border-amber-200 uppercase tracking-wider text-[10px]">Pending</Badge>;
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Table Reservations</h1>
          <p className="text-muted-foreground">Manage and organize customer dining requests.</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search name or ID..." 
            className="pl-9 bg-card rounded-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredReservations.length === 0 ? (
          <div className="col-span-full text-center py-24 bg-card rounded-[2rem] border border-border/50">
            <Calendar className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No reservations found</h3>
          </div>
        ) : (
          filteredReservations.map((res) => {
            const dateObj = new Date(res.date);
            const month = dateObj.toLocaleDateString('en-US', { month: 'short' });
            const day = dateObj.toLocaleDateString('en-US', { day: '2-digit' });
            const year = dateObj.getFullYear();
            
            return (
              <div key={res.id} className="bg-card rounded-[2rem] border border-border/50 shadow-sm overflow-hidden flex flex-col sm:flex-row hover:shadow-md transition-all duration-300">
                {/* Date Strip */}
                <div className="w-full sm:w-28 bg-primary/5 border-b sm:border-b-0 sm:border-r border-border/50 flex flex-row sm:flex-col items-center justify-center py-4 sm:py-6 shrink-0 gap-2 sm:gap-0">
                  <span className="text-sm font-bold text-primary uppercase tracking-widest">{month} {year}</span>
                  <span className="text-3xl sm:text-4xl font-black text-foreground mt-0 sm:mt-1">{day}</span>
                </div>
                
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-lg leading-tight">{res.name || 'Guest'}</h3>
                        <p className="text-sm text-muted-foreground">{res.email || 'No email provided'}</p>
                        <p className="text-xs text-muted-foreground mt-1 font-mono">ID: {res.id.slice(0, 8)}</p>
                      </div>
                      {getStatusBadge(res.status)}
                    </div>
                    
                    <div className="flex flex-wrap gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm font-medium bg-muted/50 px-3 py-1.5 rounded-lg border border-border/50">
                        <Clock className="h-4 w-4 text-primary" />
                        {res.time}
                      </div>
                      <div className="flex items-center gap-2 text-sm font-medium bg-muted/50 px-3 py-1.5 rounded-lg border border-border/50">
                        <Users className="h-4 w-4 text-primary" />
                        {res.guests} Guests
                      </div>
                    </div>

                    {res.specialRequests && (
                      <div className="p-3 bg-amber-500/5 rounded-xl border border-amber-500/10 mb-4">
                        <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">Special Request</p>
                        <p className="text-sm text-foreground italic">"{res.specialRequests}"</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-2 pt-4 border-t border-border/50">
                    {res.status === 'pending' && (
                      <>
                        <Button 
                          onClick={() => updateReservationStatus(res.id, 'confirmed')} 
                          className="flex-1 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-none"
                        >
                          <CheckCircle className="mr-2 h-4 w-4" /> Approve
                        </Button>
                        <Button 
                          onClick={() => updateReservationStatus(res.id, 'cancelled')} 
                          variant="outline" 
                          className="flex-1 rounded-full text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                        >
                          <XCircle className="mr-2 h-4 w-4" /> Reject
                        </Button>
                      </>
                    )}
                    
                    {res.status === 'confirmed' && (
                      <>
                        <Button 
                          onClick={() => updateReservationStatus(res.id, 'completed')} 
                          className="flex-1 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-none"
                        >
                          Mark Completed
                        </Button>
                        <Button 
                          onClick={() => updateReservationStatus(res.id, 'cancelled')} 
                          variant="outline" 
                          className="flex-1 rounded-full text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                        >
                          Cancel
                        </Button>
                      </>
                    )}

                    {(res.status === 'cancelled' || res.status === 'completed') && (
                      <Button 
                          onClick={() => updateReservationStatus(res.id, 'pending')} 
                          variant="outline" 
                          className="w-full rounded-full"
                        >
                          Reopen Reservation
                        </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
