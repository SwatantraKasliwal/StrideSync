"use client";

import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { ConnectionStatus } from './dashboard';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  description: string;
  status: ConnectionStatus;
}

export default function StatCard({ title, value, icon, description, status }: StatCardProps) {
  const isLoading = status !== 'connected';

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {isLoading ? (
            <Skeleton className="h-10 w-3/4 mt-1" />
        ) : (
            <div className="text-3xl font-bold text-primary">{value}</div>
        )}
        <p className="text-xs text-muted-foreground pt-1">{description}</p>
      </CardContent>
    </Card>
  );
}
