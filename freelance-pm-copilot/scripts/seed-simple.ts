#!/usr/bin/env tsx

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBvQvQvQvQvQvQvQvQvQvQvQvQvQvQvQvQ",
  authDomain: "lambda-926aa.firebaseapp.com",
  projectId: "lambda-926aa",
  storageBucket: "lambda-926aa.appspot.com",
  messagingSenderId: "1061268013673",
  appId: "1:1061268013673:web:abcdef123456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seedSimpleData() {
  console.log('🌱 Starting simple demo data seeding...');
  
  try {
    // 1. Create company
    console.log('📊 Creating company...');
    const companyRef = await addDoc(collection(db, 'companies'), {
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
    const skillRef = await addDoc(collection(db, 'skills'), {
      key: "React",
      category: "frontend"
    });
    console.log(`✅ Skill created with ID: ${skillRef.id}`);

    console.log('🎉 Simple demo data seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding data:', error);
  }
}

seedSimpleData();
