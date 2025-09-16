"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Bluetooth, BluetoothConnected, BluetoothOff, Footprints, Zap, Bell, LoaderCircle, History, CircleDot, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import PowerChart from './power-chart';
import StatCard from './stat-card';
import { useToast } from "@/hooks/use-toast";

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';

const activityLog = [
  { date: 'Yesterday', steps: 10234, power: '1.2 kWh' },
  { date: '2 days ago', steps: 8765, power: '0.9 kWh' },
  { date: '3 days ago', steps: 12098, power: '1.5 kWh' },
];

export default function Dashboard() {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [steps, setSteps] = useState(0);
  const [currentPower, setCurrentPower] = useState(0);
  const [powerHistory, setPowerHistory] = useState<{ time: string; power: number }[]>([]);
  const [isBuzzerOn, setBuzzerOn] = useState(false);
  const { toast } = useToast();

  const averagePower = useMemo(() => {
    if (powerHistory.length === 0) return 0;
    const total = powerHistory.reduce((acc, curr) => acc + curr.power, 0);
    return total / powerHistory.length;
  }, [powerHistory]);

  const handleConnect = () => {
    setStatus('connecting');
    // Mocking connection to a BLE device
    setTimeout(() => {
      setStatus('connected');
      setSteps(0);
      setCurrentPower(0);
      setPowerHistory([]);
      toast({
        title: "Connection Successful",
        description: "Your StrideSync Shoe is now connected.",
      });
    }, 2000);
  };

  const handleDisconnect = () => {
    // Here you would also log the day's data
    setStatus('disconnected');
    toast({
      title: "Disconnected",
      description: "Your StrideSync Shoe has been disconnected.",
    });
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined = undefined;
    if (status === 'connected') {
      // Mock receiving data from BLE device
      interval = setInterval(() => {
        setSteps(prev => prev + Math.floor(Math.random() * 3) + 1);
        const newPower = parseFloat((Math.random() * 1.5 + 0.1).toFixed(2));
        setCurrentPower(newPower);
        
        // Mock buzzer status changing based on "object detection"
        setBuzzerOn(Math.random() > 0.8); 

        setPowerHistory(prev => {
            const now = new Date();
            const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            const newEntry = { time, power: newPower };
            const newHistory = [...prev, newEntry];
            return newHistory.length > 30 ? newHistory.slice(1) : newHistory;
        });
      }, 1500);
    } else {
        setBuzzerOn(false);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [status]);
  
  const ConnectionButton = () => (
    status === 'connected' ? (
      <Button onClick={handleDisconnect} variant="outline" size="sm">
        <BluetoothOff className="mr-2 h-4 w-4" />
        Disconnect
      </Button>
    ) : (
      <Button onClick={handleConnect} disabled={status === 'connecting'} size="sm">
        {status === 'connecting' ? (
          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Bluetooth className="mr-2 h-4 w-4" />
        )}
        Connect Shoe
      </Button>
    )
  );
  
  const StatusIndicator = () => {
    switch (status) {
      case 'connected':
        return <div className="flex items-center gap-2 text-sm font-medium text-primary"><BluetoothConnected className="h-4 w-4" />Connected</div>;
      case 'connecting':
        return <div className="flex items-center gap-2 text-sm text-muted-foreground"><LoaderCircle className="h-4 w-4 animate-spin" />Connecting...</div>;
      default:
        return <div className="flex items-center gap-2 text-sm text-muted-foreground"><BluetoothOff className="h-4 w-4" />Disconnected</div>;
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-4 border-b bg-background/95 px-4 backdrop-blur md:px-8">
        <h1 className="text-2xl font-extrabold tracking-tight lg:text-3xl">
          Stride<span className="text-primary">Sync</span>
        </h1>
        <div className="flex items-center gap-4">
          <Link href="/history">
            <Button variant="ghost" size="sm">
              <History className="mr-2 h-4 w-4" />
              History
            </Button>
          </Link>
          <StatusIndicator />
          <ConnectionButton />
        </div>
      </header>
      <main className="flex-1 space-y-8 p-4 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <StatCard
                title="Real-time Steps"
                value={steps.toLocaleString()}
                icon={<Footprints className="h-5 w-5 text-muted-foreground" />}
                description="Total steps in this session"
                status={status}
            />
            <StatCard
                title="Current Power"
                value={`${currentPower.toFixed(2)} W`}
                icon={<Zap className="h-5 w-5 text-muted-foreground" />}
                description="Instantaneous power generation"
                status={status}
            />
            <StatCard
                title="Average Power"
                value={`${averagePower.toFixed(2)} W`}
                icon={<Zap className="h-5 w-5 text-muted-foreground" />}
                description="Avg. power this session"
                status={status}
            />
        </div>
        
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader className="pb-4 flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Live Session Data</CardTitle>
                    <CardDescription>Real-time power generation from your shoe.</CardDescription>
                </div>
                <div className="flex items-center space-x-3 rounded-lg border p-3">
                    <Bell className="h-5 w-5" />
                    <Label htmlFor="buzzer-status" className="font-medium text-sm">
                      Object Detection
                    </Label>
                    <div id="buzzer-status" className="flex items-center gap-2">
                        {isBuzzerOn ? (
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-accent"></span>
                            </span>
                        ) : (
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-muted"></span>
                        )}
                        <span className="text-xs text-muted-foreground">{isBuzzerOn ? "Active" : "Inactive"}</span>
                    </div>
                </div>
              </CardHeader>
              <CardContent>
                <PowerChart data={powerHistory} status={status} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Today's Activity Log</CardTitle>
                <CardDescription>Summary of your recent sessions.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Steps</TableHead>
                      <TableHead className="text-right">Power</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activityLog.map((log) => (
                      <TableRow key={log.date}>
                        <TableCell className="font-medium">{log.date}</TableCell>
                        <TableCell>{log.steps.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{log.power}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}

    