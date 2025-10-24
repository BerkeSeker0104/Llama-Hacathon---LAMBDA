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
