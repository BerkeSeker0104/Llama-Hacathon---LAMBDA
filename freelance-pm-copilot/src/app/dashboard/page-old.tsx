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

    // No communications in B2B version

    // B2B: Load company data if user has companyId
    if (user.companyId) {
      // Load company data
      CompanyService.getCompany(user.companyId).then((companyData) => {
        if (companyData) {
          setCompany(companyData);
        }
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
    console.log('Dashboard: useEffect - user:', user ? user.email : 'null', 'loading:', loading);
    if (!loading && !user) {
      console.log('Dashboard: Redirecting to login - no user found');
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || dataLoading) {
    return <Loading fullScreen text="Çalışma alanınız yükleniyor..." />;
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
      <ResponsiveHeader 
        title="Pano"
        subtitle={`Tekrar hoş geldiniz, ${user.email}`}
        showQuickActions={true}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <ResponsiveStatsGrid className="mb-8">
          {/* B2B Company Info */}
          {company && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Şirket</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{company.name}</div>
                <p className="text-xs text-muted-foreground">
                  {company.licenseType} lisans
                </p>
              </CardContent>
            </Card>
          )}

          {/* Teams Count */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ekipler</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teams.length}</div>
              <p className="text-xs text-muted-foreground">
                {people.length} çalışan
              </p>
            </CardContent>
          </Card>

          {/* Ambiguities Widget */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Belirsizlikler</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {contracts.flatMap(c => c.analysis?.ambiguities || []).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Kritik: {contracts.flatMap(c => c.analysis?.ambiguities || []).filter(a => a.severity === 'critical').length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aktif Sözleşmeler</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeContracts}</div>
              <p className="text-xs text-muted-foreground">Şu anda aktif</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Risk Öğeleri</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{riskItems.length}</div>
              <p className="text-xs text-muted-foreground">Dikkat gerekiyor</p>
            </CardContent>
          </Card>
        </ResponsiveStatsGrid>

        {/* Main Dashboard Cards */}
        <ResponsiveContentGrid>
          {/* Upcoming Payments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Yaklaşan Ödemeler
              </CardTitle>
              <CardDescription>Önümüzdeki 7 gün içinde vadesi gelen ödemeler</CardDescription>
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
                  Tüm Ödemeleri Görüntüle
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Overdue Payments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-red-600">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Geciken Ödemeler
              </CardTitle>
              <CardDescription>Acil dikkat gerektiren ödemeler</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {overduePayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 border border-red-200 rounded-lg bg-red-50">
                    <div>
                      <p className="font-medium">{payment.client}</p>
                      <p className="text-sm text-gray-600">{payment.milestone}</p>
                      <Badge variant="destructive" className="mt-1">
                        {payment.daysOverdue} gün gecikmiş
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${payment.amount.toLocaleString()}</p>
                      <Button size="sm" className="mt-2">
                        Hatırlatma Gönder
                      </Button>
                    </div>
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.push('/payments')}
                >
                  Tüm Ödemeleri Yönet
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Changes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Son Değişiklikler
              </CardTitle>
              <CardDescription>Son değişiklik talepleri ve onaylar</CardDescription>
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
                  Tüm Değişiklikleri Görüntüle
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* B2B: Ambiguities & Risks Widget */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Belirsizlikler & Riskler
              </CardTitle>
              <CardDescription>Kritik belirsizlikler ve yüksek riskli maddeler</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contracts.flatMap(c => c.analysis?.ambiguities || [])
                  .filter(a => a.severity === 'high' || a.severity === 'critical')
                  .slice(0, 3)
                  .map(amb => (
                    <div key={amb.id} className="border-l-4 border-red-500 p-3 rounded">
                      <Badge variant="destructive" className="mb-2">{amb.severity}</Badge>
                      <p className="font-medium text-sm">{amb.issue}</p>
                      <p className="text-xs text-gray-600 mt-1">{amb.clause}</p>
                    </div>
                  ))
                }
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.push('/contracts')}
                >
                  Tüm Belirsizlikleri Görüntüle
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* B2B: Team Capacity Widget */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Ekip Kapasitesi
              </CardTitle>
              <CardDescription>Ekip üyelerinin müsaitlik durumu</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {teams.slice(0, 3).map(team => {
                  const teamPeople = people.filter(p => p.teamId === team.id);
                  const avgWorkload = teamPeople.length > 0 
                    ? teamPeople.reduce((sum, p) => sum + p.currentWorkload, 0) / teamPeople.length 
                    : 0;
                  
                  return (
                    <div key={team.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium text-sm">{team.name}</p>
                        <p className="text-xs text-gray-600">{teamPeople.length} üye</p>
                      </div>
                      <div className="text-right">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${avgWorkload > 80 ? 'bg-red-500' : avgWorkload > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                            style={{ width: `${avgWorkload}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{Math.round(avgWorkload)}% yük</p>
                      </div>
                    </div>
                  );
                })}
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.push('/directory')}
                >
                  Ekip Dizini
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* B2B: Replan Button */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Plan Yönetimi
              </CardTitle>
              <CardDescription>Proje planlarını yeniden oluştur</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button 
                  className="w-full"
                  onClick={() => router.push('/planning')}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Planı Yeniden Oluştur
                </Button>
                <p className="text-xs text-gray-600">
                  Ekip değişiklikleri, tatil planları veya aksamalar için planı güncelleyin
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Risk Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Risk Öğeleri
              </CardTitle>
              <CardDescription>Dikkatinizi gerektiren öğeler</CardDescription>
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
                  Sözleşmeleri İncele
                </Button>
              </div>
            </CardContent>
          </Card>
        </ResponsiveContentGrid>
      </main>
    </div>
  );
}
