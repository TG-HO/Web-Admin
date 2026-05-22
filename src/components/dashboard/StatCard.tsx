'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, FileText, AlertCircle } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  description?: string;
}

export function StatCard({ title, value, icon, trend, description }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-orange-500">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend !== undefined && (
          <p className={`text-xs font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp className="mr-1 inline h-3 w-3" />
            {trend > 0 ? '+' : ''}{trend}% from last month
          </p>
        )}
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  );
}
