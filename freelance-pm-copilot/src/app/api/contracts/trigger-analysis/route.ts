import { NextRequest, NextResponse } from 'next/server';
import { ContractService } from '@/lib/firestore-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contractId, pdfUrl } = body;

    if (!contractId || !pdfUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Update contract status to analyzing
    await ContractService.updateContract(contractId, {
      status: 'analyzing'
    });

    // In a real app, this would trigger AI team's Cloud Function
    // For now, we'll simulate the AI analysis process
    console.log(`Triggering AI analysis for contract ${contractId} with PDF: ${pdfUrl}`);
    
    // TODO: Replace with actual AI team Cloud Function call
    // Example:
    // await fetch('https://ai-team-cloud-function-url', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ contractId, pdfUrl })
    // });

    return NextResponse.json({ 
      success: true, 
      message: 'AI analysis triggered successfully',
      contractId
    });
  } catch (error) {
    console.error('Error triggering AI analysis:', error);
    return NextResponse.json({ error: 'Failed to trigger AI analysis' }, { status: 500 });
  }
}
