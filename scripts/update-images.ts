import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID || '',
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL || '',
      privateKey: (process.env.FIREBASE_ADMIN_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();

async function fixImages() {
  try {
    const foodsSnap = await db.collection('foods').get();
    
    for (const doc of foodsSnap.docs) {
      const data = doc.data();
      
      if (data.name === 'Mushroom Risotto') {
        await doc.ref.update({
          images: ['https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80']
        });
        console.log('Fixed Mushroom Risotto');
      }
      
      if (data.name === 'Espresso Martini') {
        await doc.ref.update({
          images: ['https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80']
        });
        console.log('Fixed Espresso Martini');
      }
    }
    
    const offersSnap = await db.collection('offers').get();
    for (const doc of offersSnap.docs) {
      const data = doc.data();
      if (data.title === 'Weekend Special: 20% Off Main Courses') {
        await doc.ref.update({
          imageUrl: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80'
        });
        console.log('Fixed Offer Image');
      }
    }
    
    console.log('Image fix complete!');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

fixImages();
