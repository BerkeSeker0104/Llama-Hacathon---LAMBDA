'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ContractService, ChangeRequestService, CompanyService, TeamService, PersonService } from '@/lib/firestore-service';
import { Contract, ChangeRequest, Company, Team, Person } from '@/lib/firestore-schema';
import Sidebar from '@/components/Sidebar';
import PageHeader from '@/components/PageHeader';
import StatCard from '@/components/StatCard';
import Loading from '@/components/Loading';
import { useToast } from '@/components/Toast';
import { 
  Building2, 
  Users, 
  AlertTriangle, 
  TrendingUp,
  Calendar,
  FileText,
  RefreshCw
} from 'lucide-react';

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const { addToast } = useToast();
  
  // State for real-time data
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Set up real-time listeners
  useEffect(() => {
    if (!user) return;

    setDataLoading(true);
    
    // Subscribe to contracts
    const unsubscribeContracts = ContractService.subscribeToContracts(
      user.uid, 
      (contractsData) => {
        setContracts(contractsData);
        setDataLoading(false);
      }
    );

    // Subscribe to change requests (get from all contracts)
    const unsubscribeChangeRequests = ContractService.subscribeToContracts(
      user.uid,
      async (contractsData) => {
        const allChangeRequests: ChangeRequest[] = [];
        for (const contract of contractsData) {
          const contractChanges = await ChangeRequestService.getChangeRequestsByContract(contract.id);
          allChangeRequests.push(...contractChanges);
        }
        setChangeRequests(allChangeRequests);
      }
    );

    // B2B: Load company data if user has companyId
    if (user.companyId) {
      // Load company data
      CompanyService.getCompany(user.companyId).then((companyData) => {
        setCompany(companyData);
      });

      // Load teams
      TeamService.getTeamsByCompany(user.companyId).then((teamsData) => {
        setTeams(teamsData);
      });

      // Load people
      PersonService.getPeopleByCompany(user.companyId).then((peopleData) => {
        setPeople(peopleData);
      });
    }

    return () => {
      unsubscribeContracts();
      unsubscribeChangeRequests();
    };
  }, [user]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || dataLoading) {
    return <Loading />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black">
      <Sidebar companyName={company?.name} />
      
      <div className="lg:pl-64">
        <PageHeader
          title="Dashboard"
          description="AI-powered project management overview"
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' }
          ]}
          actions={
            <Button 
              onClick={() => {
                addToast({
                  type: 'success',
                  message: 'Project replanning initiated'
                });
              }}
              className="bg-[#00ff88] text-black hover:bg-[#00ff88]/80 hover:neon-glow"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Replan Projects
            </Button>
          }
        />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Active Contracts"
              value={contracts.length}
              description="Currently managed contracts"
              icon={FileText}
              trend={{
                value: 12,
                label: "vs last month",
                isPositive: true
              }}
            />
            
            <StatCard
              title="Teams"
              value={teams.length}
              description="Active development teams"
              icon={Users}
            />
            
            <StatCard
              title="Team Members"
              value={people.length}
              description="Total team members"
              icon={Building2}
            />
            
            <StatCard
              title="Critical Ambiguities"
              value={contracts.reduce((acc, contract) => 
                acc + (contract.analysis?.ambiguities?.filter(a => a.severity === 'critical').length || 0), 0
              )}
              description="Require immediate attention"
              icon={AlertTriangle}
              trend={{
                value: -8,
                label: "vs last week",
                isPositive: true
              }}
            />
          </div>

          {/* Company Info */}
          {company && (
            <div className="glass-card p-6 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">{company.name}</h3>
                  <p className="text-gray-300">{company.industry}</p>
                  <p className="text-sm text-gray-400">License: {company.licenseType}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">License Expires</p>
                  <p className="text-[#00ff88] font-medium">
                    {company.licenseExpiry ? new Date(company.licenseExpiry).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Contracts */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Contracts</h3>
              <div className="space-y-3">
                {contracts.slice(0, 3).map((contract) => (
                  <div key={contract.id} className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                    <div>
                      <p className="font-medium text-white">{contract.title}</p>
                      <p className="text-sm text-gray-400">{contract.clientName}</p>
                    </div>
                    <span className="text-xs bg-[#00ff88]/20 text-[#00ff88] px-2 py-1 rounded">
                      {contract.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Team Capacity */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Team Capacity</h3>
              <div className="space-y-3">
                {teams.slice(0, 3).map((team) => {
                  const teamMembers = people.filter(p => p.teamId === team.id);
                  const avgWorkload = teamMembers.length > 0 
                    ? teamMembers.reduce((acc, member) => acc + member.currentWorkload, 0) / teamMembers.length
                    : 0;
                  
                  return (
                    <div key={team.id} className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                      <div>
                        <p className="font-medium text-white">{team.name}</p>
                        <p className="text-sm text-gray-400">{teamMembers.length} members</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-[#00ff88]">{avgWorkload.toFixed(1)}%</p>
                        <p className="text-xs text-gray-400">avg workload</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
