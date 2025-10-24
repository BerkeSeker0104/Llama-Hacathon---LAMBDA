import { NextRequest, NextResponse } from 'next/server';
import { ContractService } from '@/lib/firestore-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contractId, analysis } = body;

    if (!contractId || !analysis) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Update contract with analysis results
    await ContractService.updateContractAnalysis(contractId, analysis);

    return NextResponse.json({ 
      success: true, 
      message: 'Contract analysis saved successfully' 
    });
  } catch (error) {
    console.error('Error saving contract analysis:', error);
    return NextResponse.json({ error: 'Failed to save contract analysis' }, { status: 500 });
  }
}
