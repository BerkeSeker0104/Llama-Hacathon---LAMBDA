import { NextRequest, NextResponse } from 'next/server';
import { TeamService } from '@/lib/firestore-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    
    if (!companyId) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
    }

    const teams = await TeamService.getTeamsByCompany(companyId);
    return NextResponse.json({ teams });
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, companyId, managerId, description } = body;
    
    if (!name || !companyId || !managerId) {
      return NextResponse.json({ error: 'Name, companyId, and managerId are required' }, { status: 400 });
    }

    const team = await TeamService.createTeam({
      name,
      companyId,
      managerId,
      description
    });
    
    return NextResponse.json({ team });
  } catch (error) {
    console.error('Error creating team:', error);
    return NextResponse.json({ error: 'Failed to create team' }, { status: 500 });
  }
}
