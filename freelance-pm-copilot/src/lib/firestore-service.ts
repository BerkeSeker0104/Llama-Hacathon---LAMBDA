import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  Unsubscribe,
  Timestamp,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase-client';
import { 
  Contract, 
  ChangeRequest, 
  Communication, 
  Plan, 
  User,
  Company,
  Team,
  Person,
  Skill,
  PersonSkill,
  Project,
  Assignment,
  PlanVersion,
  COLLECTIONS,
  validateContract,
  validateChangeRequest,
  validateCommunication
} from './firestore-schema';

// Contract Service
export class ContractService {
  static async createContract(contract: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const contractRef = doc(collection(db, COLLECTIONS.CONTRACTS));
    const contractData = {
      ...contract,
      id: contractRef.id,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    await setDoc(contractRef, contractData);
    return contractRef.id;
  }

  static async getContract(contractId: string): Promise<Contract | null> {
    const contractRef = doc(db, COLLECTIONS.CONTRACTS, contractId);
    const contractSnap = await getDoc(contractRef);
    
    if (!contractSnap.exists()) {
      return null;
    }
    
    const data = contractSnap.data();
    return {
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      uploadedAt: data.uploadedAt?.toDate()
    } as Contract;
  }

  static async getContractsByUser(userId: string): Promise<Contract[]> {
    const contractsRef = collection(db, COLLECTIONS.CONTRACTS);
    const q = query(
      contractsRef, 
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        uploadedAt: data.uploadedAt?.toDate()
      } as Contract;
    });
  }

  static async updateContract(contractId: string, updates: Partial<Contract>): Promise<void> {
    const contractRef = doc(db, COLLECTIONS.CONTRACTS, contractId);
    await updateDoc(contractRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  }

  static async updateContractAnalysis(contractId: string, analysis: any): Promise<void> {
    await this.updateContract(contractId, { 
      analysis,
      status: 'analyzed' as const
    });
  }

  // Real-time listener
  static subscribeToContracts(userId: string, callback: (contracts: Contract[]) => void): Unsubscribe {
    const contractsRef = collection(db, COLLECTIONS.CONTRACTS);
    const q = query(
      contractsRef, 
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const contracts = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          uploadedAt: data.uploadedAt?.toDate()
        } as Contract;
      });
      callback(contracts);
    });
  }
}

// Change Request Service
export class ChangeRequestService {
  static async createChangeRequest(changeRequest: Omit<ChangeRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const changeRequestRef = doc(collection(db, COLLECTIONS.CHANGE_REQUESTS));
    const changeRequestData = {
      ...changeRequest,
      id: changeRequestRef.id,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    await setDoc(changeRequestRef, changeRequestData);
    return changeRequestRef.id;
  }

  static async getChangeRequestsByContract(contractId: string): Promise<ChangeRequest[]> {
    const changeRequestsRef = collection(db, COLLECTIONS.CHANGE_REQUESTS);
    const q = query(
      changeRequestsRef, 
      where('contractId', '==', contractId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as ChangeRequest;
    });
  }

  static async updateChangeRequest(changeRequestId: string, updates: Partial<ChangeRequest>): Promise<void> {
    const changeRequestRef = doc(db, COLLECTIONS.CHANGE_REQUESTS, changeRequestId);
    await updateDoc(changeRequestRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  }

  // Real-time listener
  static subscribeToChangeRequests(contractId: string, callback: (changeRequests: ChangeRequest[]) => void): Unsubscribe {
    const changeRequestsRef = collection(db, COLLECTIONS.CHANGE_REQUESTS);
    const q = query(
      changeRequestsRef, 
      where('contractId', '==', contractId),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const changeRequests = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as ChangeRequest;
      });
      callback(changeRequests);
    });
  }
}

// Communication Service
export class CommunicationService {
  static async createCommunication(communication: Omit<Communication, 'id' | 'sentAt'>): Promise<string> {
    const communicationRef = doc(collection(db, COLLECTIONS.COMMUNICATIONS));
    const communicationData = {
      ...communication,
      id: communicationRef.id,
      sentAt: serverTimestamp()
    };
    
    await setDoc(communicationRef, communicationData);
    return communicationRef.id;
  }

  static async getCommunicationsByUser(userId: string): Promise<Communication[]> {
    const communicationsRef = collection(db, COLLECTIONS.COMMUNICATIONS);
    const q = query(
      communicationsRef, 
      where('userId', '==', userId),
      orderBy('sentAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        sentAt: data.sentAt?.toDate() || new Date()
      } as Communication;
    });
  }

  // Real-time listener
  static subscribeToCommunications(userId: string, callback: (communications: Communication[]) => void): Unsubscribe {
    const communicationsRef = collection(db, COLLECTIONS.COMMUNICATIONS);
    const q = query(
      communicationsRef, 
      where('userId', '==', userId),
      orderBy('sentAt', 'desc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const communications = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          sentAt: data.sentAt?.toDate() || new Date()
        } as Communication;
      });
      callback(communications);
    });
  }
}

