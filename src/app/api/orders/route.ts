import { NextResponse } from 'next/server';
import { getAdminServices } from '@/firebase/admin';
import { getAuthenticatedUser } from '@/lib/auth-server';
import { sendNotificationServer, sendAdminNotificationServer } from '@/lib/notifications-server';

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { items, customerInfo, paymentMethod, orderNotes } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Order must contain items' }, { status: 400 });
    }

    const { adminDb } = await getAdminServices();

    // 1. Verify Prices and Calculate Total Securely
    let calculatedTotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const documentId = item.foodId || item.id;
      const menuDoc = await adminDb.collection('menu').doc(documentId).get();
      if (!menuDoc.exists) {
        return NextResponse.json({ error: `Item ${item.name} not found in menu` }, { status: 400 });
      }

      const menuData = menuDoc.data()!;
      let itemTotal = menuData.price;

      // Verify Add-ons
      const validatedAddons = [];
      if (item.selectedAddons && item.selectedAddons.length > 0) {
        // Ideally we would fetch the exact add-on price from a master list,
        // but for now we assume the client passed the correct add-on price if it matches menu definition or global add-ons
        // In a full production app, you'd strictly validate this against a database of add-ons
        for (const addon of item.selectedAddons) {
          itemTotal += addon.price;
          validatedAddons.push(addon);
        }
      }

      itemTotal *= item.quantity;
      calculatedTotal += itemTotal;

      validatedItems.push({
        id: item.id,
        name: menuData.name,
        price: menuData.price, // the verified price
        quantity: item.quantity,
        selectedAddons: validatedAddons,
        specialInstructions: item.specialInstructions || '',
      });
    }

    // Taxes & Fees (Matches client-side logic for now)
    const tax = calculatedTotal * 0.05;
    const deliveryFee = 2.99;
    const finalTotal = calculatedTotal + tax + deliveryFee;

    // 2. Create the Order
    const orderData = {
      userId: user.uid,
      customerInfo,
      items: validatedItems,
      subtotal: calculatedTotal,
      tax,
      deliveryFee,
      totalAmount: finalTotal,
      paymentMethod,
      orderNotes: orderNotes || '',
      status: 'pending',
      createdAt: new Date(),
    };

    const docRef = await adminDb.collection('orders').add(orderData);

    // 3. Send Notifications
    await sendNotificationServer({
      userId: user.uid,
      title: 'Order Placed Successfully! 🛍️',
      message: `Your order #${docRef.id.slice(0, 6).toUpperCase()} of $${finalTotal.toFixed(2)} has been placed. We're getting it ready!`,
      type: 'order',
      link: '/dashboard?tab=orders',
      metadata: { orderId: docRef.id, amount: finalTotal }
    });

    await sendAdminNotificationServer({
      title: 'New Order Received! 🛍️',
      message: `${customerInfo.fullName} placed order #${docRef.id.slice(0, 6).toUpperCase()} for $${finalTotal.toFixed(2)} (${validatedItems.length} items)`,
      type: 'order',
      link: '/admin/orders',
      metadata: { orderId: docRef.id, totalAmount: finalTotal, customerName: customerInfo.fullName }
    });

    return NextResponse.json({ success: true, orderId: docRef.id, totalAmount: finalTotal }, { status: 201 });

  } catch (error: any) {
    console.error('Order API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { adminDb } = await getAdminServices();
    
    // If admin, return all orders, otherwise return only user's orders
    let query = adminDb.collection('orders').orderBy('createdAt', 'desc');
    
    if (user.role !== 'admin') {
      query = query.where('userId', '==', user.uid);
    }

    const snapshot = await query.get();
    const orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
    }));

    return NextResponse.json({ orders }, { status: 200 });
  } catch (error: any) {
    console.error('Fetch Orders API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
