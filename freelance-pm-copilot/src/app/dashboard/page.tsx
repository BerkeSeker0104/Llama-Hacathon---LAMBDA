'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  Plus,
  DollarSign,
  Calendar,
  Users,
  LogOut
} from 'lucide-react';
import { ContractService, ChangeRequestService, CommunicationService } from '@/lib/firestore-service';
import { Contract, ChangeRequest, Communication } from '@/lib/firestore-schema';

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  
  // State for real-time data
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([]);
  const [communications, setCommunications] = useState<Communication[]>([]);
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

    // Subscribe to communications
    const unsubscribeCommunications = CommunicationService.subscribeToCommunications(
      user.uid,
      (communicationsData) => {
        setCommunications(communicationsData);
      }
    );

    return () => {
      unsubscribeContracts();
      unsubscribeChangeRequests();
      unsubscribeCommunications();
    };
  }, [user]);

  useEffect(() => {
    console.log('Dashboard: useEffect - user:', user ? user.email : 'null', 'loading:', loading);
    if (!loading && !user) {
      console.log('Dashboard: Redirecting to login - no user found');
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Calculate dashboard data from real Firebase data
  const activeContracts = contracts.filter(c => c.status === 'active' || c.status === 'analyzed').length;
  
  // Get upcoming payments from contract analysis
  const upcomingPayments = contracts
    .filter(contract => contract.analysis?.paymentPlan)
    .flatMap(contract => 
      contract.analysis!.paymentPlan
        .filter(payment => payment.status === 'pending')
        .map(payment => ({
          id: payment.id,
          client: contract.clientName,
          amount: payment.amount,
          currency: payment.currency,
          dueDate: payment.dueDate,
          milestone: contract.analysis!.milestones.find(m => m.id === payment.milestoneId)?.title || 'Payment'
        }))
    )
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  // Get overdue payments
  const overduePayments = contracts
    .filter(contract => contract.analysis?.paymentPlan)
    .flatMap(contract => 
      contract.analysis!.paymentPlan
        .filter(payment => {
          const dueDate = new Date(payment.dueDate);
          const now = new Date();
          return payment.status === 'pending' && dueDate < now;
        })
        .map(payment => {
          const dueDate = new Date(payment.dueDate);
          const now = new Date();
          const daysOverdue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
          return {
            id: payment.id,
            client: contract.clientName,
            amount: payment.amount,
            currency: payment.currency,
            dueDate: payment.dueDate,
            milestone: contract.analysis!.milestones.find(m => m.id === payment.milestoneId)?.title || 'Payment',
            daysOverdue
          };
        })
    )
    .sort((a, b) => b.daysOverdue - a.daysOverdue);

  // Get recent changes
  const recentChanges = changeRequests
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .map(change => {
      const contract = contracts.find(c => c.id === change.contractId);
      return {
        id: change.id,
        contract: contract?.title || 'Unknown Contract',
        type: change.type,
        status: change.status,
        date: change.createdAt.toLocaleDateString()
      };
    });

  // Get risk items from contract analysis
  const riskItems = contracts
    .filter(contract => contract.analysis?.risks)
    .flatMap(contract => 
      contract.analysis!.risks
        .filter(risk => risk.status === 'open')
        .map(risk => ({
          id: risk.id,
          contract: contract.title,
          risk: risk.title,
          severity: risk.severity
        }))
    )
    .sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user.email}</p>
            </div>
            <div className="flex space-x-3">
              <Button onClick={() => router.push('/contracts/new')}>
                <Plus className="h-4 w-4 mr-2" />
                New Contract
              </Button>
              <Button variant="outline" onClick={() => router.push('/changes')}>
                <FileText className="h-4 w-4 mr-2" />
                Create Change
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Payments</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingPayments.length}</div>
              <p className="text-xs text-muted-foreground">
                ${upcomingPayments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()} total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue Payments</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{overduePayments.length}</div>
              <p className="text-xs text-muted-foreground">
                ${overduePayments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()} overdue
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Contracts</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeContracts}</div>
              <p className="text-xs text-muted-foreground">Currently active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Risk Items</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{riskItems.length}</div>
              <p className="text-xs text-muted-foreground">Need attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Payments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Upcoming Payments
              </CardTitle>
              <CardDescription>Payments due in the next 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{payment.client}</p>
                      <p className="text-sm text-gray-600">{payment.milestone}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${payment.amount.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">{payment.dueDate}</p>
                    </div>
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.push('/payments')}
                >
                  View All Payments
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Overdue Payments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-red-600">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Overdue Payments
              </CardTitle>
              <CardDescription>Payments that require immediate attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {overduePayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 border border-red-200 rounded-lg bg-red-50">
                    <div>
                      <p className="font-medium">{payment.client}</p>
                      <p className="text-sm text-gray-600">{payment.milestone}</p>
                      <Badge variant="destructive" className="mt-1">
                        {payment.daysOverdue} days overdue
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${payment.amount.toLocaleString()}</p>
                      <Button size="sm" className="mt-2">
                        Send Reminder
                      </Button>
                    </div>
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.push('/payments')}
                >
                  Manage All Payments
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Changes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Recent Changes
              </CardTitle>
              <CardDescription>Latest change requests and approvals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentChanges.map((change) => (
                  <div key={change.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{change.contract}</p>
                      <p className="text-sm text-gray-600">{change.type}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={change.status === 'approved' ? 'default' : 'secondary'}>
                        {change.status}
                      </Badge>
                      <p className="text-sm text-gray-600 mt-1">{change.date}</p>
                    </div>
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.push('/changes')}
                >
                  View All Changes
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Risk Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Risk Items
              </CardTitle>
              <CardDescription>Items that need your attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {riskItems.map((risk) => (
                  <div key={risk.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{risk.contract}</p>
                      <p className="text-sm text-gray-600">{risk.risk}</p>
                    </div>
                    <Badge variant={risk.severity === 'high' ? 'destructive' : 'secondary'}>
                      {risk.severity}
                    </Badge>
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.push('/contracts')}
                >
                  Review Contracts
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