// Plan Service
export class PlanService {
  static async createPlan(plan: Omit<Plan, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const planRef = doc(collection(db, COLLECTIONS.PLANS));
    const planData = {
      ...plan,
      id: planRef.id,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    await setDoc(planRef, planData);
    return planRef.id;
  }

  static async getPlansByContract(contractId: string): Promise<Plan[]> {
    const plansRef = collection(db, COLLECTIONS.PLANS);
    const q = query(
      plansRef, 
      where('contractId', '==', contractId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as Plan;
    });
  }

  // Real-time listener
  static subscribeToPlans(contractId: string, callback: (plans: Plan[]) => void): Unsubscribe {
    const plansRef = collection(db, COLLECTIONS.PLANS);
    const q = query(
      plansRef, 
      where('contractId', '==', contractId),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const plans = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as Plan;
      });
      callback(plans);
    });
  }
}

// B2B Services

// Company Service
export class CompanyService {
  static async getCompany(companyId: string): Promise<Company | null> {
    const companyRef = doc(db, COLLECTIONS.COMPANIES, companyId);
    const companySnap = await getDoc(companyRef);
    
    if (!companySnap.exists()) {
      return null;
    }
    
    const data = companySnap.data();
    return {
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      licenseExpiry: data.licenseExpiry?.toDate() || new Date()
    } as Company;
  }

  static async updateCompany(companyId: string, data: Partial<Company>): Promise<void> {
    const companyRef = doc(db, COLLECTIONS.COMPANIES, companyId);
    await updateDoc(companyRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  }

  static subscribeToCompany(companyId: string, callback: (company: Company) => void): Unsubscribe {
    const companyRef = doc(db, COLLECTIONS.COMPANIES, companyId);
    
    return onSnapshot(companyRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const company = {
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          licenseExpiry: data.licenseExpiry?.toDate() || new Date()
        } as Company;
        callback(company);
      }
    });
  }
}

// Team Service
export class TeamService {
  static async getTeamsByCompany(companyId: string): Promise<Team[]> {
    const teamsRef = collection(db, COLLECTIONS.TEAMS);
    const q = query(
      teamsRef, 
      where('companyId', '==', companyId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        createdAt: data.createdAt?.toDate() || new Date()
      } as Team;
    });
  }

  static async getTeam(teamId: string): Promise<Team | null> {
    const teamRef = doc(db, COLLECTIONS.TEAMS, teamId);
    const teamSnap = await getDoc(teamRef);
    
    if (!teamSnap.exists()) {
      return null;
    }
    
    const data = teamSnap.data();
    return {
      ...data,
      createdAt: data.createdAt?.toDate() || new Date()
    } as Team;
  }

  static async createTeam(team: Omit<Team, 'id' | 'createdAt'>): Promise<string> {
    const teamRef = doc(collection(db, COLLECTIONS.TEAMS));
    const teamData = {
      ...team,
      id: teamRef.id,
      createdAt: serverTimestamp()
    };
    
    await setDoc(teamRef, teamData);
    return teamRef.id;
  }

  static subscribeToTeams(companyId: string, callback: (teams: Team[]) => void): Unsubscribe {
    const teamsRef = collection(db, COLLECTIONS.TEAMS);
    const q = query(
      teamsRef, 
      where('companyId', '==', companyId),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const teams = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          createdAt: data.createdAt?.toDate() || new Date()
        } as Team;
      });
      callback(teams);
    });
  }
}

// Person Service
export class PersonService {
  static async getPeopleByCompany(companyId: string): Promise<Person[]> {
    const peopleRef = collection(db, COLLECTIONS.PEOPLE);
    const q = query(
      peopleRef, 
      where('companyId', '==', companyId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        createdAt: data.createdAt?.toDate() || new Date()
      } as Person;
    });
  }

  static async getPeopleByTeam(teamId: string): Promise<Person[]> {
    const peopleRef = collection(db, COLLECTIONS.PEOPLE);
    const q = query(
      peopleRef, 
      where('teamId', '==', teamId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        createdAt: data.createdAt?.toDate() || new Date()
      } as Person;
    });
  }

  static async getPerson(personId: string): Promise<Person | null> {
    const personRef = doc(db, COLLECTIONS.PEOPLE, personId);
    const personSnap = await getDoc(personRef);
    
    if (!personSnap.exists()) {
      return null;
    }
    
    const data = personSnap.data();
    return {
      ...data,
      createdAt: data.createdAt?.toDate() || new Date()
    } as Person;
  }

  static async getPersonWithSkills(personId: string): Promise<{ person: Person; skills: PersonSkill[] } | null> {
    const person = await this.getPerson(personId);
    if (!person) return null;

    const skills = await SkillService.getPersonSkills(personId);
    return { person, skills };
  }

  static async updatePersonWorkload(personId: string, workload: number): Promise<void> {
    const personRef = doc(db, COLLECTIONS.PEOPLE, personId);
    await updateDoc(personRef, {
      currentWorkload: workload
    });
  }

  static subscribeToTeamPeople(teamId: string, callback: (people: Person[]) => void): Unsubscribe {
    const peopleRef = collection(db, COLLECTIONS.PEOPLE);
    const q = query(
      peopleRef, 
      where('teamId', '==', teamId),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const people = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          createdAt: data.createdAt?.toDate() || new Date()
        } as Person;
      });
      callback(people);
    });
  }
}

