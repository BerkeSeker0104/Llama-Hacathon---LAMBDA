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
    name: 'Nazik Ödeme Hatırlatması',
    subject: 'Yaklaşan ödemeniz hakkında dostane hatırlatma',
    body: `Hi {{clientName}},

Umarım iyisinizdir! {{milestone}} kilometre taşı için {{dueDate}} tarihinde vadesi gelen {{amount}} {{currency}} tutarındaki ödeme hakkında nazik bir hatırlatma göndermek istiyorum.

Programların yoğun olabileceğini anlıyorum, bu yüzden herhangi bir açıklamaya ihtiyacınız olursa veya yardımcı olabileceğim bir şey varsa lütfen bana bildirin.

Devam eden ortaklığınız için teşekkürler!

Saygılarımla,
{{freelancerName}}`,
    tone: 'gentle',
    type: 'payment_reminder'
  },
  {
    id: 'payment_reminder_neutral',
    name: 'Nötr Ödeme Hatırlatması',
    subject: 'Ödeme Hatırlatması - {{milestone}}',
    body: `Hi {{clientName}},

{{milestone}} kilometre taşı için {{amount}} {{currency}} tutarındaki ödemenin {{dueDate}} tarihinde vadesi geldiğini hatırlatırım.

Lütfen bu ödemeyi en kısa sürede işleme alın. Herhangi bir sorunuz olursa, bana ulaşmaktan çekinmeyin.

Saygılarımla,
{{freelancerName}}`,
    tone: 'neutral',
    type: 'payment_reminder'
  },
  {
    id: 'payment_reminder_firm',
    name: 'Sert Ödeme Hatırlatması',
    subject: 'Geciken Ödeme - {{milestone}}',
    body: `Hi {{clientName}},

{{milestone}} kilometre taşı için {{amount}} {{currency}} tutarındaki ödeme {{dueDate}} tarihinde vadesi gelmişti ve şimdi gecikmiş durumda.

Proje teslimatında gecikme yaşamamak için lütfen bu ödemeyi derhal işleme alın. Ödemeyi engelleyen herhangi bir sorun varsa, lütfen doğrudan benimle iletişime geçin.

Saygılarımla,
{{freelancerName}}`,
    tone: 'firm',
    type: 'payment_reminder'
  },
  {
    id: 'change_order_proposal',
    name: 'Değişiklik Emri Teklifi',
    subject: 'Değişiklik Talebi - {{contractTitle}}',
    body: `Hi {{clientName}},

Değişiklik talebiniz için teşekkürler. Talebinizi analiz ettim ve aşağıdaki seçenekleri hazırladım:

**Talep:** {{requestText}}

**Analiz:** {{analysis}}

**Önerilen Seçenekler:**
{{options}}

Lütfen bu seçenekleri inceleyin ve hangisiyle devam etmek istediğinizi veya herhangi bir sorunuz olup olmadığını bana bildirin.

Saygılarımla,
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
