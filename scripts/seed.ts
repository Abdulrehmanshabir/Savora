import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';
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

const categories = [
  { name: 'Appetizers', imageUrl: 'https://images.unsplash.com/photo-1541014741259-de529411b96a?auto=format&fit=crop&w=400&q=80', slug: 'appetizers' },
  { name: 'Main Course', imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=400&q=80', slug: 'main-course' },
  { name: 'Desserts', imageUrl: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=400&q=80', slug: 'desserts' },
  { name: 'Drinks', imageUrl: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=400&q=80', slug: 'drinks' }
];

const foods = [
  {
    name: 'Truffle Fries', description: 'Crispy french fries tossed in truffle oil and parmesan cheese.',
    price: 12.99, discountPrice: null, images: ['https://images.unsplash.com/photo-1534080564583-6be75777b70a?auto=format&fit=crop&w=800&q=80'],
    ingredients: ['Potatoes', 'Truffle Oil', 'Parmesan', 'Parsley'], calories: 450, prepTimeMinutes: 15,
    rating: 4.8, reviewsCount: 124, isAvailable: true, isFeatured: true, isPopular: true, categorySlug: 'appetizers'
  },
  {
    name: 'Bruschetta', description: 'Toasted bread topped with tomatoes, garlic, and fresh basil.',
    price: 9.99, discountPrice: null, images: ['https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?auto=format&fit=crop&w=800&q=80'],
    ingredients: ['Bread', 'Tomatoes', 'Garlic', 'Basil', 'Olive Oil'], calories: 300, prepTimeMinutes: 10,
    rating: 4.6, reviewsCount: 89, isAvailable: true, isFeatured: false, isPopular: false, categorySlug: 'appetizers'
  },
  {
    name: 'Calamari', description: 'Fried squid rings served with marinara sauce.',
    price: 14.99, discountPrice: 12.99, images: ['https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80'],
    ingredients: ['Squid', 'Flour', 'Marinara Sauce', 'Lemon'], calories: 500, prepTimeMinutes: 20,
    rating: 4.7, reviewsCount: 210, isAvailable: true, isFeatured: true, isPopular: true, categorySlug: 'appetizers'
  },
  {
    name: 'Stuffed Mushrooms', description: 'Mushroom caps stuffed with cheese and herbs.',
    price: 11.99, discountPrice: null, images: ['https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=800&q=80'],
    ingredients: ['Mushrooms', 'Cream Cheese', 'Garlic', 'Herbs'], calories: 350, prepTimeMinutes: 25,
    rating: 4.5, reviewsCount: 65, isAvailable: true, isFeatured: false, isPopular: false, categorySlug: 'appetizers'
  },
  {
    name: 'Grilled Ribeye Steak', description: 'Premium ribeye steak grilled to perfection, served with asparagus.',
    price: 45.00, discountPrice: null, images: ['https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80'],
    ingredients: ['Ribeye Beef', 'Asparagus', 'Butter', 'Garlic'], calories: 850, prepTimeMinutes: 30,
    rating: 4.9, reviewsCount: 340, isAvailable: true, isFeatured: true, isPopular: true, categorySlug: 'main-course'
  },
  {
    name: 'Lobster Ravioli', description: 'Homemade ravioli stuffed with lobster meat in a creamy tomato sauce.',
    price: 32.00, discountPrice: 28.00, images: ['https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80'],
    ingredients: ['Pasta', 'Lobster', 'Cream', 'Tomato Sauce'], calories: 700, prepTimeMinutes: 25,
    rating: 4.8, reviewsCount: 156, isAvailable: true, isFeatured: true, isPopular: true, categorySlug: 'main-course'
  },
  {
    name: 'Chicken Parmesan', description: 'Breaded chicken breast topped with marinara and melted mozzarella.',
    price: 24.00, discountPrice: null, images: ['https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?auto=format&fit=crop&w=800&q=80'],
    ingredients: ['Chicken Breast', 'Marinara', 'Mozzarella', 'Pasta'], calories: 950, prepTimeMinutes: 35,
    rating: 4.6, reviewsCount: 412, isAvailable: true, isFeatured: false, isPopular: true, categorySlug: 'main-course'
  },
  {
    name: 'Mushroom Risotto', description: 'Creamy arborio rice cooked with wild mushrooms and truffle oil.',
    price: 22.00, discountPrice: null, images: ['https://images.unsplash.com/photo-1633337474586-538ed61476d0?auto=format&fit=crop&w=800&q=80'],
    ingredients: ['Arborio Rice', 'Wild Mushrooms', 'Parmesan', 'Truffle Oil'], calories: 600, prepTimeMinutes: 40,
    rating: 4.7, reviewsCount: 128, isAvailable: true, isFeatured: false, isPopular: false, categorySlug: 'main-course'
  },
  {
    name: 'Pan-Seared Salmon', description: 'Fresh salmon fillet with lemon butter sauce and quinoa.',
    price: 28.00, discountPrice: null, images: ['https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80'],
    ingredients: ['Salmon', 'Lemon', 'Butter', 'Quinoa'], calories: 550, prepTimeMinutes: 20,
    rating: 4.8, reviewsCount: 275, isAvailable: true, isFeatured: true, isPopular: false, categorySlug: 'main-course'
  },
  {
    name: 'Classic Tiramisu', description: 'Coffee-soaked ladyfingers layered with mascarpone cream.',
    price: 12.00, discountPrice: null, images: ['https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&w=800&q=80'],
    ingredients: ['Ladyfingers', 'Espresso', 'Mascarpone', 'Cocoa Powder'], calories: 450, prepTimeMinutes: 10,
    rating: 4.9, reviewsCount: 310, isAvailable: true, isFeatured: true, isPopular: true, categorySlug: 'desserts'
  },
  {
    name: 'New York Cheesecake', description: 'Rich and creamy cheesecake with a graham cracker crust.',
    price: 10.00, discountPrice: null, images: ['https://images.unsplash.com/photo-1524351199678-941a58a3df50?auto=format&fit=crop&w=800&q=80'],
    ingredients: ['Cream Cheese', 'Graham Crackers', 'Sugar', 'Vanilla'], calories: 600, prepTimeMinutes: 15,
    rating: 4.7, reviewsCount: 189, isAvailable: true, isFeatured: false, isPopular: true, categorySlug: 'desserts'
  },
  {
    name: 'Chocolate Lava Cake', description: 'Warm chocolate cake with a gooey molten center.',
    price: 14.00, discountPrice: 12.00, images: ['https://images.unsplash.com/photo-1624353365286-3f8d62daad51?auto=format&fit=crop&w=800&q=80'],
    ingredients: ['Chocolate', 'Butter', 'Eggs', 'Sugar'], calories: 750, prepTimeMinutes: 20,
    rating: 4.8, reviewsCount: 256, isAvailable: true, isFeatured: true, isPopular: true, categorySlug: 'desserts'
  },
  {
    name: 'Artisan Lemonade', description: 'Freshly squeezed lemonade with a hint of mint.',
    price: 6.00, discountPrice: null, images: ['https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80'],
    ingredients: ['Lemon', 'Mint', 'Sugar', 'Water'], calories: 120, prepTimeMinutes: 5,
    rating: 4.5, reviewsCount: 88, isAvailable: true, isFeatured: false, isPopular: false, categorySlug: 'drinks'
  },
  {
    name: 'Craft Mojito', description: 'Classic mojito made with premium white rum and fresh mint.',
    price: 14.00, discountPrice: null, images: ['https://images.unsplash.com/photo-1551538827-9c037cb4f32a?auto=format&fit=crop&w=800&q=80'],
    ingredients: ['White Rum', 'Mint', 'Lime', 'Soda Water'], calories: 180, prepTimeMinutes: 5,
    rating: 4.6, reviewsCount: 145, isAvailable: true, isFeatured: true, isPopular: true, categorySlug: 'drinks'
  },
  {
    name: 'Espresso Martini', description: 'Cold espresso, vodka, and coffee liqueur.',
    price: 16.00, discountPrice: null, images: ['https://images.unsplash.com/photo-1628198644158-b1979b9426f3?auto=format&fit=crop&w=800&q=80'],
    ingredients: ['Espresso', 'Vodka', 'Coffee Liqueur'], calories: 200, prepTimeMinutes: 5,
    rating: 4.8, reviewsCount: 112, isAvailable: true, isFeatured: false, isPopular: true, categorySlug: 'drinks'
  }
];

const offers = [
  {
    title: 'Weekend Special: 20% Off Main Courses',
    description: 'Enjoy a 20% discount on all main course dishes this weekend!',
    imageUrl: 'https://images.unsplash.com/photo-1544025162-831e5f037dd3?auto=format&fit=crop&w=800&q=80',
    discountPercent: 20,
    validUntil: Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)), // +7 days
    isActive: true
  },
  {
    title: 'Free Dessert on Orders over $100',
    description: 'Get a free Classic Tiramisu or New York Cheesecake when your order exceeds $100.',
    imageUrl: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=800&q=80',
    discountPercent: 0,
    validUntil: Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)), // +30 days
    isActive: true
  }
];

async function seed() {
  try {
    console.log('Seeding categories...');
    const categoryIds: Record<string, string> = {};
    for (const cat of categories) {
      const docRef = await db.collection('categories').add(cat);
      categoryIds[cat.slug] = docRef.id;
    }

    console.log('Seeding foods...');
    for (const food of foods) {
      const { categorySlug, ...foodData } = food;
      await db.collection('foods').add({
        ...foodData,
        categoryId: categoryIds[categorySlug] || '',
        createdAt: FieldValue.serverTimestamp()
      });
    }

    console.log('Seeding offers...');
    for (const offer of offers) {
      await db.collection('offers').add(offer);
    }
    
    console.log('Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seed();
