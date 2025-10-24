import { NextRequest, NextResponse } from 'next/server';
import { generateEmailFromTemplate, emailTemplates } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { changeRequest, analysis, selectedOption, clientName, contractTitle } = body;

    if (!changeRequest || !analysis || !selectedOption || !clientName || !contractTitle) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Find the change order template
    const template = emailTemplates.find(t => t.type === 'change_order');
    
    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 400 });
    }

    // Generate email content
    const { subject, body: emailBody } = generateEmailFromTemplate(template, {
      clientName,
      contractTitle,
      requestText: changeRequest,
      analysis: `Type: ${analysis.type}\nImpact: ${analysis.impact.time}, ${analysis.impact.cost}`,
      options: analysis.options.map((opt: any, index: number) => 
        `${index + 1}. ${opt.title} - ${opt.description} (${opt.timeline}, ${opt.cost})`
      ).join('\n'),
      freelancerName: 'Your Name' // This should come from user settings
    });

    return NextResponse.json({ 
      success: true, 
      emailDraft: {
        subject,
        body: emailBody
      }
    });
  } catch (error) {
    console.error('Error generating email:', error);
    return NextResponse.json({ error: 'Failed to generate email' }, { status: 500 });
  }
}
