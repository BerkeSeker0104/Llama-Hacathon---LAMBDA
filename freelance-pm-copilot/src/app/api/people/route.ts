import { NextRequest, NextResponse } from 'next/server';
import { PersonService } from '@/lib/firestore-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const teamId = searchParams.get('teamId');
    
    if (!companyId) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
    }

    let people;
    if (teamId) {
      people = await PersonService.getPeopleByTeam(teamId);
    } else {
      people = await PersonService.getPeopleByCompany(companyId);
    }
    
    return NextResponse.json({ people });
  } catch (error) {
    console.error('Error fetching people:', error);
    return NextResponse.json({ error: 'Failed to fetch people' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, role, companyId, teamId, hoursPerWeek, currentWorkload } = body;
    
    if (!name || !email || !role || !companyId || !teamId) {
      return NextResponse.json({ error: 'Name, email, role, companyId, and teamId are required' }, { status: 400 });
    }

    const person = await PersonService.createPerson({
      name,
      email,
      role,
      companyId,
      teamId,
      hoursPerWeek: hoursPerWeek || 40,
      currentWorkload: currentWorkload || 0
    });
    
    return NextResponse.json({ person });
  } catch (error) {
    console.error('Error creating person:', error);
    return NextResponse.json({ error: 'Failed to create person' }, { status: 500 });
  }
}
