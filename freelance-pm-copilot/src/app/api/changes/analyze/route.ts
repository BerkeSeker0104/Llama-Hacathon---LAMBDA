import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { requestText, contractId } = body;

    if (!requestText || !contractId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

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
          title: 'Basic Implementation',
          description: 'Simple version of the requested feature',
          timeline: '1 week',
          cost: '$2,000'
        },
        {
          title: 'Full Implementation',
          description: 'Complete feature with all requested functionality',
          timeline: '2 weeks',
          cost: '$4,000'
        },
        {
          title: 'Premium Implementation',
          description: 'Advanced version with additional features',
          timeline: '3 weeks',
          cost: '$6,000'
        }
      ]
    };

    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    return NextResponse.json({ 
      success: true, 
      analysis: mockAnalysis 
    });
  } catch (error) {
    console.error('Error analyzing change request:', error);
    return NextResponse.json({ error: 'Failed to analyze change request' }, { status: 500 });
  }
}
