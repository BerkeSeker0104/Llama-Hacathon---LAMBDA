'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Mail, 
  Send, 
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  User,
  Calendar,
  DollarSign
} from 'lucide-react';

interface Communication {
  id: string;
  type: 'reminder' | 'change-order' | 'inbound';
  contractId: string;
  contractTitle: string;
  to: string;
  subject: string;
  body: string;
  attachments: string[];
  sentAt: string;
  status: 'sent' | 'delivered' | 'opened' | 'replied';
  inboundReplyToken?: string;
}

export default function CommunicationsPage() {
  const { user } = useAuth();
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  // Mock data for demo
  const communications: Communication[] = [
    {
      id: '1',
      type: 'reminder',
      contractId: 'contract_1',
      contractTitle: 'Acme Corp Website',
      to: 'client@acme.com',
      subject: 'Payment Reminder - Phase 1 Complete',
      body: 'Hi John,\n\nI hope you\'re doing well! I wanted to send a gentle reminder that we have a payment of $5,000 USD due on 2024-01-15 for the Phase 1 Complete milestone.\n\nI understand that schedules can get busy, so please let me know if you need any clarification or if there\'s anything I can help with.\n\nThank you for your continued partnership!\n\nBest regards,\nSarah',
      attachments: [],
      sentAt: '2024-01-10T10:30:00Z',
      status: 'sent'
    },
    {
      id: '2',
      type: 'change-order',
      contractId: 'contract_1',
      contractTitle: 'Acme Corp Website',
      to: 'client@acme.com',
      subject: 'Change Request - Blog Section Addition',
      body: 'Hi John,\n\nThank you for your change request. I\'ve analyzed your request for a blog section and admin panel and prepared the following options:\n\n**Request:** Can we add a blog section to the website? Also, we need the ability to manage content through an admin panel.\n\n**Analysis:** This is an out-of-scope request that will require significant additional development.\n\n**Proposed Options:**\n1. Basic Blog - Simple blog with basic CMS functionality (2 weeks, $3,000)\n2. Advanced Blog + Admin - Full-featured blog with comprehensive admin panel (3 weeks, $5,000)\n3. Custom Solution - Tailored blog system with advanced features (4 weeks, $7,500)\n\nPlease review these options and let me know which one you\'d like to proceed with, or if you have any questions.\n\nBest regards,\nSarah',
      attachments: ['change-order-acme-blog.pdf'],
      sentAt: '2024-01-10T14:15:00Z',
      status: 'opened'
    },
    {
      id: '3',
      type: 'inbound',
      contractId: 'contract_2',
      contractTitle: 'TechStart Mobile App',
      to: 'dev@techstart.com',
      subject: 'Re: Payment Reminder - Design Review',
      body: 'Hi Sarah,\n\nThanks for the reminder. The payment has been processed and should appear in your account within 2-3 business days. The reference number is #PAY-2024-001.\n\nLet me know if you need anything else!\n\nBest,\nMike',
      attachments: [],
      sentAt: '2024-01-11T09:45:00Z',
      status: 'replied',
      inboundReplyToken: 'reply_techstart_001'
    }
  ];

  const templates = [
    {
      id: 'payment_reminder_gentle',
      name: 'Gentle Payment Reminder',
      type: 'reminder',
      subject: 'Friendly reminder about your upcoming payment',
      tone: 'gentle'
    },
    {
      id: 'payment_reminder_neutral',
      name: 'Neutral Payment Reminder',
      type: 'reminder',
      subject: 'Payment Reminder - {{milestone}}',
      tone: 'neutral'
    },
    {
      id: 'payment_reminder_firm',
      name: 'Firm Payment Reminder',
      type: 'reminder',
      subject: 'Overdue Payment - {{milestone}}',
      tone: 'firm'
    },
    {
      id: 'change_order_proposal',
      name: 'Change Order Proposal',
      type: 'change-order',
      subject: 'Change Request - {{contractTitle}}',
      tone: 'neutral'
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'reminder':
        return <DollarSign className="h-4 w-4 text-blue-500" />;
      case 'change-order':
        return <FileText className="h-4 w-4 text-orange-500" />;
      case 'inbound':
        return <Mail className="h-4 w-4 text-green-500" />;
      default:
        return <Mail className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <Send className="h-4 w-4 text-blue-500" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'opened':
        return <Mail className="h-4 w-4 text-purple-500" />;
      case 'replied':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge variant="secondary">Sent</Badge>;
      case 'delivered':
        return <Badge variant="default">Delivered</Badge>;
      case 'opened':
        return <Badge variant="outline">Opened</Badge>;
      case 'replied':
        return <Badge variant="default">Replied</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'reminder':
        return <Badge variant="default">Reminder</Badge>;
      case 'change-order':
        return <Badge variant="secondary">Change Order</Badge>;
      case 'inbound':
        return <Badge variant="outline">Inbound</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Communications</h1>
              <p className="text-gray-600">Manage email templates and communication history</p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Email Templates
              </Button>
              <Button>
                <Send className="h-4 w-4 mr-2" />
                Send Email
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="history" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="history">Communication History</TabsTrigger>
            <TabsTrigger value="templates">Email Templates</TabsTrigger>
          </TabsList>

          {/* Communication History */}
          <TabsContent value="history" className="space-y-6">
            <div className="space-y-4">
              {communications.map((comm) => (
                <Card key={comm.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {getTypeIcon(comm.type)}
                        <div>
                          <h3 className="font-medium">{comm.subject}</h3>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <User className="h-4 w-4" />
                            <span>{comm.to}</span>
                            <span>•</span>
                            <span>{comm.contractTitle}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(comm.status)}
                        {getStatusBadge(comm.status)}
                        {getTypeBadge(comm.type)}
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-gray-700 whitespace-pre-line">{comm.body}</p>
                    </div>

                    {comm.attachments.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-600 mb-2">Attachments:</p>
                        <div className="flex space-x-2">
                          {comm.attachments.map((attachment, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              <FileText className="h-3 w-3 mr-1" />
                              {attachment}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(comm.sentAt)}
                        </div>
                        {comm.inboundReplyToken && (
                          <Badge variant="outline" className="text-xs">
                            Reply Token: {comm.inboundReplyToken}
                          </Badge>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                        {comm.type === 'inbound' && (
                          <Button size="sm">
                            Mark as Resolved
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {communications.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Mail className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">No communications yet</h3>
                  <p className="text-gray-600">Send your first email to get started.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Email Templates */}
          <TabsContent value="templates" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {templates.map((template) => (
                <Card key={template.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <Badge variant={template.tone === 'gentle' ? 'default' : 
                                     template.tone === 'neutral' ? 'secondary' : 'destructive'}>
                        {template.tone}
                      </Badge>
                    </div>
                    <CardDescription>{template.subject}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Type:</span>
                        <Badge variant="outline">{template.type}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Tone:</span>
                        <span className="capitalize">{template.tone}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2 mt-4">
                      <Button size="sm" variant="outline" className="flex-1">
                        Preview
                      </Button>
                      <Button size="sm" className="flex-1">
                        Use Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Template Statistics</CardTitle>
                <CardDescription>
                  Usage statistics for your email templates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <h3 className="text-2xl font-bold text-blue-600">24</h3>
                    <p className="text-sm text-blue-600">Total Sent</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <h3 className="text-2xl font-bold text-green-600">18</h3>
                    <p className="text-sm text-green-600">Delivered</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <h3 className="text-2xl font-bold text-purple-600">12</h3>
                    <p className="text-sm text-purple-600">Opened</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <h3 className="text-2xl font-bold text-orange-600">8</h3>
                    <p className="text-sm text-orange-600">Replied</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
