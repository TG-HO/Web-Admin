'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/utils';

export default function NotificationsPage() {
  const notifications = [
    {
      id: '1',
      type: 'Report Threshold',
      title: 'Survey #123 reached 2 reports',
      message: 'Survey "Best Products" has received 2 reports',
      priority: 'high',
      read: false,
      date: new Date().toISOString(),
    },
    {
      id: '2',
      type: 'Withdrawal Request',
      title: 'New withdrawal request',
      message: 'User john_doe requested $500 withdrawal',
      priority: 'medium',
      read: false,
      date: new Date().toISOString(),
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">Manage platform alerts and notifications.</p>
        </div>

        {/* Notifications List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Alert Center</CardTitle>
                <CardDescription>Real-time platform alerts</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Mark All as Read</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`flex items-start justify-between p-4 rounded-lg border ${
                    notif.read ? 'bg-muted/50' : 'bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-900/30'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-sm">{notif.title}</h3>
                      <Badge
                        variant={notif.priority === 'high' ? 'default' : 'secondary'}
                        className={
                          notif.priority === 'high'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/20'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20'
                        }
                      >
                        {notif.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{notif.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{formatDate(notif.date)}</p>
                  </div>
                  <Button variant="ghost" size="sm">View</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
