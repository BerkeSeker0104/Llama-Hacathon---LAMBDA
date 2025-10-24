'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DollarSign, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  Mail,
  Calendar,
  User
} from 'lucide-react';

interface Payment {
  id: string;
  contractId: string;
  contractTitle: string;
  clientName: string;
  clientEmail: string;
  milestoneId: string;
  milestoneTitle: string;
  amount: number;
  currency: string;
  dueDate: string;
  status: 'upcoming' | 'overdue' | 'paid';
  daysOverdue?: number;
  remindersSent: Array<{
    date: string;
    tone: 'gentle' | 'neutral' | 'firm';
    emailId: string;
  }>;
  paidAt?: string;
}

export default function PaymentsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedTone, setSelectedTone] = useState<'gentle' | 'neutral' | 'firm'>('neutral');

  // Mock data for demo
  const payments: Payment[] = [
    {
      id: '1',
      contractId: 'contract_1',
      contractTitle: 'Acme Corp Website',
      clientName: 'Acme Corporation',
      clientEmail: 'client@acme.com',
      milestoneId: 'milestone_1',
      milestoneTitle: 'Phase 1 Complete',
      amount: 5000,
      currency: 'USD',
      dueDate: '2024-01-15',
      status: 'upcoming',
      remindersSent: []
    },
    {
      id: '2',
      contractId: 'contract_2',
      contractTitle: 'TechStart Mobile App',
      clientName: 'TechStart Inc',
      clientEmail: 'dev@techstart.com',
      milestoneId: 'milestone_2',
      milestoneTitle: 'Design Review',
      amount: 3000,
      currency: 'USD',
      dueDate: '2024-01-20',
      status: 'upcoming',
      remindersSent: []
    },
    {
      id: '3',
      contractId: 'contract_3',
      contractTitle: 'OldClient Legacy System',
      clientName: 'OldClient LLC',
      clientEmail: 'admin@oldclient.com',
      milestoneId: 'milestone_3',
      milestoneTitle: 'Final Delivery',
      amount: 7500,
      currency: 'USD',
      dueDate: '2023-12-20',
      status: 'overdue',
      daysOverdue: 15,
      remindersSent: [
        {
          date: '2024-01-05',
          tone: 'gentle',
          emailId: 'email_1'
        },
        {
          date: '2024-01-10',
          tone: 'neutral',
          emailId: 'email_2'
        }
      ]
    },
    {
      id: '4',
      contractId: 'contract_4',
      contractTitle: 'NewClient Dashboard',
      clientName: 'NewClient Corp',
      clientEmail: 'pm@newclient.com',
      milestoneId: 'milestone_4',
      milestoneTitle: 'MVP Launch',
      amount: 4000,
      currency: 'USD',
      dueDate: '2023-12-01',
      status: 'paid',
      paidAt: '2023-12-01',
      remindersSent: []
    }
  ];

  const upcomingPayments = payments.filter(p => p.status === 'upcoming');
  const overduePayments = payments.filter(p => p.status === 'overdue');
  const paidPayments = payments.filter(p => p.status === 'paid');

  const handleSendReminder = (payment: Payment) => {
    // In real app, this would call the API to send email
    console.log('Sending reminder for payment:', payment.id, 'with tone:', selectedTone);
    // Show success message
    alert(`Reminder sent to ${payment.clientName} with ${selectedTone} tone`);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'overdue':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Badge variant="default">Upcoming</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Overdue</Badge>;
      case 'paid':
        return <Badge variant="secondary">Paid</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const PaymentCard = ({ payment }: { payment: Payment }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            {getStatusIcon(payment.status)}
            <h3 className="font-medium">{payment.contractTitle}</h3>
          </div>
          {getStatusBadge(payment.status)}
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <User className="h-4 w-4 mr-2" />
            {payment.clientName}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            Due: {payment.dueDate}
            {payment.daysOverdue && (
              <span className="ml-2 text-red-600 font-medium">
                ({payment.daysOverdue} days overdue)
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">
            ${payment.amount.toLocaleString()} {payment.currency}
          </div>
          {payment.status !== 'paid' && (
            <div className="flex space-x-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleSendReminder(payment)}
              >
                <Mail className="h-4 w-4 mr-1" />
                Send Reminder
              </Button>
            </div>
          )}
        </div>

        {payment.remindersSent.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-gray-600 mb-2">
              Reminders sent: {payment.remindersSent.length}
            </p>
            <div className="flex space-x-1">
              {payment.remindersSent.map((reminder, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {reminder.tone}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {payment.paidAt && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-green-600">
              ✓ Paid on {payment.paidAt}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Payment Tracking</h1>
              <p className="text-gray-600">Manage and track all your payments</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium">Reminder Tone:</label>
                <select 
                  value={selectedTone} 
                  onChange={(e) => setSelectedTone(e.target.value as any)}
                  className="border rounded px-2 py-1 text-sm"
                >
                  <option value="gentle">Gentle</option>
                  <option value="neutral">Neutral</option>
                  <option value="firm">Firm</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upcoming">
              Upcoming ({upcomingPayments.length})
            </TabsTrigger>
            <TabsTrigger value="overdue">
              Overdue ({overduePayments.length})
            </TabsTrigger>
            <TabsTrigger value="paid">
              Paid ({paidPayments.length})
            </TabsTrigger>
          </TabsList>

          {/* Upcoming Payments */}
          <TabsContent value="upcoming" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingPayments.map((payment) => (
                <PaymentCard key={payment.id} payment={payment} />
              ))}
            </div>
            {upcomingPayments.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">No upcoming payments</h3>
                  <p className="text-gray-600">All caught up! No payments due in the next 7 days.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Overdue Payments */}
          <TabsContent value="overdue" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {overduePayments.map((payment) => (
                <PaymentCard key={payment.id} payment={payment} />
              ))}
            </div>
            {overduePayments.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <h3 className="text-lg font-medium mb-2">No overdue payments</h3>
                  <p className="text-gray-600">Great job! All payments are up to date.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Paid Payments */}
          <TabsContent value="paid" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paidPayments.map((payment) => (
                <PaymentCard key={payment.id} payment={payment} />
              ))}
            </div>
            {paidPayments.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">No paid payments yet</h3>
                  <p className="text-gray-600">Payments will appear here once they're marked as paid.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Summary Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Outstanding</p>
                  <p className="text-2xl font-bold">
                    ${(upcomingPayments.reduce((sum, p) => sum + p.amount, 0) + 
                       overduePayments.reduce((sum, p) => sum + p.amount, 0)).toLocaleString()}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Overdue Amount</p>
                  <p className="text-2xl font-bold text-red-600">
                    ${overduePayments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Paid</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${paidPayments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Payment Rate</p>
                  <p className="text-2xl font-bold">
                    {payments.length > 0 ? Math.round((paidPayments.length / payments.length) * 100) : 0}%
                  </p>
                </div>
                <Clock className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
