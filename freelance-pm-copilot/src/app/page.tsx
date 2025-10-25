'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, DollarSign, Calendar, Users, LogOut, Home as HomeIcon, AlertTriangle, TrendingUp, Clock } from 'lucide-react';
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
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="glass-card border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-[#00ff88] mr-3" />
              <h1 className="text-2xl font-bold text-white">LAMBDA Project Manager</h1>
            </div>
            <div className="flex space-x-4">
              {user ? (
                <>
                  <Button variant="outline" onClick={() => router.push('/dashboard')} className="glass-button text-white border-[#00ff88] hover:bg-[#00ff88]/10">
                    <HomeIcon className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                  <Button variant="outline" onClick={handleLogout} className="glass-button text-white border-[#00ff88] hover:bg-[#00ff88]/10">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <Link href="/login">
                  <Button className="bg-[#00ff88] text-black hover:bg-[#00ff88]/80 hover:neon-glow">
                    Login
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            AI-Powered Project Management
            <span className="text-[#00ff88] neon-text"> for Software Teams</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Smart contract analysis, skill-based task assignment, and intelligent change management 
            for modern software development teams. Eliminate scope creep and project delays with 
            AI-driven project planning and resource optimization.
          </p>
          {user ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8 py-4 bg-[#00ff88] text-black hover:bg-[#00ff88]/80 hover:neon-glow" onClick={() => router.push('/dashboard')}>
                Go to Dashboard
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-4 glass-button text-white border-[#00ff88] hover:bg-[#00ff88]/10" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login">
                <Button size="lg" className="text-lg px-8 py-4 bg-[#00ff88] text-black hover:bg-[#00ff88]/80 hover:neon-glow">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="glass-card hover-glow">
            <CardHeader>
              <FileText className="h-12 w-12 text-[#00ff88] mb-4" />
              <CardTitle className="text-white">Contract Intelligence</CardTitle>
              <CardDescription className="text-gray-300">
                Upload any contract PDF and get instant analysis of deliverables, 
                milestones, payment terms, and potential risks with AI-powered insights.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="glass-card hover-glow">
            <CardHeader>
              <Users className="h-12 w-12 text-[#00ff88] mb-4" />
              <CardTitle className="text-white">Team Management</CardTitle>
              <CardDescription className="text-gray-300">
                Organize your teams hierarchically with skill-based assignments. 
                Track capacity, workload, and availability across all team members.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="glass-card hover-glow">
            <CardHeader>
              <Calendar className="h-12 w-12 text-[#00ff88] mb-4" />
              <CardTitle className="text-white">Smart Planning</CardTitle>
              <CardDescription className="text-gray-300">
                AI analyzes historical performance to create realistic timelines 
                with optimistic, realistic, and pessimistic scenarios for better planning.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="glass-card hover-glow">
            <CardHeader>
              <AlertTriangle className="h-12 w-12 text-[#00ff88] mb-4" />
              <CardTitle className="text-white">Ambiguity Detection</CardTitle>
              <CardDescription className="text-gray-300">
                Automatically detect vague requirements and scope ambiguities. 
                Get suggested redlines and clarification questions to prevent scope creep.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="glass-card hover-glow">
            <CardHeader>
              <TrendingUp className="h-12 w-12 text-[#00ff88] mb-4" />
              <CardTitle className="text-white">Change Management</CardTitle>
              <CardDescription className="text-gray-300">
                Automatically detect scope changes and generate impact analysis 
                with pricing options for professional change orders.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="glass-card hover-glow">
            <CardHeader>
              <Clock className="h-12 w-12 text-[#00ff88] mb-4" />
              <CardTitle className="text-white">Resource Optimization</CardTitle>
              <CardDescription className="text-gray-300">
                Smart resource allocation based on skills, availability, and workload. 
                Reduce project delays by 60% with optimized team assignments.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Stats */}
        <div className="glass-card p-8 mb-16">
          <h2 className="text-3xl font-bold text-center mb-8 text-white">Problems We Solve</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-[#00ff88] mb-2 neon-text">44%</div>
              <p className="text-gray-300">projects suffer from scope creep</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#00ff88] mb-2 neon-text">52%</div>
              <p className="text-gray-300">projects miss deadlines due to poor planning</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#00ff88] mb-2 neon-text">60%</div>
              <p className="text-gray-300">reduction in project delays with our platform</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4 text-white">Ready to Transform Your Project Management?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of software teams already improving their project success rates 
            and resource optimization with AI-powered project management.
          </p>
          <Link href="/login">
            <Button size="lg" className="text-lg px-8 py-4 bg-[#00ff88] text-black hover:bg-[#00ff88]/80 hover:neon-glow">
              Get Started
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
