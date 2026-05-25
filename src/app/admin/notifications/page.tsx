'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/utils';
import { useNotifications } from '@/hooks/useQueries';
import { useAuthStore } from '@/store/auth';

export default function NotificationsPage() {
  const { user } = useAuthStore();
  const { data: notifications = [], isLoading } = useNotifications(user?.id);

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
            {isLoading ? (
              <div className="flex items-center justify-center h-48">
                <div className="animate-spin">
                  <div className="h-8 w-8 rounded-full border-4 border-muted border-t-orange-500" />
                </div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No notifications available yet.
              </div>
            ) : (
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
                      <p className="text-xs text-muted-foreground mt-1">{formatDate(notif.created_at)}</p>
                    </div>
                    <Button variant="ghost" size="sm">View</Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
