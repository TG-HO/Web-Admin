'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatCurrency } from '@/utils';
import { Search } from 'lucide-react';

export default function PaymentsPage() {
  const transactions = [
    { id: '1', user: 'John Doe', amount: 500, type: 'credit', status: 'completed', date: new Date().toISOString() },
    { id: '2', user: 'Jane Smith', amount: 250, type: 'debit', status: 'pending', date: new Date().toISOString() },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payment Management</h1>
          <p className="text-muted-foreground">Manage transactions, withdrawals, and revenue.</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">$45,231.89</p>
              <p className="text-xs text-muted-foreground">+20.1% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending Withdrawals</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">$8,500</p>
              <p className="text-xs text-muted-foreground">12 pending requests</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Platform Fees</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">$4,523</p>
              <p className="text-xs text-muted-foreground">10% of revenue</p>
            </CardContent>
          </Card>
        </div>

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>{tx.user}</TableCell>
                    <TableCell>{formatCurrency(tx.amount)}</TableCell>
                    <TableCell>
                      <Badge variant={tx.type === 'credit' ? 'default' : 'outline'}>
                        {tx.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={tx.status === 'completed' ? 'default' : 'outline'}>
                        {tx.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(tx.date)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
