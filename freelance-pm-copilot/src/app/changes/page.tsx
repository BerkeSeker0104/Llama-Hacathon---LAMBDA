'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, 
  Plus, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  DollarSign,
  Calendar,
  User,
  Mail,
  Home
} from 'lucide-react';

interface ChangeRequest {
  id: string;
  contractId: string;
  contractTitle: string;
  clientName: string;
  requestText: string;
  analysis: {
    type: 'bug' | 'in-scope' | 'out-of-scope';
    impact: {
      time: string;
      cost: string;
      scope: string;
    };
    options: Array<{
      title: string;
      description: string;
      timeline: string;
      cost: string;
    }>;
  };
  selectedOption: number;
  status: 'pending' | 'approved' | 'rejected' | 'applied';
  evidence: Array<{
    type: string;
    url: string;
    timestamp: string;
  }>;
  emailDraft: string;
  pdfUrl?: string;
  createdAt: string;
}

export default function ChangesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [showNewForm, setShowNewForm] = useState(false);
  const [requestText, setRequestText] = useState('');
  const [selectedContract, setSelectedContract] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  // Mock data for demo
  const contracts = [
    { id: '1', title: 'Acme Corp Website', clientName: 'Acme Corporation' },
    { id: '2', title: 'TechStart Mobile App', clientName: 'TechStart Inc' },
    { id: '3', title: 'OldClient Legacy System', clientName: 'OldClient LLC' }
  ];

  const changes: ChangeRequest[] = [
    {
      id: '1',
      contractId: '1',
      contractTitle: 'Acme Corp Website',
      clientName: 'Acme Corporation',
      requestText: 'Can we add a blog section to the website? Also, we need the ability to manage content through an admin panel.',
      analysis: {
        type: 'out-of-scope',
        impact: {
          time: '2-3 weeks',
          cost: '$3,000 - $5,000',
          scope: 'Major addition - blog system + admin panel'
        },
        options: [
          {
            title: 'Basic Blog',
            description: 'Simple blog with basic CMS functionality',
            timeline: '2 weeks',
            cost: '$3,000'
          },
          {
            title: 'Advanced Blog + Admin',
            description: 'Full-featured blog with comprehensive admin panel',
            timeline: '3 weeks',
            cost: '$5,000'
          },
          {
            title: 'Custom Solution',
            description: 'Tailored blog system with advanced features',
            timeline: '4 weeks',
            cost: '$7,500'
          }
        ]
      },
      selectedOption: 1,
      status: 'pending',
      evidence: [],
      emailDraft: 'Thank you for your change request. I\'ve analyzed your request for a blog section and admin panel...',
      createdAt: '2024-01-10'
    },
    {
      id: '2',
      contractId: '2',
      contractTitle: 'TechStart Mobile App',
      clientName: 'TechStart Inc',
      requestText: 'The login button is not working on iOS devices.',
      analysis: {
        type: 'bug',
        impact: {
          time: '2-3 days',
          cost: 'No additional cost',
          scope: 'Bug fix - no scope change'
        },
        options: [
          {
            title: 'Quick Fix',
            description: 'Fix the iOS login issue',
            timeline: '2 days',
            cost: 'No charge'
          }
        ]
      },
      selectedOption: 0,
      status: 'approved',
      evidence: [
        {
          type: 'email',
          url: 'email_approval_1',
          timestamp: '2024-01-08'
        }
      ],
      emailDraft: 'I\'ve identified the iOS login issue and will fix it within 2 days...',
      createdAt: '2024-01-08'
    }
  ];

  const handleAnalyzeRequest = async () => {
    if (!requestText.trim() || !selectedContract) return;

    setAnalyzing(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      const mockAnalysis = {
        type: 'out-of-scope',
        impact: {
          time: '1-2 weeks',
          cost: '$2,000 - $4,000',
          scope: 'Medium addition - new feature request'
        },
        options: [
          {
            title: 'Basic Implementation',
            description: 'Simple version of the requested feature',
            timeline: '1 week',
            cost: '$2,000'
          },
          {
            title: 'Full Implementation',
            description: 'Complete feature with all requested functionality',
            timeline: '2 weeks',
            cost: '$4,000'
          },
          {
            title: 'Premium Implementation',
            description: 'Advanced version with additional features',
            timeline: '3 weeks',
            cost: '$6,000'
          }
        ]
      };
      
      setAnalysis(mockAnalysis);
      setAnalyzing(false);
    }, 2000);
  };

  const handleCreateChange = () => {
    if (!analysis) return;
    
    // In real app, this would save to Firestore
    console.log('Creating change request with analysis:', analysis);
    alert('Change request created successfully!');
    setShowNewForm(false);
    setRequestText('');
    setSelectedContract('');
    setAnalysis(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'applied':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'approved':
        return <Badge variant="default">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'applied':
        return <Badge variant="outline">Applied</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'bug':
        return <Badge variant="destructive">Bug</Badge>;
      case 'in-scope':
        return <Badge variant="default">In Scope</Badge>;
      case 'out-of-scope':
        return <Badge variant="secondary">Out of Scope</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Change Management</h1>
              <p className="text-gray-600">Manage change requests and scope modifications</p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={() => router.push('/')}>
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
              <Button onClick={() => setShowNewForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Change Request
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* New Change Request Form */}
        {showNewForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Create New Change Request</CardTitle>
              <CardDescription>
                Analyze a client's change request and generate options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contract">Select Contract</Label>
                  <Select value={selectedContract} onValueChange={setSelectedContract}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a contract" />
                    </SelectTrigger>
                    <SelectContent>
                      {contracts.map((contract) => (
                        <SelectItem key={contract.id} value={contract.id}>
                          {contract.title} - {contract.clientName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="request">Client Request</Label>
                <Textarea
                  id="request"
                  placeholder="Paste the client's change request here..."
                  value={requestText}
                  onChange={(e) => setRequestText(e.target.value)}
                  rows={4}
                />
              </div>

              <Button 
                onClick={handleAnalyzeRequest}
                disabled={!requestText.trim() || !selectedContract || analyzing}
                className="w-full"
              >
                {analyzing ? 'Analyzing...' : 'Analyze Request'}
              </Button>

              {/* Analysis Results */}
              {analysis && (
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h3 className="font-medium mb-4">AI Analysis Results</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <Label className="text-sm font-medium">Type</Label>
                      <p className="text-sm text-gray-600">{getTypeBadge(analysis.type)}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Time Impact</Label>
                      <p className="text-sm text-gray-600">{analysis.impact.time}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Cost Impact</Label>
                      <p className="text-sm text-gray-600">{analysis.impact.cost}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <Label className="text-sm font-medium">Scope Impact</Label>
                    <p className="text-sm text-gray-600">{analysis.impact.scope}</p>
                  </div>

                  <div className="mb-4">
                    <Label className="text-sm font-medium">Proposed Options</Label>
                    <div className="space-y-2">
                      {analysis.options.map((option: any, index: number) => (
                        <div key={index} className="border rounded p-3">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{option.title}</h4>
                            <div className="text-sm text-gray-600">
                              {option.timeline} • {option.cost}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">{option.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button onClick={handleCreateChange}>
                      Create Change Request
                    </Button>
                    <Button variant="outline" onClick={() => setAnalysis(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Change Requests List */}
        <div className="space-y-6">
          {changes.map((change) => (
            <Card key={change.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(change.status)}
                    <h3 className="font-medium">{change.contractTitle}</h3>
                  </div>
                  <div className="flex space-x-2">
                    {getStatusBadge(change.status)}
                    {getTypeBadge(change.analysis.type)}
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div>
                    <Label className="text-sm font-medium">Client Request</Label>
                    <p className="text-sm text-gray-600 mt-1">{change.requestText}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Time Impact</Label>
                      <p className="text-sm text-gray-600">{change.analysis.impact.time}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Cost Impact</Label>
                      <p className="text-sm text-gray-600">{change.analysis.impact.cost}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Scope Impact</Label>
                      <p className="text-sm text-gray-600">{change.analysis.impact.scope}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Created: {change.createdAt}
                    </div>
                    <div className="flex space-x-2">
                      {change.status === 'pending' && (
                        <>
                          <Button size="sm" variant="outline">
                            <Mail className="h-4 w-4 mr-1" />
                            Send Email
                          </Button>
                          <Button size="sm" variant="outline">
                            <FileText className="h-4 w-4 mr-1" />
                            Generate PDF
                          </Button>
                        </>
                      )}
                      {change.status === 'approved' && (
                        <Button size="sm">
                          Apply Changes
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {changes.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">No change requests yet</h3>
              <p className="text-gray-600 mb-4">Create your first change request to get started.</p>
              <Button onClick={() => setShowNewForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Change Request
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
