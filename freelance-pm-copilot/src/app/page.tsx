'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, DollarSign, Calendar, Users, LogOut, Home as HomeIcon } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      // Sayfa yeniden yüklenecek ve landing page gösterilecek
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  console.log('HomePage: Render - user:', user ? user.email : 'null', 'loading:', loading);

  useEffect(() => {
    console.log('HomePage: useEffect triggered - user:', user ? user.email : 'null', 'loading:', loading);
    if (!loading && user) {
      console.log('HomePage: User authenticated, redirecting to dashboard');
      router.push('/dashboard');
    } else if (!loading && !user) {
      console.log('HomePage: No user, showing landing page');
    }
  }, [user, loading, router]);

  if (loading) {
    console.log('HomePage: Loading state - showing spinner');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  console.log('HomePage: Rendering landing page - user:', user ? user.email : 'null');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Serbest PM Asistanı</h1>
            </div>
            <div className="flex space-x-4">
              {user ? (
                <>
                  <Button variant="outline" onClick={() => router.push('/dashboard')}>
                    <HomeIcon className="h-4 w-4 mr-2" />
                    Pano
                  </Button>
                  <Button variant="outline" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Çıkış
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="outline">Giriş Yap</Button>
                  </Link>
                  <Link href="/register">
                    <Button>Başla</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Yapay Zeka Destekli Proje Yönetimi
            <span className="text-blue-600"> Serbest Çalışanlar İçin</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Akıllı sözleşme analizi, otomatik ödeme takibi ve akıllı değişiklik yönetimi ile 
            serbest çalışma işinizi dönüştürün. Kapsam genişlemesi ve geciken ödemeler 
            yüzünden para kaybetmeyi bırakın.
          </p>
          {user ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8 py-4" onClick={() => router.push('/dashboard')}>
                Pano'ya Git
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-4" onClick={handleLogout}>
                Çıkış Yap
              </Button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="text-lg px-8 py-4">
                  Ücretsiz Deneme Başlat
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="text-lg px-8 py-4">
                  Giriş Yap
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <FileText className="h-12 w-12 text-blue-600 mb-4" />
              <CardTitle>Sözleşme Zekası</CardTitle>
              <CardDescription>
                Herhangi bir sözleşme PDF'ini yükleyin ve teslim edilebilirler, 
                kilometre taşları, ödeme koşulları ve potansiyel riskler hakkında 
                anında analiz alın.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <DollarSign className="h-12 w-12 text-green-600 mb-4" />
              <CardTitle>Akıllı Ödeme Takibi</CardTitle>
              <CardDescription>
                Bir daha asla ödeme kaçırmayın. Özelleştirilebilir ton ile 
                otomatik hatırlatmalar ve akıllı ödeme durumu takibi.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Calendar className="h-12 w-12 text-purple-600 mb-4" />
              <CardTitle>Gerçekçi Planlama</CardTitle>
              <CardDescription>
                Yapay zeka geçmiş performansınızı analiz ederek iyimser, 
                gerçekçi ve kötümser senaryolarla gerçekçi zaman çizelgeleri oluşturur.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-12 w-12 text-orange-600 mb-4" />
              <CardTitle>Değişiklik Yönetimi</CardTitle>
              <CardDescription>
                Kapsam genişlemesini otomatik olarak tespit edin ve etki analizi 
                ile fiyatlandırma seçenekleri içeren profesyonel değişiklik emirleri oluşturun.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <FileText className="h-12 w-12 text-red-600 mb-4" />
              <CardTitle>Çoklu Müşteri Yönetimi</CardTitle>
              <CardDescription>
                Tüm müşterilerinizi tek bir panelden yönetin. Yaklaşan 
                son tarihleri, geciken ödemeleri ve risk öğelerini tek bakışta görün.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <DollarSign className="h-12 w-12 text-indigo-600 mb-4" />
              <CardTitle>Nakit Akışı Koruması</CardTitle>
              <CardDescription>
                Akıllı hatırlatma sistemleri ve otomatik takip dizileri ile 
                geciken ödemeleri %60 azaltın.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Çözdüğümüz Problem</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-red-600 mb-2">44%</div>
              <p className="text-gray-600">fatura geç ödeniyor</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-600 mb-2">52%</div>
              <p className="text-gray-600">proje kapsam genişlemesinden zarar görüyor</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">16%</div>
              <p className="text-gray-600">geliştirici zamanı kodlama ile geçiyor</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Serbest Çalışma İşinizi Dönüştürmeye Hazır mısınız?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Nakit akışlarını ve proje başarı oranlarını zaten iyileştirmiş binlerce 
            serbest çalışanın arasına katılın.
          </p>
          <Link href="/register">
            <Button size="lg" className="text-lg px-8 py-4">
              Ücretsiz Başla
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
