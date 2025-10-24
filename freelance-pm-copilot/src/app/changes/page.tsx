'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, 
  Plus, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Mail
} from 'lucide-react';
import { ContractService } from '@/lib/firestore-service';
import { ChangeRequestService } from '@/lib/firestore-service';
import { ChangeRequest, Contract, ChangeAnalysis } from '@/lib/firestore-schema';

// Using ChangeRequest interface from firestore-schema

export default function ChangesPage() {
  const { user } = useAuth();
  const [showNewForm, setShowNewForm] = useState(false);
  const [requestText, setRequestText] = useState('');
  const [selectedContract, setSelectedContract] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ChangeAnalysis | null>(null);
  
  // Real-time data
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Set up real-time listeners
  useEffect(() => {
    if (!user) return;

    setLoading(true);
    
    // Subscribe to contracts
    const unsubscribeContracts = ContractService.subscribeToContracts(
      user.uid, 
      (contractsData) => {
        setContracts(contractsData);
        setLoading(false);
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

    return () => {
      unsubscribeContracts();
      unsubscribeChangeRequests();
    };
  }, [user]);

  // Use real-time data instead of mock data
  const changes = changeRequests;

  const handleAnalyzeRequest = async () => {
    if (!requestText.trim() || !selectedContract || !user) return;

    setAnalyzing(true);
    
    try {
      const response = await fetch('/api/changes/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestText,
          contractId: selectedContract,
          userId: user.uid
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setAnalysis(data.analysis);
        // Refresh change requests to show the new one
        const contractChanges = await ChangeRequestService.getChangeRequestsByContract(selectedContract);
        setChangeRequests(prev => {
          const otherChanges = prev.filter(cr => cr.contractId !== selectedContract);
          return [...otherChanges, ...contractChanges];
        });
      } else {
        console.error('Analysis failed:', data.error);
      }
    } catch (error) {
      console.error('Error analyzing request:', error);
    } finally {
      setAnalyzing(false);
    }
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading change requests...</p>
        </div>
      </div>
    );
  }

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
            <Button onClick={() => setShowNewForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Change Request
            </Button>
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
                Analyze a client&apos;s change request and generate options
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
                      {analysis.options.map((option: { title: string; description: string; timeline: string; cost: string }, index: number) => (
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
                    <h3 className="font-medium">
                      {contracts.find(c => c.id === change.contractId)?.title || 'Unknown Contract'}
                    </h3>
                  </div>
                  <div className="flex space-x-2">
                    {getStatusBadge(change.status)}
                    {change.analysis && getTypeBadge(change.analysis.type)}
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div>
                    <Label className="text-sm font-medium">Client Request</Label>
                    <p className="text-sm text-gray-600 mt-1">{change.requestText}</p>
                  </div>

                  {change.analysis && (
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
                  )}
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Created: {change.createdAt instanceof Date ? change.createdAt.toLocaleDateString() : new Date((change.createdAt as { seconds: number }).seconds * 1000).toLocaleDateString()}
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
