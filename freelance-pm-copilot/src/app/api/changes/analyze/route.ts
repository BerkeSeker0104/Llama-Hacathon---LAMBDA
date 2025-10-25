import { NextRequest, NextResponse } from 'next/server';
import { ChangeRequestService } from '@/lib/firestore-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { requestText, contractId, userId } = body;

    if (!requestText || !contractId || !userId) {
      return NextResponse.json({ error: 'Gerekli alanlar eksik' }, { status: 400 });
    }

    // Create change request in Firestore
    const changeRequestId = await ChangeRequestService.createChangeRequest({
      contractId,
      userId,
      requestText,
      type: 'scope-change', // Default type, AI will determine actual type
      status: 'pending'
    });

    // In a real app, this would call the AI backend (Groq API or AI team's Cloud Function)
    // For demo purposes, we'll return mock analysis
    const mockAnalysis = {
      type: 'out-of-scope',
      impact: {
        time: '1-2 weeks',
        cost: '$2,000 - $4,000',
        scope: 'Medium addition - new feature request'
      },
      options: [
        {
        title: 'Temel Uygulama',
        description: 'İstenen özelliğin basit versiyonu',
          timeline: '1 week',
          cost: '$2,000'
        },
        {
        title: 'Tam Uygulama',
        description: 'Tüm istenen işlevsellikle eksiksiz özellik',
          timeline: '2 weeks',
          cost: '$4,000'
        },
        {
        title: 'Premium Uygulama',
        description: 'Ek özelliklerle gelişmiş versiyon',
          timeline: '3 weeks',
          cost: '$6,000'
        }
      ],
      analyzedAt: new Date()
    };

    // Update change request with analysis
    await ChangeRequestService.updateChangeRequest(changeRequestId, {
      analysis: mockAnalysis,
      status: 'analyzed'
    });

    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    return NextResponse.json({ 
      success: true, 
      analysis: mockAnalysis,
      changeRequestId
    });
  } catch (error) {
    console.error('Error analyzing change request:', error);
    return NextResponse.json({ error: 'Failed to analyze change request' }, { status: 500 });
  }
}
