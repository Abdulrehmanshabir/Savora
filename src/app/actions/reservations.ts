'use server';

import { getAdminServices } from '@/firebase/admin';

export async function getAvailabilityForDate(date: string) {
  try {
    const { adminDb } = await getAdminServices();
    const snap = await adminDb.collection('reservations').where('date', '==', date).get();
    
    const capacities: Record<string, number> = {};
    
    snap.forEach(doc => {
      const data = doc.data();
      if (data.time) {
        if (!capacities[data.time]) {
          capacities[data.time] = 0;
        }
        capacities[data.time] += (data.guests || 0);
      }
    });

    return capacities;
  } catch (error) {
    console.error('Error fetching server availability:', error);
    return {};
  }
}
