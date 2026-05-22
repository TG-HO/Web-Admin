'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';

export default function SettingsPage() {
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
                  <Input id="name" defaultValue="Survey Platform" />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Input id="currency" defaultValue="USD" />
                </div>
                <Button>Save Changes</Button>
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
                  <Input id="report-threshold" type="number" defaultValue="2" />
                  <p className="text-sm text-muted-foreground">Admin notified after this many reports</p>
                </div>
                <div>
                  <Label htmlFor="suspension-threshold">Auto Suspension Threshold</Label>
                  <Input id="suspension-threshold" type="number" defaultValue="3" />
                  <p className="text-sm text-muted-foreground">User auto-suspended after this many reports</p>
                </div>
                <Button>Save Changes</Button>
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
                  <Input id="stripe-key" type="password" placeholder="pk_live_..." />
                </div>
                <div>
                  <Label htmlFor="platform-fee">Platform Fee (%)</Label>
                  <Input id="platform-fee" type="number" defaultValue="10" step="0.1" />
                </div>
                <Button>Save Changes</Button>
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
                <Button>Add Admin User</Button>
                <div className="space-y-2">
                  {[
                    { name: 'Admin User', role: 'Super Admin', email: 'admin@survey.app' },
                  ].map((admin, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{admin.name}</p>
                        <p className="text-sm text-muted-foreground">{admin.email}</p>
                      </div>
                      <p className="text-sm font-medium">{admin.role}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
