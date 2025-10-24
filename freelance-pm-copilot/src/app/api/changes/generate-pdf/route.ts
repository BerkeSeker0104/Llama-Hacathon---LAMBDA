import { NextRequest, NextResponse } from 'next/server';
import { generateChangeOrderPDF } from '@/lib/pdf-generator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      contractTitle, 
      clientName, 
      clientEmail, 
      requestText, 
      analysis, 
      selectedOption,
      freelancerName,
      freelancerEmail 
    } = body;

    if (!contractTitle || !clientName || !clientEmail || !requestText || !analysis || !selectedOption) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Prepare data for PDF generation
    const changeOrderData = {
      contractTitle,
      clientName,
      clientEmail,
      requestText,
      analysis: {
        type: analysis.type,
        impact: {
          time: analysis.impact.time,
          cost: analysis.impact.cost,
          scope: analysis.impact.scope
        },
        options: analysis.options.map((opt: any) => ({
          title: opt.title,
          description: opt.description,
          timeline: opt.timeline,
          cost: opt.cost
        }))
      },
      selectedOption: parseInt(selectedOption),
      freelancerName: freelancerName || 'Your Name',
      freelancerEmail: freelancerEmail || 'your@email.com',
      date: new Date().toLocaleDateString()
    };

    // Generate PDF
    const pdf = generateChangeOrderPDF(changeOrderData);
    const pdfBuffer = pdf.output('arraybuffer');
    const pdfBase64 = Buffer.from(pdfBuffer).toString('base64');

    return NextResponse.json({ 
      success: true, 
      pdfBase64,
      message: 'PDF generated successfully' 
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
