#!/usr/bin/env tsx

import fs from 'node:fs';
import path from 'node:path';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import {
  MOCK_COMPANY,
  MOCK_TEAMS,
  MOCK_PEOPLE,
  MOCK_SKILLS,
  MOCK_PERSON_SKILLS,
  getTeamByManager
} from '../src/lib/seed-data';

// Load environment variables from .env and .env.local (local takes precedence)
const envFiles: Array<{ filename: string; override: boolean }> = [
  { filename: '.env', override: false },
  { filename: '.env.local', override: true },
];

function loadEnvFile(filename: string, override: boolean) {
  const envPath = path.resolve(process.cwd(), filename);
  if (!fs.existsSync(envPath)) {
    return;
  }

  const fileContents = fs.readFileSync(envPath, 'utf8');
  for (const rawLine of fileContents.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) {
      continue;
    }

    const equalsIndex = line.indexOf('=');
    if (equalsIndex === -1) {
      continue;
    }

    const key = line.slice(0, equalsIndex).trim();
    let value = line.slice(equalsIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (override || !(key in process.env)) {
      process.env[key] = value;
    }
  }
}

for (const { filename, override } of envFiles) {
  loadEnvFile(filename, override);
}

const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID'
];

const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing Firebase environment variables:', missingEnvVars.join(', '));
  console.error('ℹ️  Please ensure they are set in your .env or .env.local file before running the seed script.');
  process.exit(1);
}

// Firebase config - client-side config for demo
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seedDemoData() {
  console.log('🌱 Starting demo data seeding...');
  
  try {
    // 1. Create company
    console.log('📊 Creating company...');
    const companyRef = await addDoc(collection(db, 'companies'), {
      ...MOCK_COMPANY
    });
    const companyId = companyRef.id;
    console.log(`✅ Company created with ID: ${companyId}`);

    // 2. Create skills
    console.log('🛠️ Creating skills...');
    const skillIds = new Map<string, string>();
    for (const skill of MOCK_SKILLS) {
      const skillRef = await addDoc(collection(db, 'skills'), skill);
      skillIds.set(skill.key, skillRef.id);
    }
    console.log(`✅ ${MOCK_SKILLS.length} skills created`);

    // 3. Create people first (to get their IDs for team managers)
    console.log('👥 Creating people...');
    const personIds = new Map<string, string>();
    const teamIds = new Map<string, string>();
    
    for (const person of MOCK_PEOPLE) {
      const personRef = await addDoc(collection(db, 'people'), {
        ...person,
        companyId,
        teamId: '' // Will be set after teams are created
      });
      personIds.set(person.name, personRef.id);
    }
    console.log(`✅ ${MOCK_PEOPLE.length} people created`);

    // 4. Create teams with manager IDs
    console.log('🏢 Creating teams...');
    for (const team of MOCK_TEAMS) {
      const managerName = team.managerId; // This is actually the manager name in our mock data
      const managerId = personIds.get(managerName);
      if (!managerId) {
        throw new Error(`Manager not found: ${managerName}`);
      }

      const teamRef = await addDoc(collection(db, 'teams'), {
        ...team,
        companyId,
        managerId
      });
      teamIds.set(team.name, teamRef.id);
    }
    console.log(`✅ ${MOCK_TEAMS.length} teams created`);

    // 5. Update people with team IDs
    console.log('🔗 Assigning people to teams...');
    for (const person of MOCK_PEOPLE) {
      const teamName = getTeamByManager(person.name);
      if (teamName) {
        // This person is a manager, assign to their team
        const teamId = teamIds.get(teamName);
        if (teamId) {
          const personId = personIds.get(person.name);
          if (personId) {
            // Update person with team ID
            const personRef = doc(db, 'people', personId);
            await updateDoc(personRef, { teamId });
          }
        }
      } else {
        // This person is a developer, assign to appropriate team based on role
        let teamName = '';
        if (person.role === 'developer' && person.name.includes('Zeynep') || person.name.includes('Can')) {
          teamName = 'Mobile Team';
        } else if (person.role === 'developer' && person.name.includes('Burak') || person.name.includes('Elif')) {
          teamName = 'Backend Team';
        } else if (person.role === 'developer' && person.name.includes('Selin') || person.role === 'designer') {
          teamName = 'Frontend Team';
        }
        
        if (teamName) {
          const teamId = teamIds.get(teamName);
          if (teamId) {
            const personId = personIds.get(person.name);
            if (personId) {
              const personRef = doc(db, 'people', personId);
              await updateDoc(personRef, { teamId });
            }
          }
        }
      }
    }
    console.log('✅ People assigned to teams');

    // 6. Create person skills
    console.log('🎯 Creating person skills...');
    for (const personSkill of MOCK_PERSON_SKILLS) {
      const personId = personIds.get(personSkill.personName);
      if (!personId) {
        console.warn(`Person not found: ${personSkill.personName}`);
        continue;
      }

      for (let i = 0; i < personSkill.skills.length; i++) {
        const skillKey = personSkill.skills[i];
        const skillId = skillIds.get(skillKey);
        if (!skillId) {
          console.warn(`Skill not found: ${skillKey}`);
          continue;
        }

        await addDoc(collection(db, 'personSkills'), {
          personId,
          skillId,
          skillKey,
          level: personSkill.levels[i]
        });
      }
    }
    console.log('✅ Person skills created');

    console.log('🎉 Demo data seeded successfully!');
    console.log(`📊 Company: ${MOCK_COMPANY.name}`);
    console.log(`🏢 Teams: ${MOCK_TEAMS.length}`);
    console.log(`👥 People: ${MOCK_PEOPLE.length}`);
    console.log(`🛠️ Skills: ${MOCK_SKILLS.length}`);
    console.log(`🎯 Person-Skill mappings: ${MOCK_PERSON_SKILLS.length}`);

  } catch (error) {
    console.error('❌ Error seeding demo data:', error);
    process.exit(1);
  }
}

// Run the seed function
if (require.main === module) {
  seedDemoData()
    .then(() => {
      console.log('✅ Seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

export { seedDemoData };
