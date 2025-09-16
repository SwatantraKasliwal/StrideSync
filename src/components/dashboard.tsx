"use client";

import { useState, useEffect } from 'react';
import { Bluetooth, BluetoothConnected, BluetoothOff, Footprints, Zap, Bell, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
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

  const handleConnect = () => {
    setStatus('connecting');
    toast({
      title: "Scanning for devices...",
      description: "Attempting to connect to StrideSync Shoe.",
    });
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
    setStatus('disconnected');
    toast({
      title: "Disconnected",
      description: "Your StrideSync Shoe has been disconnected.",
    });
  };

  const toggleBuzzer = (checked: boolean) => {
    if (status !== 'connected') {
        toast({
            title: "Device not connected",
            description: "Please connect to your shoe to control the buzzer.",
            variant: "destructive",
        });
        return;
    }
    setBuzzerOn(checked);
    toast({
        title: `Buzzer ${checked ? 'Activated' : 'Deactivated'}`,
        description: `The buzzer on your shoe has been turned ${checked ? 'on' : 'off'}.`,
    });
  }

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined = undefined;
    if (status === 'connected') {
      interval = setInterval(() => {
        setSteps(prev => prev + Math.floor(Math.random() * 3) + 1);
        const newPower = parseFloat((Math.random() * 1.5 + 0.1).toFixed(2));
        setCurrentPower(newPower);
        setPowerHistory(prev => {
            const now = new Date();
            const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            const newEntry = { time, power: newPower };
            const newHistory = [...prev, newEntry];
            return newHistory.length > 30 ? newHistory.slice(1) : newHistory;
        });
      }, 1500);
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
          <StatusIndicator />
          <ConnectionButton />
        </div>
      </header>
      <main className="flex-1 space-y-8 p-4 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
                title="Real-time Steps"
                value={steps.toLocaleString()}
                icon={<Footprints className="h-5 w-5 text-muted-foreground" />}
                description="Total steps taken in this session"
                status={status}
            />
            <StatCard
                title="Current Power"
                value={`${currentPower.toFixed(2)} W`}
                icon={<Zap className="h-5 w-5 text-muted-foreground" />}
                description="Instantaneous power generation"
                status={status}
            />
             <Card className="lg:col-span-2">
              <CardHeader className="pb-4">
                <CardTitle>Device Controls</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center space-x-3">
                    <Bell className="h-5 w-5" />
                    <Label htmlFor="buzzer-switch" className="font-medium text-sm">
                      Find My Shoe Buzzer
                    </Label>
                  </div>
                  <Switch
                    id="buzzer-switch"
                    checked={isBuzzerOn}
                    onCheckedChange={toggleBuzzer}
                    aria-label="Toggle shoe buzzer"
                  />
                </div>
              </CardContent>
            </Card>
        </div>
        
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Power Generation History</CardTitle>
                <CardDescription>Real-time energy harvested from your steps, in Watts (W).</CardDescription>
              </CardHeader>
              <CardContent>
                <PowerChart data={powerHistory} status={status} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Daily Activity Log</CardTitle>
                <CardDescription>Summary of your past activities.</CardDescription>
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
