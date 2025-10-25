// Mock data for B2B demo
import { Company, Team, Person, Skill } from './firestore-schema';

export const MOCK_COMPANY: Omit<Company, 'id' | 'createdAt' | 'updatedAt'> = {
  name: "TechVenture Yazılım A.Ş.",
  industry: "Software Development",
  licenseType: "premium",
  licenseExpiry: new Date("2025-12-31")
};

export const MOCK_TEAMS: Omit<Team, 'id' | 'companyId' | 'createdAt'>[] = [
  {
    name: "Mobile Team",
    managerId: "Ahmet Yılmaz", // Will be set after person creation
    description: "iOS ve Android uygulama geliştirme ekibi"
  },
  {
    name: "Backend Team",
    managerId: "Ayşe Demir", // Will be set after person creation
    description: "API ve veritabanı geliştirme ekibi"
  },
  {
    name: "Frontend Team",
    managerId: "Mehmet Kaya", // Will be set after person creation
    description: "Web arayüzü ve kullanıcı deneyimi ekibi"
  }
];

export const MOCK_PEOPLE: Omit<Person, 'id' | 'companyId' | 'teamId' | 'createdAt'>[] = [
  // Mobile Team
  { 
    name: "Ahmet Yılmaz", 
    email: "ahmet@techventure.com",
    role: "manager", 
    hoursPerWeek: 40,
    currentWorkload: 0
  },
  { 
    name: "Zeynep Şahin", 
    email: "zeynep@techventure.com",
    role: "developer", 
    hoursPerWeek: 40,
    currentWorkload: 0
  },
  { 
    name: "Can Öztürk", 
    email: "can@techventure.com",
    role: "developer", 
    hoursPerWeek: 35,
    currentWorkload: 0
  },
  
  // Backend Team
  { 
    name: "Ayşe Demir", 
    email: "ayse@techventure.com",
    role: "manager", 
    hoursPerWeek: 40,
    currentWorkload: 0
  },
  { 
    name: "Burak Aydın", 
    email: "burak@techventure.com",
    role: "developer", 
    hoursPerWeek: 40,
    currentWorkload: 0
  },
  { 
    name: "Elif Yıldız", 
    email: "elif@techventure.com",
    role: "developer", 
    hoursPerWeek: 40,
    currentWorkload: 0
  },
  
  // Frontend Team
  { 
    name: "Mehmet Kaya", 
    email: "mehmet@techventure.com",
    role: "manager", 
    hoursPerWeek: 40,
    currentWorkload: 0
  },
  { 
    name: "Selin Arslan", 
    email: "selin@techventure.com",
    role: "developer", 
    hoursPerWeek: 35,
    currentWorkload: 0
  },
  { 
    name: "Emre Çelik", 
    email: "emre@techventure.com",
    role: "designer", 
    hoursPerWeek: 40,
    currentWorkload: 0
  }
];

export const MOCK_SKILLS: Omit<Skill, 'id'>[] = [
  { key: "Flutter", category: "mobile" },
  { key: "iOS", category: "mobile" },
  { key: "Android", category: "mobile" },
  { key: "Swift", category: "mobile" },
  { key: "Dart", category: "mobile" },
  { key: "React", category: "frontend" },
  { key: "Vue.js", category: "frontend" },
  { key: "Next.js", category: "frontend" },
  { key: "TypeScript", category: "frontend" },
  { key: "Node.js", category: "backend" },
  { key: "Python", category: "backend" },
  { key: "Django", category: "backend" },
  { key: "PostgreSQL", category: "backend" },
  { key: "MongoDB", category: "backend" },
  { key: "Redis", category: "backend" },
  { key: "AWS", category: "devops" },
  { key: "UI/UX", category: "design" },
  { key: "Figma", category: "design" },
  { key: "CSS", category: "frontend" }
];

// Person-Skill mappings with levels
export const MOCK_PERSON_SKILLS = [
  // Ahmet Yılmaz (Mobile Manager)
  { personName: "Ahmet Yılmaz", skills: ["Flutter", "iOS", "Android"], levels: [5, 4, 4] },
  // Zeynep Şahin (Mobile Developer)
  { personName: "Zeynep Şahin", skills: ["Flutter", "Dart"], levels: [4, 4] },
  // Can Öztürk (Mobile Developer)
  { personName: "Can Öztürk", skills: ["iOS", "Swift"], levels: [5, 5] },
  
  // Ayşe Demir (Backend Manager)
  { personName: "Ayşe Demir", skills: ["Node.js", "PostgreSQL", "AWS"], levels: [5, 5, 4] },
  // Burak Aydın (Backend Developer)
  { personName: "Burak Aydın", skills: ["Node.js", "MongoDB", "Redis"], levels: [4, 4, 3] },
  // Elif Yıldız (Backend Developer)
  { personName: "Elif Yıldız", skills: ["Python", "Django", "PostgreSQL"], levels: [5, 5, 4] },
  
  // Mehmet Kaya (Frontend Manager)
  { personName: "Mehmet Kaya", skills: ["React", "TypeScript", "Next.js"], levels: [5, 5, 5] },
  // Selin Arslan (Frontend Developer)
  { personName: "Selin Arslan", skills: ["React", "Vue.js", "CSS"], levels: [4, 3, 5] },
  // Emre Çelik (Designer)
  { personName: "Emre Çelik", skills: ["UI/UX", "Figma", "CSS"], levels: [5, 5, 4] }
];

// Helper function to get person skills by name
export const getPersonSkillsByName = (personName: string) => {
  return MOCK_PERSON_SKILLS.find(p => p.personName === personName);
};

// Helper function to get team by manager name
export const getTeamByManager = (managerName: string) => {
  const managerMap: { [key: string]: string } = {
    "Ahmet Yılmaz": "Mobile Team",
    "Ayşe Demir": "Backend Team", 
    "Mehmet Kaya": "Frontend Team"
  };
  return managerMap[managerName];
};
