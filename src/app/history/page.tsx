"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft } from 'lucide-react';

// Mock historical data, this would be fetched from Firebase
const historicalData = [
    { date: '2025-09-15', total_steps: 10234, total_power: 1.2 },
    { date: '2025-09-14', total_steps: 8765, total_power: 0.9 },
    { date: '2025-09-13', total_steps: 12098, total_power: 1.5 },
    { date: '2025-09-12', total_steps: 7543, total_power: 0.8 },
    { date: '2025-09-11', total_steps: 11201, total_power: 1.3 },
];

export default function HistoryPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-4 border-b bg-background/95 px-4 backdrop-blur md:px-8">
        <div className="flex items-center gap-4">
            <Link href="/" passHref>
                <Button variant="outline" size="icon">
                    <ArrowLeft className="h-4 w-4" />
                </Button>
            </Link>
            <h1 className="text-2xl font-extrabold tracking-tight lg:text-3xl">
                Activity <span className="text-primary">History</span>
            </h1>
        </div>
      </header>
      <main className="flex-1 space-y-8 p-4 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle>Your Past Activity</CardTitle>
            <CardDescription>
              A log of your total steps and power generated each day.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Total Steps</TableHead>
                  <TableHead className="text-right">Total Power (kWh)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historicalData.map((data) => (
                  <TableRow key={data.date}>
                    <TableCell className="font-medium">{data.date}</TableCell>
                    <TableCell>{data.total_steps.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{data.total_power.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
