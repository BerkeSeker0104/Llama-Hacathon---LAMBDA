'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase-client';
import { CompanyService } from '@/lib/firestore-service';
import { Company } from '@/lib/firestore-schema';

interface UserProfile extends User {
  companyId?: string;
  role?: 'admin' | 'manager' | 'employee';
  teamId?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  company: Company | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (role: 'admin' | 'manager' | 'employee') => boolean;
  isAdmin: () => boolean;
  isManager: () => boolean;
  isEmployee: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AuthContext: Setting up auth state listener');
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('AuthContext: Auth state changed, user:', firebaseUser ? firebaseUser.email : 'null');
      
      if (firebaseUser) {
        // Get custom claims for role and company info
        const tokenResult = await firebaseUser.getIdTokenResult();
        const customClaims = tokenResult.claims;
        
        const userProfile: UserProfile = {
          ...firebaseUser,
          companyId: customClaims.companyId as string,
          role: customClaims.role as 'admin' | 'manager' | 'employee',
          teamId: customClaims.teamId as string
        };
        
        setUser(userProfile);
        
        // Load company data if user has companyId
        if (userProfile.companyId) {
          try {
            const companyData = await CompanyService.getCompany(userProfile.companyId);
            setCompany(companyData);
          } catch (error) {
            console.error('Error loading company:', error);
            setCompany(null);
          }
        } else {
          setCompany(null);
        }
      } else {
        setUser(null);
        setCompany(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const hasRole = (role: 'admin' | 'manager' | 'employee'): boolean => {
    if (!user) return false;
    return user.role === role;
  };

  const isAdmin = (): boolean => hasRole('admin');
  const isManager = (): boolean => hasRole('manager');
  const isEmployee = (): boolean => hasRole('employee');

  const value = {
    user,
    company,
    loading,
    signIn,
    signUp,
    logout,
    hasRole,
    isAdmin,
    isManager,
    isEmployee,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
