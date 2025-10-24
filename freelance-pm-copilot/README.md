# Freelance PM Copilot

AI-powered project management for freelancers. Transform your freelance business with intelligent contract analysis, automated payment tracking, and smart change management.

## Features

- **Contract Intelligence**: Upload any contract PDF and get instant analysis of deliverables, milestones, payment terms, and potential risks
- **Smart Payment Tracking**: Never miss a payment again with automated reminders and intelligent payment status tracking
- **Reality-Based Planning**: AI analyzes your past performance to create realistic timelines with optimistic, realistic, and pessimistic scenarios
- **Change Management**: Automatically detect scope creep and generate professional change orders with impact analysis and pricing options
- **Multi-Client Command**: Manage all your clients from one dashboard with upcoming deadlines, overdue payments, and risk items
- **Cash Flow Protection**: Reduce late payments by 60% with intelligent reminder systems and automated follow-up sequences

## Tech Stack

- **Frontend & Backend**: Next.js 14 (App Router) + TypeScript
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage
- **AI**: Groq API + LlamaParse (AI team manages)
- **Email**: Resend API
- **Payment Webhooks**: Stripe/iyzico
- **Deployment**: Vercel
- **Styling**: Tailwind CSS + shadcn/ui

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase project
- Resend account (for email)
- Stripe/iyzico account (for payments)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd freelance-pm-copilot
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file with the following variables:

```env
# Firebase Configuration (Client-side)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin Configuration (Server-side)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=your_project.appspot.com

# Email Service
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Payment Webhooks
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
IYZICO_SECRET=your_iyzico_secret

# AI Services (Optional - if using directly)
GROQ_API_KEY=your_groq_api_key
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
/app
  /(auth)                    # Authentication pages
    /login
    /register
  /dashboard                 # Main dashboard
  /contracts                 # Contract management
    /new                     # Upload new contract
    /[id]                    # Contract details
  /planning                  # Project planning
  /payments                  # Payment tracking
  /changes                   # Change management
  /communications            # Email communications
  /settings                  # User settings
  /api                       # API routes
    /contracts               # Contract CRUD
    /payments                # Payment management
    /changes                 # Change request handling
    /communications          # Email sending
/lib
  /firebase-admin.ts         # Firebase Admin SDK
  /firebase-client.ts        # Firebase Client SDK
  /email-service.ts          # Email templates and sending
  /pdf-generator.ts          # PDF generation
/components
  /ui                        # shadcn/ui components
  /dashboard                 # Dashboard components
  /contracts                 # Contract components
  /payments                  # Payment components
  /changes                   # Change management components
```

## Key Features Implementation

### Contract Analysis
- PDF upload to Firebase Storage
- AI analysis via Cloud Functions (AI team)
- Real-time status updates
- Structured data extraction

### Payment Tracking
- Automated payment reminders
- Multiple tone options (gentle, neutral, firm)
- Webhook integration for payment status
- Overdue payment alerts

### Change Management
- AI-powered change request analysis
- Automatic scope detection
- Professional change order generation
- Email and PDF templates

### Planning & Timeline
- AI-generated realistic timelines
- Sprint planning and task management
- Plan versioning and comparison
- Progress tracking

## Demo Scenarios

### Demo 1: Contract Upload & Analysis (2 minutes)
1. Login → Dashboard
2. "New Contract" → PDF upload
3. Wait for AI analysis (5-10 seconds)
4. View contract details with 6 tabs
5. "Create Sprint Plan" → 2 sprint timeline

### Demo 2: Payment Reminder (1.5 minutes)
1. Dashboard → "Overdue Payments" card
2. Click payment → "Send Reminder"
3. Select tone → Preview email → Send
4. View sent email in Communications

### Demo 3: Change Request (2.5 minutes)
1. Copy client change request text
2. `/changes/new` → Paste text → "Analyze"
3. Review AI analysis and 3 options
4. Select option → Generate email + PDF
5. Send to client → Upload evidence
6. Apply changes → View plan v2

## Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production
- All variables from `.env.local` need to be set in Vercel
- Update webhook URLs for Stripe/iyzico
- Configure custom domain if needed

## AI Team Integration

The AI team handles:
- PDF parsing with LlamaParse
- Contract analysis with Groq API
- Cloud Functions for processing
- Firestore data structure

Frontend team handles:
- User interface and experience
- Email templates and sending
- PDF generation for change orders
- Payment webhook processing

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, email support@freelancepm.com or join our Discord community.