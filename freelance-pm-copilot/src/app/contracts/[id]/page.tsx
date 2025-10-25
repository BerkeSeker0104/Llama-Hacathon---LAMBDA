'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Calendar, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  User,
  Mail,
  ArrowLeft
} from 'lucide-react';
import { ContractService } from '@/lib/firestore-service';
import { Contract, ContractAnalysis } from '@/lib/firestore-schema';

// Using Contract interface from firestore-schema

export default function ContractDetailPage() {
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const contractId = params.id as string;

  useEffect(() => {
    if (!user) return;

    const fetchContract = async () => {
      try {
        const contractData = await ContractService.getContract(contractId);
        
        if (contractData) {
          setContract(contractData);
        } else {
          console.error('Contract not found');
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Error fetching contract:', error);
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchContract();
  }, [contractId, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading contract...</p>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Contract not found</h1>
          <Button onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Mock analysis data for demo
  const mockAnalysis: ContractAnalysis = {
    deliverables: [
      {
        id: '1',
        title: 'Website Design',
        description: 'Complete responsive website design with modern UI/UX',
        acceptanceCriteria: 'Design approved by client, mobile responsive, cross-browser compatible',
        status: 'pending'
      },
      {
        id: '2',
        title: 'Backend Development',
        description: 'RESTful API development with database integration',
        acceptanceCriteria: 'API endpoints functional, database optimized, security implemented',
        status: 'pending'
      }
    ],
    milestones: [
      {
        id: '1',
        title: 'Design Phase Complete',
        description: 'Finalize design assets and deliver approved mockups',
        dueDate: '2024-02-15',
        status: 'pending'
      },
      {
        id: '2',
        title: 'Development Phase Complete',
        description: 'Complete backend implementation and deliver API documentation',
        dueDate: '2024-03-15',
        status: 'pending'
      }
    ],
    paymentPlan: [
      {
        id: '1',
        milestoneId: '1',
        amount: 5000,
        currency: 'USD',
        dueDate: '2024-02-15',
        status: 'pending'
      },
      {
        id: '2',
        milestoneId: '2',
        amount: 5000,
        currency: 'USD',
        dueDate: '2024-03-15',
        status: 'pending'
      }
    ],
    risks: [
      {
        id: '1',
        title: 'Scope creep',
        description: 'Client may request additional features not specified in contract',
        severity: 'medium',
        probability: 45,
        impact: 60,
        mitigation: 'Schedule weekly alignment to manage new requests before approving scope changes',
        status: 'open'
      },
      {
        id: '2',
        title: 'Feedback delays',
        description: 'Potential delays due to extended client review cycles',
        severity: 'low',
        probability: 30,
        impact: 40,
        mitigation: 'Agree on review SLAs and share weekly progress updates to keep feedback moving',
        status: 'open'
      }
    ],
    timeline: {
      optimistic: '6 weeks',
      realistic: '8 weeks',
      pessimistic: '10 weeks'
    },
    summary: 'Full-stack web application development including design, frontend, backend, and deployment.',
    analyzedAt: new Date()
  };

  const analysis: ContractAnalysis = contract.analysis ?? mockAnalysis;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{contract.title}</h1>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    {contract.clientName}
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-1" />
                    {contract.clientEmail}
                  </div>
                  <Badge variant={contract.status === 'active' ? 'default' : 'secondary'}>
                    {contract.status}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Generate PDF
              </Button>
              <Button>
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="scope">Scope & Deliverables</TabsTrigger>
            <TabsTrigger value="milestones">Milestones & Payments</TabsTrigger>
            <TabsTrigger value="risks">Risks & Gaps</TabsTrigger>
            <TabsTrigger value="changes">Changes</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${analysis.paymentPlan.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {analysis.paymentPlan.length} payments
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Deliverables</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analysis.deliverables.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Key deliverables
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Risk Items</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analysis.risks.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Need attention
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Project Summary</CardTitle>
                <CardDescription>
                  High-level overview of the analyzed contract scope
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{analysis.summary}</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Scope & Deliverables Tab */}
          <TabsContent value="scope" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Deliverables</CardTitle>
                <CardDescription>
                  Key deliverables and their acceptance criteria
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysis.deliverables.map((deliverable) => (
                    <div key={deliverable.id} className="border rounded-lg p-4">
                      <h3 className="font-medium mb-2">{deliverable.title}</h3>
                      <p className="text-gray-600 mb-3">{deliverable.description}</p>
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-sm font-medium text-gray-700 mb-1">Acceptance Criteria:</p>
                        <p className="text-sm text-gray-600">{deliverable.acceptanceCriteria}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Milestones & Payments Tab */}
          <TabsContent value="milestones" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Milestones & Payment Plan</CardTitle>
                <CardDescription>
                  Project milestones and associated payments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysis.milestones.map((milestone) => {
                    const payment = analysis.paymentPlan.find(p => p.milestoneId === milestone.id);
                    return (
                      <div key={milestone.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">{milestone.title}</h3>
                          <Badge variant={payment?.status === 'overdue' ? 'destructive' : 'default'}>
                            {payment?.status || 'upcoming'}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                            <span>Due: {milestone.dueDate}</span>
                          </div>
                          {payment && (
                            <div className="flex items-center">
                              <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                              <span>${payment.amount.toLocaleString()} {payment.currency}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Risks & Gaps Tab */}
          <TabsContent value="risks" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Identified Risks</CardTitle>
                <CardDescription>
                  Potential risks and gaps identified in the contract
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysis.risks.map((risk) => {
                    const severityVariant =
                      risk.severity === 'critical'
                        ? 'destructive'
                        : risk.severity === 'high'
                        ? 'default'
                        : 'secondary';

                    return (
                      <div key={risk.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">{risk.title}</h3>
                          <Badge variant={severityVariant}>{risk.severity}</Badge>
                        </div>
                        <p className="text-gray-600 mb-2">{risk.description}</p>
                        <p className="text-sm text-gray-500">
                          Probability: {risk.probability}% · Impact: {risk.impact}% · Status: {risk.status}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Changes Tab */}
          <TabsContent value="changes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Change Requests</CardTitle>
                <CardDescription>
                  All change requests for this contract
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No change requests yet</p>
                  <Button className="mt-4" onClick={() => router.push('/changes')}>
                    Create Change Request
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Actions Tab */}
          <TabsContent value="actions" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Email Actions</CardTitle>
                  <CardDescription>
                    Send emails to the client
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full" variant="outline">
                    <Mail className="h-4 w-4 mr-2" />
                    Send Contract Summary
                  </Button>
                  <Button className="w-full" variant="outline">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Send Payment Reminder
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    Send Milestone Update
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Document Actions</CardTitle>
                  <CardDescription>
                    Generate and share documents
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full" variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Contract PDF
                  </Button>
                  <Button className="w-full" variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Summary Report
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    Create Project Plan
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
