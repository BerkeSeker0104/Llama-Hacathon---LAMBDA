'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, DollarSign, Calendar, Users } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('HomePage: useEffect - user:', user ? user.email : 'null', 'loading:', loading);
    if (!loading && user) {
      console.log('HomePage: User authenticated, redirecting to dashboard');
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    console.log('HomePage: Loading state - showing spinner');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Freelance PM Copilot</h1>
            </div>
            <div className="flex space-x-4">
              <Link href="/login">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            AI-Powered Project Management
            <span className="text-blue-600"> for Freelancers</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Transform your freelance business with intelligent contract analysis, 
            automated payment tracking, and smart change management. 
            Stop losing money to scope creep and late payments.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="text-lg px-8 py-4">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-lg px-8 py-4">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <FileText className="h-12 w-12 text-blue-600 mb-4" />
              <CardTitle>Contract Intelligence</CardTitle>
              <CardDescription>
                Upload any contract PDF and get instant analysis of deliverables, 
                milestones, payment terms, and potential risks.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <DollarSign className="h-12 w-12 text-green-600 mb-4" />
              <CardTitle>Smart Payment Tracking</CardTitle>
              <CardDescription>
                Never miss a payment again. Automated reminders with customizable 
                tone and intelligent payment status tracking.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Calendar className="h-12 w-12 text-purple-600 mb-4" />
              <CardTitle>Reality-Based Planning</CardTitle>
              <CardDescription>
                AI analyzes your past performance to create realistic timelines 
                with optimistic, realistic, and pessimistic scenarios.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-12 w-12 text-orange-600 mb-4" />
              <CardTitle>Change Management</CardTitle>
              <CardDescription>
                Automatically detect scope creep and generate professional 
                change orders with impact analysis and pricing options.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <FileText className="h-12 w-12 text-red-600 mb-4" />
              <CardTitle>Multi-Client Command</CardTitle>
              <CardDescription>
                Manage all your clients from one dashboard. See upcoming 
                deadlines, overdue payments, and risk items at a glance.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <DollarSign className="h-12 w-12 text-indigo-600 mb-4" />
              <CardTitle>Cash Flow Protection</CardTitle>
              <CardDescription>
                Reduce late payments by 60% with intelligent reminder systems 
                and automated follow-up sequences.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">The Problem We Solve</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-red-600 mb-2">44%</div>
              <p className="text-gray-600">of invoices are paid late</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-600 mb-2">52%</div>
              <p className="text-gray-600">of projects suffer from scope creep</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">16%</div>
              <p className="text-gray-600">of developer time is spent coding</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Freelance Business?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of freelancers who have already improved their cash flow and project success rates.
          </p>
          <Link href="/register">
            <Button size="lg" className="text-lg px-8 py-4">
              Get Started Free
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
