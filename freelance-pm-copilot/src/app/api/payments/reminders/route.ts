import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, generateEmailFromTemplate, emailTemplates } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentId, tone, clientEmail, clientName, amount, currency, dueDate, milestone } = body;

    if (!paymentId || !tone || !clientEmail || !clientName || !amount || !currency || !dueDate || !milestone) {
      return NextResponse.json({ error: 'Gerekli alanlar eksik' }, { status: 400 });
    }

    // Find the appropriate email template
    const template = emailTemplates.find(t => 
      t.type === 'payment_reminder' && t.tone === tone
    );

    if (!template) {
      return NextResponse.json({ error: 'Şablon bulunamadı' }, { status: 400 });
    }

    // Generate email content
    const { subject, body: emailBody } = generateEmailFromTemplate(template, {
      clientName,
      amount: amount.toString(),
      currency,
      dueDate,
      milestone,
      freelancerName: 'Your Name' // This should come from user settings
    });

    // Send email
    const emailResult = await sendEmail(clientEmail, subject, emailBody);

    // In a real app, you would save this to Firestore
    console.log('Email sent:', emailResult);

    return NextResponse.json({ 
      success: true, 
      message: 'Hatırlatma başarıyla gönderildi',
      emailId: emailResult.id 
    });
  } catch (error) {
    console.error('Error sending reminder:', error);
    return NextResponse.json({ error: 'Hatırlatma gönderilemedi' }, { status: 500 });
  }
}
