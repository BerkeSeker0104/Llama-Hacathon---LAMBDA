// Firestore Schema and Data Models
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  website?: string;
  timezone: string;
  currency: string;
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
  timeline: {
    optimistic: string;
    realistic: string;
    pessimistic: string;
  };
  summary: string;
  analyzedAt: Date;
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
}

// Firestore Collection Names
export const COLLECTIONS = {
  USERS: 'users',
  CONTRACTS: 'contracts',
  CHANGE_REQUESTS: 'changeRequests',
  COMMUNICATIONS: 'communications',
  PLANS: 'plans',
  PAYMENTS: 'payments'
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
