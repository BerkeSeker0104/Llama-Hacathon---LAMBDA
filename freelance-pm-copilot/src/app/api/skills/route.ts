import { NextRequest, NextResponse } from 'next/server';
import { SkillService } from '@/lib/firestore-service';

export async function GET() {
  try {
    const skills = await SkillService.getAllSkills();
    return NextResponse.json({ skills });
  } catch (error) {
    console.error('Error fetching skills:', error);
    return NextResponse.json({ error: 'Failed to fetch skills' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, category } = body;
    
    if (!key || !category) {
      return NextResponse.json({ error: 'Key and category are required' }, { status: 400 });
    }

    const skill = await SkillService.createSkill({
      key,
      category
    });
    
    return NextResponse.json({ skill });
  } catch (error) {
    console.error('Error creating skill:', error);
    return NextResponse.json({ error: 'Failed to create skill' }, { status: 500 });
  }
}
