# Firebase Cloud Functions - AI Integration

This directory contains the Python Cloud Functions for AI-powered contract analysis and sprint planning.

## Setup

1. **Install Python dependencies:**
   ```bash
   cd functions
   pip install -r requirements.txt
   ```

2. **Set environment variables:**
   ```bash
   # Set these in Firebase Functions environment
   firebase functions:config:set groq.api_key="your_groq_api_key"
   firebase functions:config:set llama.api_key="your_llama_api_key"
   ```

3. **Deploy functions:**
   ```bash
   firebase deploy --only functions
   ```

## Functions

### analyzeContract
- **Trigger:** HTTP POST
- **Input:** `{contractId, pdfUrl}`
- **Process:** Downloads PDF → LlamaParse → Groq Analysis → Firestore
- **Output:** Analysis results saved to Firestore

### generateSprintPlan
- **Trigger:** HTTP POST
- **Input:** `{contractId, sprintDurationWeeks}`
- **Process:** Reads contract analysis → Groq Sprint Planning → Firestore
- **Output:** Sprint plan saved to Firestore

## Environment Variables

Set these in Firebase Functions:

```bash
firebase functions:config:set groq.api_key="gsk_your_key_here"
firebase functions:config:set llama.api_key="llx_your_key_here"
```

## Local Development

1. Install Firebase CLI
2. Login: `firebase login`
3. Initialize: `firebase init functions`
4. Set config: `firebase functions:config:set ...`
5. Deploy: `firebase deploy --only functions`

## Testing

Test functions locally:
```bash
firebase functions:shell
```

Then call:
```javascript
analyzeContract({contractId: 'test', pdfUrl: 'https://...'})
generateSprintPlan({contractId: 'test', sprintDurationWeeks: 2})
```
