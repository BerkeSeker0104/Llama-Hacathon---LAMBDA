// Firestore Schema and Data Models

// B2B Multi-tenancy interfaces
export interface Company {
  id: string;
  name: string;
  industry: string;
  licenseType: 'trial' | 'basic' | 'premium' | 'enterprise';
  licenseExpiry: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Team {
  id: string;
  companyId: string;
  name: string; // "Mobile Team", "Backend Team", "Frontend Team"
  managerId: string; // User ID of team manager
  description?: string;
  createdAt: Date;
}

export interface Person {
  id: string;
  companyId: string;
  teamId: string;
  name: string;
  email: string;
  role: 'manager' | 'developer' | 'designer' | 'qa' | 'devops';
  hoursPerWeek: number; // Haftalık müsait saat
  currentWorkload: number; // Şu anki yük (0-100)
  createdAt: Date;
}

export interface Skill {
  id: string;
  key: string; // "Flutter", "React", "Node.js", "PostgreSQL"
  category: 'frontend' | 'backend' | 'mobile' | 'devops' | 'design';
}

export interface PersonSkill {
  id: string;
  personId: string;
  skillId: string;
  skillKey: string; // Denormalized for quick access
  level: 1 | 2 | 3 | 4 | 5; // 1=Beginner, 5=Expert
}

export interface Project {
  id: string;
  contractId: string;
  companyId: string;
  name: string;
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Assignment {
  id: string;
  taskId: string;
  personId: string;
  personName: string; // Denormalized
  plannedHours: number;
  actualHours?: number;
  sprintId: string;
  status: 'assigned' | 'in-progress' | 'completed';
  assignedAt: Date;
}

export interface PlanVersion {
  id: string;
  projectId: string;
  contractId: string;
  version: number;
  changeReason?: string;
  diffSummary?: string; // "3 tasks added, 2 reassigned"
  createdAt: Date;
  createdBy: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  website?: string;
  timezone: string;
  currency: string;
  companyId?: string; // B2B support
  role?: 'admin' | 'manager' | 'employee'; // B2B roles
  teamId?: string; // Team assignment
  createdAt: Date;
  updatedAt: Date;
}

export interface Contract {
  id: string;
  userId: string;
  title: string;
  clientName: string;
  clientEmail: string;
  status: 'analyzing' | 'analyzed' | 'active' | 'completed' | 'cancelled' | 'error';
  pdfUrl?: string;
  pdfPath?: string;
  analysis?: ContractAnalysis;
  createdAt: Date;
  updatedAt: Date;
  uploadedAt?: Date;
}

export interface ContractAnalysis {
  deliverables: Deliverable[];
  milestones: Milestone[];
  paymentPlan: PaymentPlan[];
  risks: Risk[];
  ambiguities?: Ambiguity[]; // B2B enhancement
  timeline: {
    optimistic: string;
    realistic: string;
    pessimistic: string;
  };
  summary: string;
  analyzedAt: Date;
}

export interface Ambiguity {
  id: string;
  clause: string; // Belirsiz maddenin tam metni
  issue: string; // Neyin belirsiz olduğu
  severity: 'low' | 'medium' | 'high' | 'critical';
  suggestedRedline?: string; // Önerilen düzeltilmiş metin
  clarificationQuestions?: string[]; // Netleştirme soruları
}

export interface Deliverable {
  id: string;
  title: string;
  description: string;
  acceptanceCriteria: string;
  status: 'pending' | 'in-progress' | 'completed';
  dueDate?: string;
  completedAt?: Date;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed';
  completedAt?: Date;
}

export interface PaymentPlan {
  id: string;
  milestoneId: string;
  amount: number;
  currency: string;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
  paidAt?: Date;
  paymentMethod?: string;
  transactionId?: string;
}

export interface Risk {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  probability: number; // 0-100
  impact: number; // 0-100
  mitigation: string;
  status: 'open' | 'mitigated' | 'closed';
}

export interface ChangeRequest {
  id: string;
  contractId: string;
  userId: string;
  requestText: string;
  type: 'scope-change' | 'timeline-change' | 'budget-change' | 'feature-request';
  status: 'pending' | 'analyzed' | 'approved' | 'rejected' | 'implemented';
  analysis?: ChangeAnalysis;
  selectedOption?: number;
  createdAt: Date;
  updatedAt: Date;
  clientEmail?: string;
  evidence?: string[];
}

export interface ChangeAnalysis {
  type: string;
  impact: {
    time: string;
    cost: string;
    scope: string;
  };
  options: ChangeOption[];
  analyzedAt: Date;
}

export interface ChangeOption {
  title: string;
  description: string;
  timeline: string;
  cost: string;
}

export interface Communication {
  id: string;
  userId: string;
  contractId?: string;
  changeRequestId?: string;
  type: 'payment_reminder' | 'change_order' | 'contract_share' | 'general';
  to: string;
  subject: string;
  body: string;
  attachments: string[];
  sentAt: Date;
  status: 'sent' | 'delivered' | 'opened' | 'replied' | 'failed';
  emailId?: string;
  inboundReplyToken?: string;
}

export interface Plan {
  id: string;
  contractId: string;
  userId: string;
  version: number;
  title: string;
  sprints: Sprint[];
  timeline: {
    optimistic: string;
    realistic: string;
    pessimistic: string;
  };
  status: 'draft' | 'active' | 'completed' | 'superseded';
  createdAt: Date;
  updatedAt: Date;
}

export interface Sprint {
  id: string;
  name: string;
  sprint_num: number;
  sprint_hedefi: string;
  startDate: string;
  endDate: string;
  tasks: Task[];
  status: 'planned' | 'in-progress' | 'completed';
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  assignee: string;
  estimatedHours?: number;
  actualHours?: number;
  dueDate?: string;
  completedAt?: Date;
  // AI-generated task properties
  gorev_aciklamasi?: string; // Task description from AI
  // B2B enhancements
  epicId?: string; // WBS epic reference
  requiredSkills?: string[]; // Required skills for this task
  acceptanceCriteria?: string[]; // Acceptance criteria
  dependsOn?: string[]; // Task dependencies
  projectId?: string; // Project reference
}

// Firestore Collection Names
export const COLLECTIONS = {
  USERS: 'users',
  CONTRACTS: 'contracts',
  CHANGE_REQUESTS: 'changeRequests',
  COMMUNICATIONS: 'communications',
  PLANS: 'plans',
  PAYMENTS: 'payments',
  // B2B collections
  COMPANIES: 'companies',
  TEAMS: 'teams',
  PEOPLE: 'people',
  SKILLS: 'skills',
  PERSON_SKILLS: 'personSkills',
  PROJECTS: 'projects',
  ASSIGNMENTS: 'assignments',
  PLAN_VERSIONS: 'planVersions'
} as const;

// Helper functions for data validation
export const validateContract = (contract: Partial<Contract>): contract is Contract => {
  return !!(
    contract.id &&
    contract.userId &&
    contract.title &&
    contract.clientName &&
    contract.clientEmail &&
    contract.status
  );
};

export const validateChangeRequest = (changeRequest: Partial<ChangeRequest>): changeRequest is ChangeRequest => {
  return !!(
    changeRequest.id &&
    changeRequest.contractId &&
    changeRequest.userId &&
    changeRequest.requestText &&
    changeRequest.type &&
    changeRequest.status
  );
};

export const validateCommunication = (communication: Partial<Communication>): communication is Communication => {
  return !!(
    communication.id &&
    communication.userId &&
    communication.to &&
    communication.subject &&
    communication.body &&
    communication.type
  );
};
