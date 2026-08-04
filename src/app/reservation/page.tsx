'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Calendar, Clock, Users, CalendarCheck, Loader2, Sparkles, Utensils, ShieldCheck, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { db } from '@/firebase/client';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { toast } from 'sonner';
import { getAvailabilityForDate } from '@/app/actions/reservations';
import { cn } from '@/lib/utils';
import { sendNotification, sendAdminNotification } from '@/lib/notifications';

const MAX_CAPACITY_PER_SLOT = 20;

const ALL_SLOTS = [
  '05:00', '05:30', '06:00', '06:30', '07:00', '07:30', 
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', 
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', 
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', 
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', 
  '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', 
  '23:00', '23:30', '00:00'
];

function formatTime(time24: string) {
  if (time24 === '00:00') return '12:00 AM';
  const [h, m] = time24.split(':');
  let hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12; 
  return `${hour}:${m} ${ampm}`;
}

const reservationSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  guests: z.string().min(1, 'Number of guests is required'),
  specialRequests: z.string().optional(),
});

type ReservationFormValues = z.infer<typeof reservationSchema>;

export default function ReservationPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [slotCapacities, setSlotCapacities] = useState<Record<string, number>>({});
  const [isFetchingSlots, setIsFetchingSlots] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ReservationFormValues>({
    resolver: zodResolver(reservationSchema),
  });

  const selectedDate = watch('date');
  const selectedGuests = watch('guests');
  const selectedTime = watch('time');

  // Fetch reservations when date changes to calculate capacities
  useEffect(() => {
    async function checkAvailability() {
      if (!selectedDate) return;
      setIsFetchingSlots(true);
      try {
        const fetchedCapacities = await getAvailabilityForDate(selectedDate);
        const capacities: Record<string, number> = {};
        ALL_SLOTS.forEach(slot => {
          capacities[slot] = fetchedCapacities[slot] || 0;
        });
        
        setSlotCapacities(capacities);
      } catch (error) {
        console.error("Error fetching availability:", error);
      } finally {
        setIsFetchingSlots(false);
      }
    }

    checkAvailability();
  }, [selectedDate]);

  const onSubmit = async (data: ReservationFormValues) => {
    if (!user) {
      toast.error('You must be logged in to reserve a table');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const requestedGuests = parseInt(data.guests, 10);
      
      // 1. Check double booking
      const userDateQuery = query(
        collection(db, 'reservations'), 
        where('userId', '==', user.uid),
        where('date', '==', data.date)
      );
      const userDateSnap = await getDocs(userDateQuery);
      
      if (!userDateSnap.empty) {
        toast.error('You already have a reservation on this date.');
        setIsSubmitting(false);
        return;
      }

      // 2. Validate strict capacity one last time before saving
      const bookedGuests = slotCapacities[data.time] || 0;
      if (bookedGuests + requestedGuests > MAX_CAPACITY_PER_SLOT) {
        toast.error(`Sorry, we cannot accommodate ${requestedGuests} guests at ${formatTime(data.time)}.`);
        setIsSubmitting(false);
        return;
      }

      // 3. Save as pending
      const reservationData = {
        userId: user.uid,
        userName: user.name || 'Guest',
        userEmail: user.email,
        date: data.date,
        time: data.time,
        guests: requestedGuests,
        specialRequests: data.specialRequests || '',
        status: 'pending',
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'reservations'), reservationData);
      
      await sendNotification({
        userId: user.uid,
        title: 'Reservation Request Received 📅',
        message: `Your booking request for ${data.date} at ${formatTime(data.time)} (${requestedGuests} guests) is pending confirmation.`,
        type: 'reservation',
        link: '/dashboard?tab=reservations',
        metadata: { reservationId: docRef.id, date: data.date, time: data.time }
      });

      await sendAdminNotification({
        title: 'New Table Reservation Request 📅',
        message: `${user.name || 'A customer'} requested a table for ${requestedGuests} guests on ${data.date} at ${formatTime(data.time)}`,
        type: 'reservation',
        link: '/admin/reservations',
        metadata: { reservationId: docRef.id, date: data.date, time: data.time, guests: requestedGuests, userName: user.name }
      });

      setSuccess(true);
      toast.success('Reservation request submitted successfully!');
    } catch (error) {
      console.error('Reservation error:', error);
      toast.error('Failed to submit reservation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center bg-gradient-to-b from-[#0F0D0C] via-[#161311] to-[#0F0D0C] px-4 py-16">
        <div className="max-w-md w-full bg-gradient-to-b from-[#1C1815] via-[#181412] to-[#13100E] p-8 md:p-10 rounded-[2.5rem] shadow-2xl text-center border border-primary/25 ring-1 ring-white/5">
          <div className="w-20 h-20 bg-amber-500/15 text-amber-500 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-500/10">
            <Clock className="h-10 w-10" />
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-3 tracking-tight">Request Sent!</h2>
          <p className="text-stone-300 mb-8 text-base leading-relaxed">
            Your reservation request is currently <strong className="text-amber-400">Pending</strong>. Our restaurant staff will review and confirm it shortly.
          </p>
          <div className="flex flex-col gap-3">
            <Button 
              onClick={() => router.push('/dashboard?tab=reservations')} 
              className="rounded-2xl h-12 text-base font-semibold bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-600 text-white shadow-lg shadow-primary/25"
            >
              View My Bookings
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.push('/menu')} 
              className="rounded-2xl h-12 text-base font-semibold border-white/20 bg-white/5 text-stone-200 hover:bg-white/10 hover:text-white"
            >
              Explore the Menu
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Banner */}
      <section className="relative h-[38vh] min-h-[280px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1920&q=80"
            alt="Restaurant Interior"
            fill
            className="object-cover brightness-40"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[#0F0D0C]" />
        </div>
        <div className="container relative z-10 mx-auto px-4 text-center text-white">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary-foreground text-xs font-semibold uppercase tracking-wider mb-3 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> Table Booking
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-3 tracking-tight">Reserve a Table</h1>
          <p className="text-base md:text-lg text-gray-300 max-w-xl mx-auto font-light">
            Indulge in a world-class dining experience at Savora.
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-[#0F0D0C] via-[#161311] to-[#0F0D0C] relative overflow-hidden flex-grow">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container relative z-10 mx-auto px-4 max-w-4xl">
          <div className="relative bg-gradient-to-b from-[#1C1815]/95 via-[#181412]/95 to-[#13100E]/95 border border-primary/25 backdrop-blur-2xl rounded-[2.5rem] p-6 sm:p-10 md:p-14 shadow-2xl shadow-black/80 ring-1 ring-white/5">
            
            {!user ? (
              <div className="text-center py-12 text-white">
                <div className="w-16 h-16 rounded-2xl bg-primary/15 text-primary border border-primary/30 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-primary/10">
                  <Sparkles className="h-8 w-8" />
                </div>
                <h3 className="text-2xl md:text-3xl font-extrabold mb-3">Login Required</h3>
                <p className="text-stone-300 mb-8 max-w-md mx-auto text-base">
                  Please log in or create an account to reserve a table and manage your bookings.
                </p>
                <Button 
                  onClick={() => router.push('/login')} 
                  size="lg" 
                  className="rounded-2xl px-10 h-13 text-base font-bold bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-600 text-white shadow-lg shadow-primary/25"
                >
                  Log In to Continue
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 md:space-y-10">
                <div className="text-center mb-6 md:mb-8">
                  <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">Booking Details</h2>
                  <p className="text-stone-300 mt-2 text-sm md:text-base max-w-md mx-auto">
                    Select your preferred date, time and party size.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                  {/* Date Input */}
                  <div className="space-y-2.5">
                    <label className="text-sm font-semibold text-stone-200 flex items-center gap-2">
                      <div className="p-1 rounded-md bg-primary/15 text-primary">
                        <Calendar className="h-4 w-4" />
                      </div> 
                      Reservation Date
                    </label>
                    <input 
                      type="date"
                      {...register('date')}
                      className="w-full px-5 py-4 rounded-2xl border border-white/10 bg-[#26201B]/90 text-white placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-base md:text-lg [color-scheme:dark] shadow-inner"
                      min={new Date().toISOString().split('T')[0]}
                    />
                    {errors.date && <p className="text-destructive text-sm mt-1">{errors.date.message}</p>}
                  </div>

                  {/* Number of Guests */}
                  <div className="space-y-2.5">
                    <label className="text-sm font-semibold text-stone-200 flex items-center gap-2">
                      <div className="p-1 rounded-md bg-primary/15 text-primary">
                        <Users className="h-4 w-4" />
                      </div> 
                      Number of Guests
                    </label>
                    <input 
                      type="number"
                      min="1"
                      placeholder="e.g., 4"
                      {...register('guests')}
                      className="w-full px-5 py-4 rounded-2xl border border-white/10 bg-[#26201B]/90 text-white placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-base md:text-lg shadow-inner"
                    />
                    {errors.guests && <p className="text-destructive text-sm mt-1">{errors.guests.message}</p>}
                  </div>
                </div>

                {/* Time Selection */}
                <div className="space-y-2.5">
                  <label className="text-sm font-semibold text-stone-200 flex items-center gap-2">
                    <div className="p-1 rounded-md bg-primary/15 text-primary">
                      <Clock className="h-4 w-4" />
                    </div> 
                    Select Time Slot
                  </label>
                  
                  <div className="relative">
                    <select 
                      {...register('time')}
                      disabled={!selectedDate || isFetchingSlots}
                      className="w-full px-5 py-4 rounded-2xl border border-white/10 bg-[#26201B]/90 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-base md:text-lg appearance-none cursor-pointer disabled:opacity-40 shadow-inner [&>option]:bg-[#1C1815] [&>option]:text-white"
                    >
                      <option value="" className="text-stone-400">
                        {selectedDate ? 'Choose a time slot...' : 'Please select a date first'}
                      </option>
                      {ALL_SLOTS.map(slot => {
                        const booked = slotCapacities[slot] || 0;
                        const available = MAX_CAPACITY_PER_SLOT - booked;
                        const requested = parseInt(selectedGuests || '0', 10);
                        const isDisabled = available < requested || available <= 0;
                        
                        return (
                          <option key={slot} value={slot} disabled={isDisabled}>
                            {formatTime(slot)} {isDisabled ? '(Fully Booked)' : `(${available} spots left)`}
                          </option>
                        );
                      })}
                    </select>
                    {isFetchingSlots && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      </div>
                    )}
                  </div>
                
                  {errors.time && <p className="text-destructive text-sm mt-1">{errors.time.message}</p>}
                </div>

                {/* Special Requests */}
                <div className="space-y-2.5">
                  <label className="text-sm font-semibold text-stone-200 flex items-center gap-2">
                    <div className="p-1 rounded-md bg-primary/15 text-primary">
                      <Utensils className="h-4 w-4" />
                    </div> 
                    Special Requests (Optional)
                  </label>
                  <textarea 
                    {...register('specialRequests')}
                    rows={4}
                    className="w-full px-5 py-4 rounded-2xl border border-white/10 bg-[#26201B]/90 text-white placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none text-base shadow-inner"
                    placeholder="E.g., Window seating, celebrating an anniversary, need high chair..."
                  ></textarea>
                </div>

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full h-16 text-lg md:text-xl font-bold rounded-2xl shadow-xl bg-gradient-to-r from-primary via-orange-500 to-amber-500 hover:from-primary/90 hover:to-amber-600 text-white shadow-primary/25 transition-all hover:shadow-primary/35 active:scale-[0.99] cursor-pointer mt-4"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-6 w-6 animate-spin" /> Submitting Your Request...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5" /> Request Table Reservation
                    </span>
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
