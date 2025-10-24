'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc } from 'firebase/firestore';
import { storage, db } from '@/lib/firebase-client';

export default function NewContractPage() {
  const [file, setFile] = useState<File | null>(null);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [contractTitle, setContractTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'analyzing' | 'complete' | 'error'>('idle');
  const [error, setError] = useState('');
  const { user } = useAuth();
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        setError('Please select a PDF file');
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
        setError('File size must be less than 10MB');
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !user) return;

    setUploading(true);
    setStatus('uploading');
    setError('');

    try {
      // Create contract document in Firestore
      const contractId = `contract_${Date.now()}`;
      const contractRef = doc(db, 'contracts', contractId);
      
      // Upload file to Firebase Storage
      const storageRef = ref(storage, `contracts/${user.uid}/${contractId}.pdf`);
      const uploadTask = uploadBytes(storageRef, file);
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      await uploadTask;
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);

      // Save contract metadata to Firestore
      await setDoc(contractRef, {
        id: contractId,
        title: contractTitle || file.name,
        clientName,
        clientEmail,
        uploadedAt: new Date(),
        pdfUrl: downloadURL,
        status: 'analyzing',
        userId: user.uid,
        createdAt: new Date(),
      });

      setStatus('analyzing');
      
      // Simulate AI analysis (in real app, this would be handled by Cloud Function)
      setTimeout(() => {
        setStatus('complete');
        // Redirect to contract detail page
        router.push(`/contracts/${contractId}`);
      }, 3000);

    } catch (error: any) {
      console.error('Upload error:', error);
      setError(error.message || 'Failed to upload contract');
      setStatus('error');
    } finally {
      setUploading(false);
    }
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
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* File Upload */}
              <div className="space-y-2">
                <Label htmlFor="contract-file">Contract PDF</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <input
                    id="contract-file"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={uploading}
                  />
                  <label htmlFor="contract-file" className="cursor-pointer">
                    {file ? (
                      <div className="flex items-center justify-center space-x-2">
                        <FileText className="h-8 w-8 text-blue-600" />
                        <span className="text-sm font-medium">{file.name}</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center space-y-2">
                        <Upload className="h-12 w-12 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium">Click to upload PDF</p>
                          <p className="text-xs text-gray-500">or drag and drop</p>
                        </div>
                      </div>
                    )}
                  </label>
                </div>
                {error && (
                  <div className="flex items-center space-x-2 text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <span>{error}</span>
                  </div>
                )}
              </div>

              {/* Contract Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contract-title">Contract Title</Label>
                  <Input
                    id="contract-title"
                    value={contractTitle}
                    onChange={(e) => setContractTitle(e.target.value)}
                    placeholder="e.g., Website Development Project"
                    disabled={uploading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client-name">Client Name</Label>
                  <Input
                    id="client-name"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g., Acme Corporation"
                    disabled={uploading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="client-email">Client Email</Label>
                <Input
                  id="client-email"
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="client@company.com"
                  disabled={uploading}
                />
              </div>

              {/* Upload Progress */}
              {status === 'uploading' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Analysis Status */}
              {status === 'analyzing' && (
                <div className="flex items-center justify-center space-x-2 p-4 bg-blue-50 rounded-lg">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="text-blue-600 font-medium">AI is analyzing your contract...</span>
                </div>
              )}

              {status === 'complete' && (
                <div className="flex items-center justify-center space-x-2 p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <span className="text-green-600 font-medium">Analysis complete!</span>
                </div>
              )}

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full" 
                disabled={!file || uploading || status === 'analyzing'}
              >
                {uploading ? 'Uploading...' : status === 'analyzing' ? 'Analyzing...' : 'Upload & Analyze'}
              </Button>
            </form>

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
