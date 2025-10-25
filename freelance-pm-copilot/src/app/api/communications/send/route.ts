import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email-service';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      to, 
      subject, 
      body: emailBody, 
      attachments = [], 
      type = 'reminder',
      contractId,
      userId 
    } = body;

    if (!to || !subject || !emailBody || !userId) {
      return NextResponse.json({ error: 'Gerekli alanlar eksik' }, { status: 400 });
    }

    // Send email
    const emailResult = await sendEmail(to, subject, emailBody);

    // Save communication record to Firestore
    const communicationId = `comm_${Date.now()}`;
    const communicationRef = doc(db, 'communications', communicationId);
    
    await setDoc(communicationRef, {
      id: communicationId,
      type,
      contractId: contractId || null,
      to,
      subject,
      body: emailBody,
      attachments,
      sentAt: new Date(),
      status: 'sent',
      userId,
      emailId: emailResult.id
    });

    return NextResponse.json({ 
      success: true, 
      message: 'E-posta başarıyla gönderildi',
      communicationId,
      emailId: emailResult.id 
    });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ error: 'E-posta gönderilemedi' }, { status: 500 });
  }
}
