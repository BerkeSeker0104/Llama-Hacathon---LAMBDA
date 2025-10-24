import { NextRequest, NextResponse } from 'next/server';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase-client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Get all contracts for the user
    const contractsRef = collection(db, 'contracts');
    const q = query(contractsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    const contracts = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ contracts });
  } catch (error) {
    console.error('Error fetching contracts:', error);
    return NextResponse.json({ error: 'Failed to fetch contracts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, clientName, clientEmail, userId } = body;

    if (!title || !clientName || !clientEmail || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const contractId = `contract_${Date.now()}`;
    const contractRef = doc(db, 'contracts', contractId);

    const contractData = {
      id: contractId,
      title,
      clientName,
      clientEmail,
      userId,
      status: 'analyzing',
      createdAt: new Date(),
      uploadedAt: new Date(),
      pdfUrl: '', // Will be set when file is uploaded
      analysis: null // Will be set by AI analysis
    };

    await setDoc(contractRef, contractData);

    return NextResponse.json({ 
      success: true, 
      contractId,
      message: 'Contract created successfully' 
    });
  } catch (error) {
    console.error('Error creating contract:', error);
    return NextResponse.json({ error: 'Failed to create contract' }, { status: 500 });
  }
}
