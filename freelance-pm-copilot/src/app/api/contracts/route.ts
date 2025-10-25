import { NextRequest, NextResponse } from 'next/server';
import { ContractService } from '@/lib/firestore-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Get all contracts for the user using the service
    const contracts = await ContractService.getContractsByUser(userId);

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
      return NextResponse.json({ error: 'Gerekli alanlar eksik' }, { status: 400 });
    }

    // Create contract using the service
    const contractId = await ContractService.createContract({
      title,
      clientName,
      clientEmail,
      userId,
      status: 'analyzing'
    });

    return NextResponse.json({ 
      success: true, 
      contractId,
      message: 'Sözleşme başarıyla oluşturuldu' 
    });
  } catch (error) {
    console.error('Error creating contract:', error);
    return NextResponse.json({ error: 'Sözleşme oluşturulamadı' }, { status: 500 });
  }
}
