# Serbest PM Asistanı

Serbest çalışanlar için yapay zeka destekli proje yönetimi. Akıllı sözleşme analizi, otomatik ödeme takibi ve akıllı değişiklik yönetimi ile serbest çalışma işinizi dönüştürün.

## Özellikler

- **Sözleşme Zekası**: Herhangi bir sözleşme PDF'ini yükleyin ve teslim edilebilirler, kilometre taşları, ödeme koşulları ve potansiyel riskler hakkında anında analiz alın
- **Akıllı Ödeme Takibi**: Otomatik hatırlatmalar ve akıllı ödeme durumu takibi ile bir daha asla ödeme kaçırmayın
- **Gerçekçi Planlama**: Yapay zeka geçmiş performansınızı analiz ederek iyimser, gerçekçi ve kötümser senaryolarla gerçekçi zaman çizelgeleri oluşturur
- **Değişiklik Yönetimi**: Kapsam genişlemesini otomatik olarak tespit edin ve etki analizi ile fiyatlandırma seçenekleri içeren profesyonel değişiklik emirleri oluşturun
- **Çoklu Müşteri Yönetimi**: Yaklaşan son tarihler, geciken ödemeler ve risk öğeleri ile tüm müşterilerinizi tek bir panelden yönetin
- **Nakit Akışı Koruması**: Akıllı hatırlatma sistemleri ve otomatik takip dizileri ile geciken ödemeleri %60 azaltın

## Teknoloji Yığını

- **Frontend & Backend**: Next.js 14 (App Router) + TypeScript
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage
- **AI**: Groq API + LlamaParse (AI team manages)
- **Email**: Resend API
- **Payment Webhooks**: Stripe/iyzico
- **Deployment**: Vercel
- **Styling**: Tailwind CSS + shadcn/ui

## Başlangıç

### Ön Gereksinimler

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

## Current Implementation Status

### ✅ What's Working Now

**Real-time Data Integration**
- Dashboard shows live contract data from Firestore
- Change requests are stored and retrieved from Firebase
- Communications are tracked in real-time
- All CRUD operations work with Firebase

**Functional Features**
- User authentication and session management
- Contract management with real Firebase data
- Change request analysis with AI integration (mock)
- Email sending with Resend API
- PDF generation for change orders
- Payment tracking and reminder system

**UI/UX**
- Responsive design with Tailwind CSS
- Real-time updates without page refresh
- Professional dashboard with live data
- Complete navigation and routing

### 🔄 What Needs Integration

**AI Team Coordination**
- PDF upload to Firebase Storage (frontend ready)
- AI analysis results integration (backend ready)
- Real-time analysis status updates

**Payment Systems**
- Stripe/iyzico webhook validation
- Payment status updates in Firestore
- Overdue payment detection logic

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

## Current Project Status

### ✅ Completed Features (85% Done)

**Core Infrastructure**
- ✅ Next.js 16 + TypeScript setup
- ✅ Firebase integration (Auth, Firestore, Storage)
- ✅ Tailwind CSS + shadcn/ui components
- ✅ Authentication system (login/register/logout)
- ✅ Protected routes middleware

**User Interface**
- ✅ Landing page with hero section
- ✅ Dashboard with real-time Firebase data integration
- ✅ Contract detail page (6 tabs: Overview, Scope, Milestones, Payments, Changes, Risks)
- ✅ Planning page with sprint timeline and plan versions
- ✅ Payments page (3 tabs: Upcoming/Overdue/Paid)
- ✅ Changes page with real-time change request management
- ✅ Communications page for email tracking
- ✅ Settings page for workspace configuration
- ✅ Login/Register pages

**API Routes**
- ✅ `/api/contracts` - CRUD operations with Firebase integration
- ✅ `/api/changes/analyze` - AI analysis with Firestore storage
- ✅ `/api/changes/generate-email` - Email draft generation
- ✅ `/api/changes/generate-pdf` - PDF generation with jsPDF
- ✅ `/api/communications/send` - Email sending with Resend
- ✅ `/api/payments/reminders` - Reminder system
- ✅ `/api/payments/webhook` - Payment webhook handling

**Services & Data Layer**
- ✅ Firebase client/admin SDK with proper configuration
- ✅ Complete Firestore schema with all data models
- ✅ Real-time listeners for contracts, change requests, communications
- ✅ Email service (Resend integration)
- ✅ PDF generator (jsPDF)
- ✅ Authentication context with proper state management
- ✅ Firestore service layer with CRUD operations

**Real-time Features**
- ✅ Dashboard uses real Firebase data with live updates
- ✅ Changes page integrates with real change request data
- ✅ Communications tracking with real email data
- ✅ Contract management with real-time status updates

### ❌ Critical Missing Features (15% Remaining)

**P0 - Critical for Demo (8 hours)**

1. **PDF Upload & AI Integration (4h)**
   - [ ] Complete contract upload to Firebase Storage
   - [ ] AI team Cloud Function coordination for analysis
   - [ ] Real-time analysis status tracking
   - [ ] Contract analysis results integration

2. **Payment System Integration (2h)**
   - [ ] Real Stripe/iyzico webhook validation
   - [ ] Payment status updates in Firestore
   - [ ] Overdue payment detection logic

3. **Error Handling & UX Polish (2h)**
   - [ ] Global error boundary implementation
   - [ ] Standardized loading states
   - [ ] Toast notifications for user feedback
   - [ ] Form validation improvements

**P1 - Improvements (4 hours)**

4. **Email Templates & Tracking (2h)**
   - [ ] Store email templates in Firestore
   - [ ] Email tracking and status updates
   - [ ] Inbound email webhook integration

5. **UI Polish & Mobile (2h)**
   - [ ] Mobile optimization and responsive design
   - [ ] Loading animations and micro-interactions
   - [ ] Advanced error handling

**P2 - Nice-to-Have (4 hours)**

6. **Advanced Features (4h)**
   - [ ] Audit logs system
   - [ ] Plan versioning diff view
   - [ ] Evidence upload system
   - [ ] GitHub integration
   - [ ] Multi-currency support

## Development Roadmap

### Phase 1: Demo Readiness (8 hours) - CURRENT PRIORITY
Complete PDF upload, AI integration, and payment system for demo.

### Phase 2: Polish & Features (4 hours)
Improve user experience and add advanced features.

### Phase 3: Extensions (4 hours)
Add integrations and advanced capabilities.

## Next Steps

1. **Immediate (Next 4 hours) - CRITICAL**
   - Complete PDF upload to Firebase Storage
   - Integrate AI team's contract analysis
   - Implement real-time analysis status tracking

2. **Short-term (Next 4 hours)**
   - Complete payment system integration
   - Add error handling and UX polish
   - Test end-to-end demo scenarios

3. **Medium-term (Next 4 hours)**
   - Email template system
   - Mobile optimization
   - Advanced features

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