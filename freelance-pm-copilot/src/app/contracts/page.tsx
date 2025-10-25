'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ContractService } from '@/lib/firestore-service';
import { Contract } from '@/lib/firestore-schema';
import Sidebar from '@/components/Sidebar';
import PageHeader from '@/components/PageHeader';
import Loading from '@/components/Loading';
import { useToast } from '@/components/Toast';
import { Plus, FileText, Calendar, Users, AlertTriangle, TrendingUp } from 'lucide-react';

export default function ContractsPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const { addToast } = useToast();

  const [contracts, setContracts] = useState<Contract[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  useEffect(() => {
    if (!user) return;

    const unsubscribe = ContractService.subscribeToContracts(
      user.uid,
      (contractsData) => {
        setContracts(contractsData);
        setDataLoading(false);
      }
    );

    return unsubscribe;
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
      <Sidebar />

      <div className="lg:pl-64">
        <PageHeader
          title="Contracts"
          description="AI-powered contract analysis and management"
          breadcrumbs={[
            { label: 'Contracts', href: '/contracts' }
          ]}
          actions={
            <Button
              onClick={() => router.push('/contracts/new')}
              className="bg-[#00ff88] text-black hover:bg-[#00ff88]/80 hover:neon-glow"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Contract
            </Button>
          }
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="glass-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Total Contracts</p>
                  <p className="text-2xl font-bold text-white">{contracts.length}</p>
                </div>
                <FileText className="h-8 w-8 text-[#00ff88]" />
              </div>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Analyzed</p>
                  <p className="text-2xl font-bold text-white">
                    {contracts.filter(c => c.status === 'analyzed').length}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-[#00ff88]" />
              </div>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Critical Issues</p>
                  <p className="text-2xl font-bold text-white">
                    {contracts.reduce((acc, contract) =>
                      acc + (contract.analysis?.ambiguities?.filter(a => a.severity === 'critical').length || 0), 0
                    )}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-[#00ff88]" />
              </div>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">High Risk</p>
                  <p className="text-2xl font-bold text-white">
                    {contracts.reduce((acc, contract) =>
                      acc + (contract.analysis?.ambiguities?.filter(a => a.severity === 'high').length || 0), 0
                    )}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-400" />
              </div>
            </div>
          </div>

          {/* Contracts List */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">All Contracts</h3>
              <div className="flex space-x-2">
                <Badge variant="outline" className="text-[#00ff88] border-[#00ff88]">
                  All ({contracts.length})
                </Badge>
                <Badge variant="secondary" className="bg-gray-600 text-white">
                  Analyzed ({contracts.filter(c => c.status === 'analyzed').length})
                </Badge>
                <Badge variant="secondary" className="bg-gray-600 text-white">
                  Pending ({contracts.filter(c => c.status === 'analyzing').length})
                </Badge>
              </div>
            </div>

            <div className="space-y-4">
              {contracts.map((contract) => (
                <div
                  key={contract.id}
                  className="flex items-center justify-between p-4 bg-black/20 rounded-lg border border-white/10 hover:border-[#00ff88]/30 transition-all cursor-pointer hover-glow"
                  onClick={() => router.push(`/contracts/${contract.id}`)}
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-[#00ff88]" />
                      <div>
                        <h4 className="font-medium text-white">{contract.title}</h4>
                        <p className="text-sm text-gray-400">{contract.clientName}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <span className="text-xs bg-[#00ff88]/20 text-[#00ff88] px-2 py-1 rounded">
                      {contract.status}
                    </span>

                    {contract.analysis?.ambiguities && (
                      <div className="flex space-x-1">
                        <span className="text-xs bg-red-400/20 text-red-400 px-2 py-1 rounded">
                          {contract.analysis.ambiguities.filter(a => a.severity === 'critical').length} critical
                        </span>
                        <span className="text-xs bg-orange-400/20 text-orange-400 px-2 py-1 rounded">
                          {contract.analysis.ambiguities.filter(a => a.severity === 'high').length} high
                        </span>
                      </div>
                    )}

                    <div className="text-sm text-gray-400">
                      {new Date(contract.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}

              {contracts.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400 mb-4">No contracts found</p>
                  <Button
                    onClick={() => router.push('/contracts/new')}
                    className="bg-[#00ff88] text-black hover:bg-[#00ff88]/80 hover:neon-glow"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Upload Your First Contract
                  </Button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
