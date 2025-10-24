import { NextRequest, NextResponse } from 'next/server';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // This would be a webhook from Stripe, iyzico, or other payment processor
    const { paymentId, status, amount, currency, paidAt } = body;

    if (!paymentId || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Update payment status in Firestore
    const paymentRef = doc(db, 'payments', paymentId);
    await updateDoc(paymentRef, {
      status: status === 'paid' ? 'paid' : 'upcoming',
      paidAt: status === 'paid' ? new Date() : null,
      updatedAt: new Date()
    });

    // Log the webhook event
    console.log('Payment webhook received:', {
      paymentId,
      status,
      amount,
      currency,
      paidAt
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Payment status updated successfully' 
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Failed to process webhook' }, { status: 500 });
  }
}
