import { NextRequest, NextResponse } from 'next/server';
import { AssignmentService } from '@/lib/firestore-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');
    const personId = searchParams.get('personId');
    
    if (!taskId && !personId) {
      return NextResponse.json({ error: 'Either taskId or personId is required' }, { status: 400 });
    }

    let assignments;
    if (taskId) {
      assignments = await AssignmentService.getAssignmentsByTask(taskId);
    } else {
      assignments = await AssignmentService.getAssignmentsByPerson(personId!);
    }
    
    return NextResponse.json({ assignments });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { taskId, personId, personName, plannedHours, sprintId } = body;
    
    if (!taskId || !personId || !personName || !plannedHours || !sprintId) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const assignment = await AssignmentService.createAssignment({
      taskId,
      personId,
      personName,
      plannedHours,
      sprintId
    });
    
    return NextResponse.json({ assignment });
  } catch (error) {
    console.error('Error creating assignment:', error);
    return NextResponse.json({ error: 'Failed to create assignment' }, { status: 500 });
  }
}
