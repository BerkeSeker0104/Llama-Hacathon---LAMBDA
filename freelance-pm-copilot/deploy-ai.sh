#!/bin/bash

# AI Integration Deployment Script
echo "🚀 Deploying AI Integration..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Please install it first:"
    echo "npm install -g firebase-tools"
    exit 1
fi

# Check if logged in to Firebase
if ! firebase projects:list &> /dev/null; then
    echo "❌ Not logged in to Firebase. Please run:"
    echo "firebase login"
    exit 1
fi

echo "📦 Setting up Cloud Functions environment variables..."

# Set environment variables for Cloud Functions
firebase functions:config:set groq.api_key="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"
firebase functions:config:set llama.api_key="llx-SHymI9q0Tr65lYHubePG7sH2BwFo3myVLst8NuJThdP7x1LS"

echo "🔧 Deploying Cloud Functions..."

# Deploy Cloud Functions
firebase deploy --only functions

if [ $? -eq 0 ]; then
    echo "✅ Cloud Functions deployed successfully!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Update your .env.local with the Cloud Functions URLs"
    echo "2. Test the integration by uploading a contract PDF"
    echo "3. Check the Sprint Plan tab in contract details"
    echo ""
    echo "🔗 Cloud Functions URLs:"
    echo "- Analyze Contract: https://us-central1-$(firebase use --project | grep -o '[^/]*$').cloudfunctions.net/analyzeContract"
    echo "- Generate Sprint Plan: https://us-central1-$(firebase use --project | grep -o '[^/]*$').cloudfunctions.net/generateSprintPlan"
else
    echo "❌ Deployment failed. Check the logs above."
    exit 1
fi