// Skill Service
export class SkillService {
  static async getAllSkills(): Promise<Skill[]> {
    const skillsRef = collection(db, COLLECTIONS.SKILLS);
    const querySnapshot = await getDocs(skillsRef);
    
    return querySnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    })) as Skill[];
  }

  static async getPersonSkills(personId: string): Promise<PersonSkill[]> {
    const personSkillsRef = collection(db, COLLECTIONS.PERSON_SKILLS);
    const q = query(
      personSkillsRef, 
      where('personId', '==', personId)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    })) as PersonSkill[];
  }

  static async addPersonSkill(personId: string, skillId: string, level: number): Promise<string> {
    const skill = await this.getSkill(skillId);
    if (!skill) throw new Error('Skill not found');

    const personSkillRef = doc(collection(db, COLLECTIONS.PERSON_SKILLS));
    const personSkillData = {
      id: personSkillRef.id,
      personId,
      skillId,
      skillKey: skill.key,
      level
    };
    
    await setDoc(personSkillRef, personSkillData);
    return personSkillRef.id;
  }

  static async updatePersonSkillLevel(personSkillId: string, level: number): Promise<void> {
    const personSkillRef = doc(db, COLLECTIONS.PERSON_SKILLS, personSkillId);
    await updateDoc(personSkillRef, { level });
  }

  private static async getSkill(skillId: string): Promise<Skill | null> {
    const skillRef = doc(db, COLLECTIONS.SKILLS, skillId);
    const skillSnap = await getDoc(skillRef);
    
    if (!skillSnap.exists()) {
      return null;
    }
    
    return {
      ...skillSnap.data(),
      id: skillSnap.id
    } as Skill;
  }
}

// Project Service
export class ProjectService {
  static async getProjectsByCompany(companyId: string): Promise<Project[]> {
    const projectsRef = collection(db, COLLECTIONS.PROJECTS);
    const q = query(
      projectsRef, 
      where('companyId', '==', companyId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        startDate: data.startDate?.toDate(),
        endDate: data.endDate?.toDate()
      } as Project;
    });
  }

  static async createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const projectRef = doc(collection(db, COLLECTIONS.PROJECTS));
    const projectData = {
      ...project,
      id: projectRef.id,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    await setDoc(projectRef, projectData);
    return projectRef.id;
  }

  static async updateProjectStatus(projectId: string, status: Project['status']): Promise<void> {
    const projectRef = doc(db, COLLECTIONS.PROJECTS, projectId);
    await updateDoc(projectRef, {
      status,
      updatedAt: serverTimestamp()
    });
  }
}

// Assignment Service
export class AssignmentService {
  static async getAssignmentsByTask(taskId: string): Promise<Assignment[]> {
    const assignmentsRef = collection(db, COLLECTIONS.ASSIGNMENTS);
    const q = query(
      assignmentsRef, 
      where('taskId', '==', taskId)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        assignedAt: data.assignedAt?.toDate() || new Date()
      } as Assignment;
    });
  }

  static async getAssignmentsByPerson(personId: string): Promise<Assignment[]> {
    const assignmentsRef = collection(db, COLLECTIONS.ASSIGNMENTS);
    const q = query(
      assignmentsRef, 
      where('personId', '==', personId)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        assignedAt: data.assignedAt?.toDate() || new Date()
      } as Assignment;
    });
  }

  static async createAssignment(assignment: Omit<Assignment, 'id' | 'assignedAt'>): Promise<string> {
    const assignmentRef = doc(collection(db, COLLECTIONS.ASSIGNMENTS));
    const assignmentData = {
      ...assignment,
      id: assignmentRef.id,
      assignedAt: serverTimestamp()
    };
    
    await setDoc(assignmentRef, assignmentData);
    return assignmentRef.id;
  }

  static async updateAssignmentStatus(assignmentId: string, status: Assignment['status']): Promise<void> {
    const assignmentRef = doc(db, COLLECTIONS.ASSIGNMENTS, assignmentId);
    await updateDoc(assignmentRef, { status });
  }
}
