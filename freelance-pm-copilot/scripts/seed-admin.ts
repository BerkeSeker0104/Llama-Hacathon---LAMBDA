#!/usr/bin/env tsx

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

// Firebase Admin SDK config
const serviceAccount = {
  projectId: "lambda-926aa",
  // Service account key gerekli - şimdilik basit config
};

// Initialize Firebase Admin
if (getApps().length === 0) {
  initializeApp({
    projectId: "lambda-926aa"
  });
}

const db = getFirestore();

async function seedAdminData() {
  console.log('🌱 Starting admin demo data seeding...');
  
  try {
    // 1. Create company
    console.log('📊 Creating company...');
    const companyRef = await db.collection('companies').add({
      name: "TechVenture Yazılım A.Ş.",
      industry: "Software Development",
      licenseType: "premium",
      licenseExpiry: Timestamp.fromDate(new Date('2025-12-31')),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    console.log(`✅ Company created with ID: ${companyRef.id}`);

    // 2. Create a simple skill
    console.log('🛠️ Creating skills...');
    const skillRef = await db.collection('skills').add({
      key: "React",
      category: "frontend"
    });
    console.log(`✅ Skill created with ID: ${skillRef.id}`);

    console.log('🎉 Admin demo data seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding data:', error);
  }
}

seedAdminData();
