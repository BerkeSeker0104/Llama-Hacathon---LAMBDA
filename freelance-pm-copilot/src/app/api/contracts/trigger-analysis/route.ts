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

    console.log(`Triggering AI analysis for contract ${contractId} with PDF: ${pdfUrl}`);
    
    // Call the Cloud Function for contract analysis
    const cloudFunctionUrl = process.env.NEXT_PUBLIC_CLOUD_FUNCTIONS_URL || 
      `https://us-central1-${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.cloudfunctions.net/analyzeContract`;
    
    try {
      const response = await fetch(cloudFunctionUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.CLOUD_FUNCTIONS_TOKEN || ''}`
        },
        body: JSON.stringify({ contractId, pdfUrl })
      });

      if (!response.ok) {
        throw new Error(`Cloud Function error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        return NextResponse.json({ 
          success: true, 
          message: 'AI analysis triggered successfully',
          contractId
        });
      } else {
        throw new Error(result.error || 'Analysis failed');
      }
      
    } catch (cloudFunctionError) {
      console.error('Cloud Function error:', cloudFunctionError);
      
      // Fallback: Update contract status to error
      await ContractService.updateContract(contractId, {
        status: 'error'
      });
      
      return NextResponse.json({ 
        error: 'Failed to trigger AI analysis',
        details: cloudFunctionError instanceof Error ? cloudFunctionError.message : 'Unknown error'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error triggering AI analysis:', error);
    return NextResponse.json({ error: 'Failed to trigger AI analysis' }, { status: 500 });
  }
}
