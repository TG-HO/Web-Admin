'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/auth';
import { useAdminUser, useUpdateAdminUserMutation } from '@/hooks/useQueries';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const { data: adminUser, isLoading: isAdminLoading } = useAdminUser(user?.id);
  const updateAdminUserMutation = useUpdateAdminUserMutation();
  const [platformName, setPlatformName] = useState('Survey Platform');
  const [currency, setCurrency] = useState('USD');
  const [stripeKey, setStripeKey] = useState('');
  const [platformFee, setPlatformFee] = useState('10');
  const [reportThreshold, setReportThreshold] = useState('2');
  const [suspensionThreshold, setSuspensionThreshold] = useState('3');

  useEffect(() => {
    if (adminUser?.full_name) {
      setPlatformName(adminUser.full_name);
    }
  }, [adminUser]);

  useEffect(() => {
    const savedSettings = typeof window !== 'undefined' ? localStorage.getItem('platform-settings') : null;
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setCurrency(parsed.currency || 'USD');
      setStripeKey(parsed.stripeKey || '');
      setPlatformFee(parsed.platformFee || '10');
      setReportThreshold(parsed.reportThreshold || '2');
      setSuspensionThreshold(parsed.suspensionThreshold || '3');
    }
  }, []);

  const handleSaveProfile = () => {
    if (!user?.id) {
      toast.error('Unable to update profile without a valid admin session.');
      return;
    }

    updateAdminUserMutation.mutate(
      { userId: user.id, data: { full_name: platformName } },
      {
        onSuccess: () => {
          toast.success('Admin name updated successfully.');
        },
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : 'Unable to update admin profile.');
        },
      }
    );
  };

  const handleSaveSettings = () => {
    if (typeof window === 'undefined') return;

    localStorage.setItem(
      'platform-settings',
      JSON.stringify({ currency, stripeKey, platformFee, reportThreshold, suspensionThreshold })
    );
    toast.success('Platform settings saved locally.');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage platform configuration and preferences.</p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="moderation">Moderation</TabsTrigger>
            <TabsTrigger value="payment">Payment</TabsTrigger>
            <TabsTrigger value="admin">Admin</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Platform Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Platform Name</Label>
                  <Input
                    id="name"
                    value={platformName}
                    onChange={(e) => setPlatformName(e.target.value)}
                    disabled={isAdminLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                  />
                </div>
                <Button onClick={handleSaveProfile}>Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Moderation Settings */}
          <TabsContent value="moderation" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Moderation Rules</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="report-threshold">Reports for Admin Notification</Label>
                  <Input
                    id="report-threshold"
                    type="number"
                    value={reportThreshold}
                    onChange={(e) => setReportThreshold(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">Admin notified after this many reports</p>
                </div>
                <div>
                  <Label htmlFor="suspension-threshold">Auto Suspension Threshold</Label>
                  <Input
                    id="suspension-threshold"
                    type="number"
                    value={suspensionThreshold}
                    onChange={(e) => setSuspensionThreshold(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">User auto-suspended after this many reports</p>
                </div>
                <Button onClick={handleSaveSettings}>Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Settings */}
          <TabsContent value="payment" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Payment Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="stripe-key">Stripe Public Key</Label>
                  <Input
                    id="stripe-key"
                    type="password"
                    placeholder="pk_live_..."
                    value={stripeKey}
                    onChange={(e) => setStripeKey(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="platform-fee">Platform Fee (%)</Label>
                  <Input
                    id="platform-fee"
                    type="number"
                    value={platformFee}
                    step="0.1"
                    onChange={(e) => setPlatformFee(e.target.value)}
                  />
                </div>
                <Button onClick={handleSaveSettings}>Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admin Management */}
          <TabsContent value="admin" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Admin Users</CardTitle>
                <CardDescription>Manage admin access and permissions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={() => toast('Feature not available yet')}>Add Admin User</Button>
                <div className="space-y-2">
                  {adminUser ? (
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{adminUser.full_name}</p>
                        <p className="text-sm text-muted-foreground">{adminUser.email}</p>
                      </div>
                      <p className="text-sm font-medium">{adminUser.role}</p>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">Loading admin information...</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
