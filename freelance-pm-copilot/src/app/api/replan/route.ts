import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, reason, changes } = body;
    
    if (!projectId || !reason) {
      return NextResponse.json({ error: 'Project ID and reason are required' }, { status: 400 });
    }

    // Call Firebase Function for replanning
    const response = await fetch(`${process.env.FIREBASE_FUNCTIONS_URL}/replanProject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectId,
        reason,
        changes
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to replan project');
    }

    const result = await response.json();
    
    return NextResponse.json({ 
      success: true, 
      newPlan: result.newPlan,
      diff: result.diff 
    });
  } catch (error) {
    console.error('Error replanning project:', error);
    return NextResponse.json({ error: 'Failed to replan project' }, { status: 500 });
  }
}
