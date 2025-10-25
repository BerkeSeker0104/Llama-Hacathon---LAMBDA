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
import ResponsiveHeader from '@/components/ResponsiveHeader';
import { useToast } from '@/components/Toast';

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
  const { addToast } = useToast();

  const handleCreateContract = async () => {
    if (!user || !contractTitle || !clientName || !clientEmail) {
      setError('Lütfen tüm gerekli alanları doldurun');
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
      addToast({
        type: 'success',
        title: 'Sözleşme başarıyla oluşturuldu!',
        description: 'Artık PDF dosyasını yükleyebilirsiniz.'
      });
    } catch (error) {
      console.error('Error creating contract:', error);
      const message = error instanceof Error ? error.message : 'Failed to create contract';
      setError(message);
      setStatus('error');
      addToast({
        type: 'error',
        title: 'Sözleşme oluşturulamadı',
        description: message
      });
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
        pdfPath: result.path,
        status: 'analyzing'
      });

      // Trigger AI analysis - Call Cloud Function directly
      try {
        const cloudFunctionUrl = 'https://us-central1-lambda-926aa.cloudfunctions.net/analyzeContract';
        console.log('Calling Cloud Function directly:', cloudFunctionUrl);
        
        const response = await fetch(cloudFunctionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contractId,
            pdfUrl: result.url,
            pdfPath: result.path
          }),
        });

        if (response.ok) {
          const result = await response.json();
          console.log('Cloud Function response:', result);
          
          if (result.success) {
            setStatus('complete');
            // Redirect to contract detail page
            router.push(`/contracts/${contractId}`);
          } else {
            throw new Error(result.error || 'Analysis failed');
          }
        } else {
          const errorText = await response.text();
          console.error('Cloud Function error:', response.status, errorText);
          throw new Error(`Cloud Function error: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        console.error('Error triggering AI analysis:', error);
        setError('Yapay zeka analizi başlatılamadı');
        setStatus('error');
      }

    } catch (error) {
      console.error('Error updating contract:', error);
      const message = error instanceof Error ? error.message : 'Failed to update contract';
      setError(message);
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
      <ResponsiveHeader 
        title="Yeni Sözleşme"
        subtitle="Yeni bir sözleşme yükleyin ve analiz edin"
        showQuickActions={false}
      />

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Sözleşme Yükleme ve Analiz</CardTitle>
            <CardDescription>
              Sözleşme PDF'inizi yükleyin ve yapay zekamız teslim edilebilirler, 
              kilometre taşları, ödeme koşulları ve potansiyel riskleri çıkarmak için analiz edecek.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Contract Details Form */}
              {!contractId && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contract-title">Sözleşme Başlığı *</Label>
                      <Input
                        id="contract-title"
                        value={contractTitle}
                        onChange={(e) => setContractTitle(e.target.value)}
                        placeholder="örn., Web Sitesi Geliştirme Projesi"
                        disabled={status === 'uploading'}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="client-name">Müşteri Adı *</Label>
                      <Input
                        id="client-name"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="örn., Acme Şirketi"
                        disabled={status === 'uploading'}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="client-email">Müşteri E-postası *</Label>
                    <Input
                      id="client-email"
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="musteri@sirket.com"
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
                        Sözleşme Oluşturuluyor...
                      </>
                    ) : (
                      'Sözleşme Oluştur'
                    )}
                  </Button>
                </div>
              )}

              {/* PDF Upload */}
              {contractId && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Sözleşme PDF'i</Label>
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
                  <span className="text-blue-600 font-medium">Yapay zeka sözleşmenizi analiz ediyor...</span>
                </div>
              )}

              {status === 'complete' && (
                <div className="flex items-center justify-center space-x-2 p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <span className="text-green-600 font-medium">Analiz tamamlandı!</span>
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
              <h3 className="font-medium mb-2">Sırada ne var?</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Yapay zeka teslim edilebilirler, kilometre taşları ve ödeme koşullarını çıkarır</li>
                <li>• Potansiyel riskleri ve kapsam boşluklarını tespit eder</li>
                <li>• Yapılandırılmış bir proje planı oluşturur</li>
                <li>• Ödeme takibi ve hatırlatmaları kurar</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
