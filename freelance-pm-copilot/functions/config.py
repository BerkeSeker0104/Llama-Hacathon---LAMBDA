import os

# Configuration for Cloud Functions
# These will be set as environment variables in Firebase Functions

# API Keys (set these in Firebase Functions environment)
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "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")
LLAMA_CLOUD_API_KEY = os.environ.get("LLAMA_CLOUD_API_KEY", "llx-SHymI9q0Tr65lYHubePG7sH2BwFo3myVLst8NuJThdP7x1LS")

# Firebase project configuration
FIREBASE_PROJECT_ID = os.environ.get("FIREBASE_PROJECT_ID")
FIREBASE_REGION = os.environ.get("FIREBASE_REGION", "us-central1")

# Function URLs (will be set after deployment)
ANALYZE_CONTRACT_URL = os.environ.get("ANALYZE_CONTRACT_URL")
GENERATE_SPRINT_PLAN_URL = os.environ.get("GENERATE_SPRINT_PLAN_URL")
