'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { ContractService } from '@/lib/firestore-service';
import PDFUpload from '@/components/PDFUpload';

export default function NewContractPage() {
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [contractTitle, setContractTitle] = useState('');
  const [status, setStatus] = useState<'idle' | 'uploading' | 'analyzing' | 'complete' | 'error'>('idle');
  const [error, setError] = useState('');
  const [contractId, setContractId] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  const handleCreateContract = async () => {
    if (!user || !contractTitle || !clientName || !clientEmail) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setStatus('uploading');
      setError('');

      // Create contract in Firestore
      const contractId = await ContractService.createContract({
        title: contractTitle,
        clientName,
        clientEmail,
        userId: user.uid,
        status: 'analyzing'
      });

      setContractId(contractId);
      setStatus('idle');
    } catch (error: any) {
      console.error('Error creating contract:', error);
      setError(error.message || 'Failed to create contract');
      setStatus('error');
    }
  };

  const handlePDFUploadComplete = async (result: { url: string; path: string; size: number }) => {
    if (!contractId || !user) return;

    try {
      setStatus('analyzing');
      setPdfUrl(result.url);

      // Update contract with PDF URL
      await ContractService.updateContract(contractId, {
        pdfUrl: result.url,
        status: 'analyzing'
      });

      // Trigger AI analysis
      try {
        const response = await fetch('/api/contracts/trigger-analysis', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contractId,
            pdfUrl: result.url
          }),
        });

        if (response.ok) {
          // Simulate analysis time (in real app, this would be handled by Cloud Function)
          setTimeout(() => {
            setStatus('complete');
            // Redirect to contract detail page
            router.push(`/contracts/${contractId}`);
          }, 3000);
        } else {
          throw new Error('Failed to trigger AI analysis');
        }
      } catch (error) {
        console.error('Error triggering AI analysis:', error);
        setError('Failed to start AI analysis');
        setStatus('error');
      }

    } catch (error: any) {
      console.error('Error updating contract:', error);
      setError(error.message || 'Failed to update contract');
      setStatus('error');
    }
  };

  const handlePDFUploadError = (error: string) => {
    setError(error);
    setStatus('error');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">New Contract</h1>
              <p className="text-gray-600">Upload and analyze a new contract</p>
            </div>
            <Button variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Contract Upload & Analysis</CardTitle>
            <CardDescription>
              Upload your contract PDF and our AI will analyze it to extract deliverables, 
              milestones, payment terms, and potential risks.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Contract Details Form */}
              {!contractId && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contract-title">Contract Title *</Label>
                      <Input
                        id="contract-title"
                        value={contractTitle}
                        onChange={(e) => setContractTitle(e.target.value)}
                        placeholder="e.g., Website Development Project"
                        disabled={status === 'uploading'}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="client-name">Client Name *</Label>
                      <Input
                        id="client-name"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="e.g., Acme Corporation"
                        disabled={status === 'uploading'}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="client-email">Client Email *</Label>
                    <Input
                      id="client-email"
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="client@company.com"
                      disabled={status === 'uploading'}
                    />
                  </div>

                  <Button 
                    onClick={handleCreateContract}
                    disabled={!contractTitle || !clientName || !clientEmail || status === 'uploading'}
                    className="w-full"
                  >
                    {status === 'uploading' ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating Contract...
                      </>
                    ) : (
                      'Create Contract'
                    )}
                  </Button>
                </div>
              )}

              {/* PDF Upload */}
              {contractId && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Contract PDF</Label>
                    <PDFUpload
                      contractId={contractId}
                      onUploadComplete={handlePDFUploadComplete}
                      onUploadError={handlePDFUploadError}
                      existingUrl={pdfUrl || undefined}
                      disabled={status === 'analyzing' || status === 'complete'}
                    />
                  </div>
                </div>
              )}

              {/* Analysis Status */}
              {status === 'analyzing' && (
                <div className="flex items-center justify-center space-x-2 p-4 bg-blue-50 rounded-lg">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  <span className="text-blue-600 font-medium">AI is analyzing your contract...</span>
                </div>
              )}

              {status === 'complete' && (
                <div className="flex items-center justify-center space-x-2 p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <span className="text-green-600 font-medium">Analysis complete!</span>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-red-700">{error}</span>
                </div>
              )}
            </div>

            {/* What happens next */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">What happens next?</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• AI extracts deliverables, milestones, and payment terms</li>
                <li>• Identifies potential risks and scope gaps</li>
                <li>• Creates a structured project plan</li>
                <li>• Sets up payment tracking and reminders</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
