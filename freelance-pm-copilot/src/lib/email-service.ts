import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 'demo-key');

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  tone: 'gentle' | 'neutral' | 'firm';
  type: 'payment_reminder' | 'change_order' | 'contract_share';
}

export const emailTemplates: EmailTemplate[] = [
  {
    id: 'payment_reminder_gentle',
    name: 'Gentle Payment Reminder',
    subject: 'Friendly reminder about your upcoming payment',
    body: `Hi {{clientName}},

I hope you're doing well! I wanted to send a gentle reminder that we have a payment of {{amount}} {{currency}} due on {{dueDate}} for the {{milestone}} milestone.

I understand that schedules can get busy, so please let me know if you need any clarification or if there's anything I can help with.

Thank you for your continued partnership!

Best regards,
{{freelancerName}}`,
    tone: 'gentle',
    type: 'payment_reminder'
  },
  {
    id: 'payment_reminder_neutral',
    name: 'Neutral Payment Reminder',
    subject: 'Payment Reminder - {{milestone}}',
    body: `Hi {{clientName}},

This is a reminder that payment of {{amount}} {{currency}} for the {{milestone}} milestone is due on {{dueDate}}.

Please process this payment at your earliest convenience. If you have any questions, feel free to reach out.

Best regards,
{{freelancerName}}`,
    tone: 'neutral',
    type: 'payment_reminder'
  },
  {
    id: 'payment_reminder_firm',
    name: 'Firm Payment Reminder',
    subject: 'Overdue Payment - {{milestone}}',
    body: `Hi {{clientName}},

Payment of {{amount}} {{currency}} for the {{milestone}} milestone was due on {{dueDate}} and is now overdue.

Please process this payment immediately to avoid any delays in project delivery. If there are any issues preventing payment, please contact me directly.

Best regards,
{{freelancerName}}`,
    tone: 'firm',
    type: 'payment_reminder'
  },
  {
    id: 'change_order_proposal',
    name: 'Change Order Proposal',
    subject: 'Change Request - {{contractTitle}}',
    body: `Hi {{clientName}},

Thank you for your change request. I've analyzed your request and prepared the following options:

**Request:** {{requestText}}

**Analysis:** {{analysis}}

**Proposed Options:**
{{options}}

Please review these options and let me know which one you'd like to proceed with, or if you have any questions.

Best regards,
{{freelancerName}}`,
    tone: 'neutral',
    type: 'change_order'
  }
];

export async function sendEmail(
  to: string,
  subject: string,
  body: string,
  from?: string
) {
  try {
    // Demo mode - just log the email
    if (process.env.RESEND_API_KEY === 'demo-key' || !process.env.RESEND_API_KEY) {
      console.log('Demo Email:', { to, subject, body });
      return { id: `demo-${Date.now()}` };
    }

    const { data, error } = await resend.emails.send({
      from: from || process.env.RESEND_FROM_EMAIL || 'noreply@freelancepm.com',
      to: [to],
      subject,
      html: body.replace(/\n/g, '<br>'),
    });

    if (error) {
      console.error('Email send error:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Email service error:', error);
    throw error;
  }
}

export function generateEmailFromTemplate(
  template: EmailTemplate,
  variables: Record<string, string>
): { subject: string; body: string } {
  let subject = template.subject;
  let body = template.body;

  // Replace variables in subject and body
  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`;
    subject = subject.replace(new RegExp(placeholder, 'g'), value);
    body = body.replace(new RegExp(placeholder, 'g'), value);
  });

  return { subject, body };
}
