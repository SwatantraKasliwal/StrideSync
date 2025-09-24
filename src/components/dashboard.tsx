"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Bluetooth,
  BluetoothConnected,
  BluetoothOff,
  Footprints,
  Zap,
  Bell,
  LoaderCircle,
  History,
  CircleDot,
  Circle,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import PowerChart from "./power-chart";
import StatCard from "./stat-card";
import DeviceScanner from "./device-scanner";
import { useToast } from "@/hooks/use-toast";
import {
  bluetoothService,
  type StrideData,
  type BluetoothDeviceInfo,
  type ConnectionStatus,
} from "@/lib/bluetooth-service";

export type { ConnectionStatus } from "@/lib/bluetooth-service";

const activityLog = [
  { date: "Yesterday", steps: 10234, power: "1.2 kWh" },
  { date: "2 days ago", steps: 8765, power: "0.9 kWh" },
  { date: "3 days ago", steps: 12098, power: "1.5 kWh" },
];

export default function Dashboard() {
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [steps, setSteps] = useState(0);
  const [currentPower, setCurrentPower] = useState(0);
  const [powerHistory, setPowerHistory] = useState<
    { time: string; power: number }[]
  >([]);
  const [isBuzzerOn, setBuzzerOn] = useState(false);
  const [isBuzzerEnabled, setBuzzerEnabled] = useState(true);
  const [connectedDevice, setConnectedDevice] =
    useState<BluetoothDeviceInfo | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [sessionDuration, setSessionDuration] = useState<string>("00:00:00");
  const { toast } = useToast();

  const averagePower = useMemo(() => {
    if (powerHistory.length === 0) return 0;
    const total = powerHistory.reduce((acc, curr) => acc + curr.power, 0);
    return total / powerHistory.length;
  }, [powerHistory]);

  // Setup Bluetooth service callbacks
  useEffect(() => {
    bluetoothService.setStatusCallback((newStatus) => {
      console.log("Dashboard: Status callback received:", newStatus);
      setStatus(newStatus);

      if (newStatus === "connected") {
        setSessionStartTime(new Date());
        const deviceInfo = bluetoothService.getDeviceInfo();
        setConnectedDevice(deviceInfo);
        console.log("Dashboard: Device info:", deviceInfo);

        // Show connection success toast
        if (deviceInfo?.name === "Test StrideSync Device") {
          toast({
            title: "🎯 Test Mode Connected!",
            description:
              "Successfully connected to simulated StrideSync device. Test data is now streaming.",
            duration: 4000,
          });
        } else {
          toast({
            title: "✅ Device Connected!",
            description: `Successfully connected to ${
              deviceInfo?.name || "device"
            }. Ready to receive real-time data.`,
            duration: 4000,
          });
        }
      } else if (newStatus === "disconnected") {
        setConnectedDevice(null);
        setSessionStartTime(null);
        // Reset session data when disconnected
        setSteps(0);
        setCurrentPower(0);
        setPowerHistory([]);
        setBuzzerOn(false);
      } else if (newStatus === "error") {
        toast({
          title: "❌ Connection Failed",
          description: "Unable to connect to the device. Please try again.",
          variant: "destructive",
          duration: 5000,
        });
      }
    });

    bluetoothService.setDataCallback((data: StrideData) => {
      console.log("Dashboard: Received data from bluetooth service:", data);

      // Update real-time data from the device
      setSteps(data.steps);
      setCurrentPower(data.power);
      setBuzzerOn(data.buzzerActive);

      // Add to power history
      const now = new Date();
      const time = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      setPowerHistory((prev) => {
        const newEntry = { time, power: data.power };
        const newHistory = [...prev, newEntry];
        return newHistory.length > 30 ? newHistory.slice(1) : newHistory;
      });

      console.log(
        "Dashboard: Updated state - steps:",
        data.steps,
        "power:",
        data.power
      );
    });

    return () => {
      // Cleanup on unmount
      bluetoothService.setStatusCallback(() => {});
      bluetoothService.setDataCallback(() => {});
    };
  }, []);

  const handleDeviceSelected = async (device: BluetoothDeviceInfo) => {
    try {
      console.log(
        "Dashboard: Connecting to device:",
        device.name,
        "ID:",
        device.id
      );

      // Check if this is a test device
      if (device.id === "test-device-12345") {
        console.log(
          "Dashboard: Detected test device, calling connectTestDevice()"
        );
        await bluetoothService.connectTestDevice();
        console.log("Dashboard: Test device connection successful");
      } else {
        console.log(
          "Dashboard: Detected real device, first scanning then connecting"
        );
        // For real devices, we need to scan first to select the device
        // The device scanner component already does this, so we can directly connect
        // since the device should already be selected from the scan
        await bluetoothService.connect();
      }

      console.log("Dashboard: Connection call completed for", device.name);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Connection failed";
      console.error("Dashboard: Connection failed:", errorMessage);

      // The status callback will handle the error toast, but we can add additional info here
      console.log("Dashboard: Connection error details:", errorMessage);
    }
  };
  const handleDisconnect = async () => {
    try {
      const deviceName = connectedDevice?.name || "device";
      await bluetoothService.disconnect();
      toast({
        title: "🔌 Device Disconnected",
        description: `Successfully disconnected from ${deviceName}.`,
        duration: 3000,
      });
      console.log("Dashboard: Device disconnected successfully");
    } catch (error) {
      console.error("Dashboard: Disconnect error:", error);
      toast({
        title: "⚠️ Disconnect Error",
        description: "There was an issue disconnecting from the device.",
        variant: "destructive",
      });
    }
  };

  // Send buzzer command to the real device
  const handleBuzzerToggle = async (enabled: boolean) => {
    setBuzzerEnabled(enabled);

    if (status === "connected") {
      try {
        await bluetoothService.setBuzzer(enabled);
        toast({
          title: enabled ? "Buzzer Enabled" : "Buzzer Disabled",
          description: `Object detection buzzer is now ${
            enabled ? "active" : "inactive"
          }`,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to update buzzer";
        toast({
          title: "Buzzer Control Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    }
  };

  // Update buzzer state when device data changes (this happens automatically now via callback)
  // No more mock data generation - real data comes from Bluetooth device

  // Session timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;

    if (sessionStartTime && status === "connected") {
      interval = setInterval(() => {
        const elapsed = Date.now() - sessionStartTime.getTime();
        const hours = Math.floor(elapsed / 3600000);
        const minutes = Math.floor((elapsed % 3600000) / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);

        setSessionDuration(
          `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
        );
      }, 1000);
    } else {
      setSessionDuration("00:00:00");
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [sessionStartTime, status]);

  const ConnectionButton = () =>
    status === "connected" ? (
      <Button
        onClick={handleDisconnect}
        variant="outline"
        size="sm"
        className="w-full sm:w-auto"
      >
        <BluetoothOff className="mr-2 h-4 w-4" />
        Disconnect
      </Button>
    ) : (
      <DeviceScanner
        onDeviceSelected={handleDeviceSelected}
        disabled={status === "connecting"}
      />
    );

  const StatusIndicator = () => {
    switch (status) {
      case "connected":
        return (
          <div className="flex items-center justify-center gap-2 text-sm font-medium text-primary">
            <BluetoothConnected className="h-4 w-4" />
            <span>Connected</span>
            {connectedDevice && (
              <span className="text-xs text-muted-foreground">
                ({connectedDevice.name})
              </span>
            )}
          </div>
        );
      case "connecting":
        return (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <LoaderCircle className="h-4 w-4 animate-spin" />
            Connecting...
          </div>
        );
      case "error":
        return (
          <div className="flex items-center justify-center gap-2 text-sm text-destructive">
            <BluetoothOff className="h-4 w-4" />
            Connection Error
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <BluetoothOff className="h-4 w-4" />
            Disconnected
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-30 flex h-auto shrink-0 flex-col items-center justify-between gap-4 border-b bg-background/95 p-4 backdrop-blur sm:h-16 sm:flex-row sm:px-8">
        <h1 className="text-2xl font-extrabold tracking-tight text-center sm:text-left lg:text-3xl">
          Stride<span className="text-primary">Sync</span>
        </h1>
        <div className="flex w-full flex-col items-center gap-2 sm:w-auto sm:flex-row sm:gap-4">
          <Link href="/history" className="w-full sm:w-auto">
            <Button variant="ghost" size="sm" className="w-full">
              <History className="mr-2 h-4 w-4" />
              History
            </Button>
          </Link>
          <div className="w-full sm:w-auto">
            <StatusIndicator />
          </div>
          <ConnectionButton />
        </div>
      </header>
      <main className="flex-1 space-y-8 p-4 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
          <StatCard
            title="Session Time"
            value={sessionDuration}
            icon={<History className="h-5 w-5 text-muted-foreground" />}
            description="Current session duration"
            status={status}
          />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Live Session Data</CardTitle>
                <CardDescription>
                  Real-time power generation from your shoe.
                </CardDescription>
              </div>
              <div className="flex w-full sm:w-auto items-center justify-between sm:justify-start space-x-3 rounded-lg border p-3">
                <div className="flex items-center space-x-3">
                  <Bell className="h-5 w-5" />
                  <div className="flex flex-col space-y-1">
                    <Label
                      htmlFor="buzzer-control"
                      className="font-medium text-sm whitespace-nowrap"
                    >
                      Buzzer Active
                    </Label>
                  </div>
                </div>
                <Switch
                  id="buzzer-control"
                  checked={isBuzzerEnabled}
                  onCheckedChange={handleBuzzerToggle}
                  aria-label="Toggle buzzer"
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {status === "disconnected" && (
                <div className="text-center py-8 border-2 border-dashed border-blue-200 bg-blue-50/50 rounded-lg">
                  <Bluetooth className="h-12 w-12 mx-auto text-blue-600 mb-4" />
                  <p className="text-lg font-medium mb-2 text-blue-900">
                    🔗 Connect Your StrideSync Device
                  </p>
                  <p className="text-sm text-blue-700 mb-4">
                    Ready to connect! Scan for your smart shoe or use test mode
                    to start tracking your activity and power generation.
                  </p>
                  <DeviceScanner
                    onDeviceSelected={handleDeviceSelected}
                    disabled={false}
                  />
                  <p className="text-xs text-blue-600 mt-3">
                    💡 <strong>Quick tip:</strong> Use "Test Mode" for instant
                    demo data!
                  </p>
                </div>
              )}

              {status === "connecting" && (
                <div className="text-center py-8 border-2 border-dashed border-yellow-200 bg-yellow-50/50 rounded-lg">
                  <LoaderCircle className="h-12 w-12 mx-auto text-yellow-600 animate-spin mb-4" />
                  <p className="text-lg font-medium mb-2 text-yellow-900">
                    🔄 Connecting to Device
                  </p>
                  <p className="text-sm text-yellow-700 mb-2">
                    Establishing connection with your StrideSync device...
                  </p>
                  <p className="text-xs text-yellow-600">
                    This may take a few seconds. Please wait...
                  </p>
                </div>
              )}

              {status === "error" && (
                <div className="text-center py-8 border-2 border-dashed border-destructive/50 bg-destructive/5 rounded-lg">
                  <BluetoothOff className="h-12 w-12 mx-auto text-destructive mb-4" />
                  <p className="text-lg font-medium mb-2 text-destructive">
                    Connection Failed
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Unable to connect to your StrideSync device. Please try
                    again.
                  </p>
                  <DeviceScanner
                    onDeviceSelected={handleDeviceSelected}
                    disabled={false}
                  />
                </div>
              )}

              {status === "connected" && (
                <>
                  {/* Connection Success Banner */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-green-800">
                          ✅ Successfully Connected!
                        </p>
                        <p className="text-sm text-green-700">
                          {connectedDevice?.name || "Your device"} is now
                          streaming real-time data.
                          {sessionStartTime && (
                            <span className="ml-2">
                              Connected for {sessionDuration}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">
                      Object Detection:
                    </span>
                    {isBuzzerOn ? (
                      <div className="flex items-center gap-2 text-accent">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-accent"></span>
                        </span>
                        Active
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Circle className="h-3 w-3 fill-muted text-muted" />
                        Inactive
                      </div>
                    )}
                  </div>
                  <PowerChart data={powerHistory} status={status} />
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Today's Activity Log</CardTitle>
              <CardDescription>
                Summary of your recent sessions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="block md:hidden">
                {activityLog.map((log) => (
                  <div
                    key={log.date}
                    className="mb-4 rounded-lg border p-4 text-sm"
                  >
                    <div className="flex justify-between font-medium">
                      {log.date}
                    </div>
                    <div className="mt-2 flex justify-between">
                      <span className="text-muted-foreground">Steps:</span>
                      <span>{log.steps.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Power:</span>
                      <span className="text-right">{log.power}</span>
                    </div>
                  </div>
                ))}
              </div>
              <Table className="hidden md:table">
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
