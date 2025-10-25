import { NextRequest, NextResponse } from 'next/server';
import { ContractService } from '@/lib/firestore-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contractId, sprintDurationWeeks = 2 } = body;

    if (!contractId) {
      return NextResponse.json({ error: 'Missing contractId' }, { status: 400 });
    }

    // Check if contract exists and has analysis
    const contract = await ContractService.getContract(contractId);
    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    if (!contract.analysis) {
      return NextResponse.json({ error: 'Contract must be analyzed before generating sprint plan' }, { status: 400 });
    }

    console.log(`Generating sprint plan for contract ${contractId} with ${sprintDurationWeeks} weeks duration`);
    
    // Call the Cloud Function for sprint plan generation
    const cloudFunctionUrl = process.env.NEXT_PUBLIC_CLOUD_FUNCTIONS_URL || 
      `https://us-central1-${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.cloudfunctions.net/generateSprintPlan`;
    
    try {
      const response = await fetch(cloudFunctionUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.CLOUD_FUNCTIONS_TOKEN || ''}`
        },
        body: JSON.stringify({ contractId, sprintDurationWeeks })
      });

      if (!response.ok) {
        throw new Error(`Cloud Function error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        return NextResponse.json({ 
          success: true, 
          message: 'Sprint plan generated successfully',
          contractId,
          planId: result.planId
        });
      } else {
        throw new Error(result.error || 'Sprint plan generation failed');
      }
      
    } catch (cloudFunctionError) {
      console.error('Cloud Function error:', cloudFunctionError);
      
      return NextResponse.json({ 
        error: 'Failed to generate sprint plan',
        details: cloudFunctionError instanceof Error ? cloudFunctionError.message : 'Unknown error'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error generating sprint plan:', error);
    return NextResponse.json({ error: 'Failed to generate sprint plan' }, { status: 500 });
  }
}
