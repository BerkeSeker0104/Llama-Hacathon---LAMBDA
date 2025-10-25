'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Mail, 
  DollarSign,
  Bell,
  Shield,
  FileText,
  Save,
  LogOut
} from 'lucide-react';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [saving, setSaving] = useState(false);

  // Mock settings data
  const [settings, setSettings] = useState({
    workspace: {
      name: 'Serbest PM Çalışma Alanı',
      email: user?.email || '',
      phone: '+1 (555) 123-4567',
      website: 'https://freelancepm.com',
      timezone: 'America/New_York',
      currency: 'USD'
    },
    email: {
      fromName: 'Ayşe Yılmaz',
      fromEmail: 'ayse@serbestpm.com',
      replyTo: 'ayse@serbestpm.com',
      signature: 'Saygılarımla,\nAyşe Yılmaz\nSerbest Geliştirici\nayse@serbestpm.com'
    },
    notifications: {
      paymentReminders: true,
      changeRequests: true,
      contractUpdates: true,
      emailFrequency: 'daily'
    },
    billing: {
      plan: 'Pro',
      nextBilling: '2024-02-15',
      paymentMethod: '**** 4242'
    }
  });

  const handleSave = async () => {
    setSaving(true);
    // Simulate save
    setTimeout(() => {
      setSaving(false);
      alert('Ayarlar başarıyla kaydedildi!');
    }, 1000);
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Ayarlar</h1>
              <p className="text-gray-600">Çalışma alanınızı ve tercihlerinizi yönetin</p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="workspace" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="workspace">Workspace</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          {/* Workspace Settings */}
          <TabsContent value="workspace" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Workspace Information
                </CardTitle>
                <CardDescription>
                  Basic information about your workspace
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="workspace-name">Workspace Name</Label>
                    <Input
                      id="workspace-name"
                      value={settings.workspace.name}
                      onChange={(e) => setSettings({
                        ...settings,
                        workspace: { ...settings.workspace, name: e.target.value }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="workspace-email">Email</Label>
                    <Input
                      id="workspace-email"
                      type="email"
                      value={settings.workspace.email}
                      onChange={(e) => setSettings({
                        ...settings,
                        workspace: { ...settings.workspace, email: e.target.value }
                      })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="workspace-phone">Phone</Label>
                    <Input
                      id="workspace-phone"
                      value={settings.workspace.phone}
                      onChange={(e) => setSettings({
                        ...settings,
                        workspace: { ...settings.workspace, phone: e.target.value }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="workspace-website">Website</Label>
                    <Input
                      id="workspace-website"
                      value={settings.workspace.website}
                      onChange={(e) => setSettings({
                        ...settings,
                        workspace: { ...settings.workspace, website: e.target.value }
                      })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select value={settings.workspace.timezone} onValueChange={(value) => 
                      setSettings({
                        ...settings,
                        workspace: { ...settings.workspace, timezone: value }
                      })
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/New_York">Eastern Time</SelectItem>
                        <SelectItem value="America/Chicago">Central Time</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                        <SelectItem value="Europe/London">London</SelectItem>
                        <SelectItem value="Europe/Paris">Paris</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={settings.workspace.currency} onValueChange={(value) => 
                      setSettings({
                        ...settings,
                        workspace: { ...settings.workspace, currency: value }
                      })
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                        <SelectItem value="GBP">GBP - British Pound</SelectItem>
                        <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                        <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Email Settings */}
          <TabsContent value="email" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="h-5 w-5 mr-2" />
                  Email Configuration
                </CardTitle>
                <CardDescription>
                  Configure your email sending preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="from-name">From Name</Label>
                    <Input
                      id="from-name"
                      value={settings.email.fromName}
                      onChange={(e) => setSettings({
                        ...settings,
                        email: { ...settings.email, fromName: e.target.value }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="from-email">From Email</Label>
                    <Input
                      id="from-email"
                      type="email"
                      value={settings.email.fromEmail}
                      onChange={(e) => setSettings({
                        ...settings,
                        email: { ...settings.email, fromEmail: e.target.value }
                      })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reply-to">Reply-To Email</Label>
                  <Input
                    id="reply-to"
                    type="email"
                    value={settings.email.replyTo}
                    onChange={(e) => setSettings({
                      ...settings,
                      email: { ...settings.email, replyTo: e.target.value }
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signature">Email Signature</Label>
                  <Textarea
                    id="signature"
                    value={settings.email.signature}
                    onChange={(e) => setSettings({
                      ...settings,
                      email: { ...settings.email, signature: e.target.value }
                    })}
                    rows={4}
                    placeholder="Enter your email signature..."
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Settings */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Choose what notifications you want to receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Payment Reminders</Label>
                      <p className="text-sm text-gray-600">Get notified about upcoming and overdue payments</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notifications.paymentReminders}
                      onChange={(e) => setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, paymentReminders: e.target.checked }
                      })}
                      className="h-4 w-4 text-blue-600"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Change Requests</Label>
                      <p className="text-sm text-gray-600">Get notified when clients request changes</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notifications.changeRequests}
                      onChange={(e) => setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, changeRequests: e.target.checked }
                      })}
                      className="h-4 w-4 text-blue-600"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Contract Updates</Label>
                      <p className="text-sm text-gray-600">Get notified about contract status changes</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notifications.contractUpdates}
                      onChange={(e) => setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, contractUpdates: e.target.checked }
                      })}
                      className="h-4 w-4 text-blue-600"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email-frequency">Email Frequency</Label>
                  <Select value={settings.notifications.emailFrequency} onValueChange={(value) => 
                    setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, emailFrequency: value }
                    })
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate</SelectItem>
                      <SelectItem value="daily">Daily Digest</SelectItem>
                      <SelectItem value="weekly">Weekly Digest</SelectItem>
                      <SelectItem value="never">Never</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Settings */}
          <TabsContent value="billing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Billing Information
                </CardTitle>
                <CardDescription>
                  Manage your subscription and payment methods
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-base font-medium">Current Plan</Label>
                    <p className="text-2xl font-bold text-blue-600">{settings.billing.plan}</p>
                    <p className="text-sm text-gray-600">Next billing: {settings.billing.nextBilling}</p>
                  </div>
                  <div>
                    <Label className="text-base font-medium">Payment Method</Label>
                    <p className="text-lg font-medium">{settings.billing.paymentMethod}</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Update Payment Method
                    </Button>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button variant="outline" className="mr-2">
                    Upgrade Plan
                  </Button>
                  <Button variant="outline">
                    Billing History
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Security Settings
                </CardTitle>
                <CardDescription>
                  Manage your account security and privacy
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-medium">Change Password</Label>
                    <p className="text-sm text-gray-600 mb-2">Update your account password</p>
                    <Button variant="outline">
                      Change Password
                    </Button>
                  </div>

                  <div>
                    <Label className="text-base font-medium">Two-Factor Authentication</Label>
                    <p className="text-sm text-gray-600 mb-2">Add an extra layer of security to your account</p>
                    <Button variant="outline">
                      Enable 2FA
                    </Button>
                  </div>

                  <div>
                    <Label className="text-base font-medium">API Keys</Label>
                    <p className="text-sm text-gray-600 mb-2">Manage your API keys for integrations</p>
                    <Button variant="outline">
                      Manage API Keys
                    </Button>
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
