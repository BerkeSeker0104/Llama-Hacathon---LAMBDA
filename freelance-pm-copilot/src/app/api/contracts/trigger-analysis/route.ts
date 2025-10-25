import { NextRequest, NextResponse } from 'next/server';
import { ContractService } from '@/lib/firestore-service';

export async function POST(request: NextRequest) {
  try {
    console.log('=== Next.js API Route START ===');
    console.log('Request method:', request.method);
    console.log('Request headers:', Object.fromEntries(request.headers.entries()));
    
    const body = await request.json();
    console.log('Request body:', body);
    
    const { contractId, pdfUrl, pdfPath } = body;

    if (!contractId || (!pdfUrl && !pdfPath)) {
      console.log('Missing required fields');
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Update contract status to analyzing
    await ContractService.updateContract(contractId, {
      status: 'analyzing'
    });

    console.log(`Triggering AI analysis for contract ${contractId} with PDF: ${pdfUrl || pdfPath}`);
    
    // Call the Cloud Function for contract analysis
    const cloudFunctionUrl = `https://us-central1-lambda-926aa.cloudfunctions.net/analyzeContract`;
    
    console.log(`Environment NEXT_PUBLIC_CLOUD_FUNCTIONS_URL: ${process.env.NEXT_PUBLIC_CLOUD_FUNCTIONS_URL}`);
    console.log(`Final Cloud Function URL: ${cloudFunctionUrl}`);
    
    console.log(`Calling Cloud Function: ${cloudFunctionUrl}`);
    
    try {
      const response = await fetch(cloudFunctionUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ contractId, pdfUrl, pdfPath })
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
