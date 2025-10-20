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
import GoogleSignIn from "./google-signin";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  bluetoothService,
  type StrideData,
  type BluetoothDeviceInfo,
  type ConnectionStatus,
} from "@/lib/bluetooth-service";
import {
  googleFitService,
  type GoogleFitAuth,
  type GoogleFitHistoryData,
} from "@/lib/google-fit-service";

export type { ConnectionStatus } from "@/lib/bluetooth-service";

export default function Dashboard() {
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [steps, setSteps] = useState(0);
  const [currentPower, setCurrentPower] = useState(0);
  const [powerHistory, setPowerHistory] = useState<
    { time: string; power: number }[]
  >([]);
  const [isBuzzerEnabled, setBuzzerEnabled] = useState(false); // User's toggle setting
  const [isBuzzerActive, setBuzzerActive] = useState(false); // Currently beeping (from device)
  const [connectedDevice, setConnectedDevice] =
    useState<BluetoothDeviceInfo | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [sessionDuration, setSessionDuration] = useState<string>("00:00:00");
  const [googleFitAuth, setGoogleFitAuth] = useState<GoogleFitAuth>({
    isAuthenticated: false,
    user: null,
  });
  const [useGoogleFit, setUseGoogleFit] = useState(false);
  const [googleFitSteps, setGoogleFitSteps] = useState(0);
  const [showGoogleSignIn, setShowGoogleSignIn] = useState(false);
  const [activityLog, setActivityLog] = useState<
    Array<{ date: string; steps: number; power: string }>
  >([
    { date: "Yesterday", steps: 0, power: "0.0 kWh" },
    { date: "2 days ago", steps: 0, power: "0.0 kWh" },
    { date: "3 days ago", steps: 0, power: "0.0 kWh" },
  ]);
  const { toast } = useToast();

  const averagePower = useMemo(() => {
    if (powerHistory.length === 0) return 0;
    const total = powerHistory.reduce((acc, curr) => acc + curr.power, 0);
    return total / powerHistory.length;
  }, [powerHistory]);

  // Setup Bluetooth service callbacks and try to recover connection on page load
  useEffect(() => {
    // Try to recover existing connection first (for page refresh)
    const attemptRecovery = async () => {
      try {
        const recovered = await (
          bluetoothService as any
        ).tryRecoverConnection?.();
        if (recovered) {
          console.log("🔄 Dashboard: Connection recovered after page refresh");
        }
      } catch (error) {
        console.log("Dashboard: No connection to recover");
      }
    };

    attemptRecovery();

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
        // Don't reset data immediately - might be a temporary disconnection
        setTimeout(() => {
          if (status === "disconnected") {
            setSteps(0);
            setCurrentPower(0);
            setPowerHistory([]);
            setBuzzerEnabled(false);
            setBuzzerActive(false);
          }
        }, 2000);
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
      // Use Google Fit steps if enabled, otherwise use device steps
      if (!useGoogleFit) {
        setSteps(data.steps);
      }
      setCurrentPower(data.power);

      // Update ONLY the active state (currently beeping), NOT the enabled setting
      setBuzzerActive(data.buzzerActive);

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
        useGoogleFit ? googleFitSteps : data.steps,
        "power:",
        data.power
      );
    });

    // Don't cleanup on unmount - keep connection alive for navigation
    // Only cleanup when window closes or user explicitly disconnects
  }, [useGoogleFit, googleFitSteps]);

  // Google Fit step monitoring
  useEffect(() => {
    let cleanup: (() => void) | null = null;

    if (useGoogleFit && googleFitAuth.isAuthenticated) {
      // Start monitoring Google Fit steps
      cleanup = googleFitService.startStepMonitoring((steps) => {
        console.log("Dashboard: Google Fit steps updated:", steps);
        setGoogleFitSteps(steps);
        setSteps(steps);
      });
    }

    return () => {
      if (cleanup) cleanup();
    };
  }, [useGoogleFit, googleFitAuth.isAuthenticated]);

  // Fetch activity log from Google Fit
  useEffect(() => {
    const fetchActivityLog = async () => {
      if (googleFitAuth.isAuthenticated) {
        try {
          const historyData = await googleFitService.getHistoryData(3); // Get last 3 days

          // Helper function to format relative date
          const getRelativeDate = (daysAgo: number) => {
            if (daysAgo === 1) return "Yesterday";
            return `${daysAgo} days ago`;
          };

          // Convert history data to activity log format
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const formattedLog = historyData
            .map((data) => {
              const dataDate = new Date(data.date);
              dataDate.setHours(0, 0, 0, 0);

              const diffTime = today.getTime() - dataDate.getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

              // Calculate power from steps (approximate: 1000 steps ≈ 0.1 kWh)
              const powerKwh = (data.steps / 1000) * 0.1;

              return {
                date: getRelativeDate(diffDays),
                steps: data.steps,
                power: `${powerKwh.toFixed(1)} kWh`,
                daysAgo: diffDays,
              };
            })
            .filter((log) => log.daysAgo > 0 && log.daysAgo <= 3) // Only show yesterday, 2 days ago, 3 days ago
            .sort((a, b) => a.daysAgo - b.daysAgo) // Sort by most recent first
            .slice(0, 3); // Ensure only 3 entries

          if (formattedLog.length > 0) {
            setActivityLog(
              formattedLog.map(({ date, steps, power }) => ({
                date,
                steps,
                power,
              }))
            );
          }
        } catch (error) {
          console.error("Failed to fetch activity log:", error);
        }
      }
    };

    fetchActivityLog();
  }, [googleFitAuth.isAuthenticated]);

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
    console.log(
      `🔊 Dashboard: handleBuzzerToggle called with enabled=${enabled}`
    );

    if (status === "connected") {
      try {
        console.log(`🔊 Dashboard: Sending buzzer command to device...`);

        // Update UI immediately (optimistic update)
        setBuzzerEnabled(enabled);

        // Send command to device
        await bluetoothService.setBuzzer(enabled);

        toast({
          title: enabled ? "🔊 Buzzer Enabled" : "🔇 Buzzer Disabled",
          description: enabled
            ? "Buzzer will activate when obstacle is detected (< 20cm)"
            : "Buzzer has been disabled",
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to update buzzer";

        // Revert UI on error
        setBuzzerEnabled(!enabled);

        toast({
          title: "❌ Buzzer Control Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } else {
      // Not connected - just show a message
      toast({
        title: "⚠️ Device Not Connected",
        description: "Please connect to your StrideSync device first",
        variant: "destructive",
      });
    }
  };

  // Handle Google Fit authentication
  const handleGoogleFitAuth = () => {
    setShowGoogleSignIn(true);
  };

  // Handle successful Google Sign-In
  const handleGoogleSignInSuccess = (user: { email: string; name: string }) => {
    // Get the access token from window
    const accessToken = (window as any).__googleFitAccessToken;
    if (accessToken) {
      googleFitService.setAccessToken(accessToken);
    }

    setGoogleFitAuth({
      isAuthenticated: true,
      user,
    });
    setUseGoogleFit(true);
    setShowGoogleSignIn(false);

    toast({
      title: "✅ Google Fit Connected!",
      description: `Signed in as ${user.email}. Step tracking is now synced with Google Fit.`,
      duration: 5000,
    });
  };

  // Handle Google Sign-In error
  const handleGoogleSignInError = (error: string) => {
    toast({
      title: "❌ Google Fit Authentication Failed",
      description: error,
      variant: "destructive",
    });
  };

  // Handle Google Fit sign out
  const handleGoogleFitSignOut = () => {
    googleFitService.signOut();
    setGoogleFitAuth({ isAuthenticated: false, user: null });
    setUseGoogleFit(false);
    setGoogleFitSteps(0);

    toast({
      title: "🔓 Signed out from Google Fit",
      description: "Step tracking switched back to device mode",
    });
  };

  // Comprehensive buzzer diagnostic function
  const handleBuzzerDiagnostic = async () => {
    if (status === "connected") {
      try {
        console.log("🧪 Dashboard: Running comprehensive buzzer diagnostic...");

        // Check if we're in simulation mode
        const isSimulating = (bluetoothService as any).isSimulating;
        console.log(`🔍 Dashboard: Simulation mode: ${isSimulating}`);

        if (isSimulating) {
          toast({
            title: "⚠️ Simulation Mode Detected",
            description:
              "You're connected to test mode, not real Arduino. Reconnect to 'HI TECH' device.",
            variant: "destructive",
          });
          return;
        }

        // Run sequence of test commands with proper delays
        console.log("🧪 Dashboard: Sending TEST command...");
        await bluetoothService.sendCommand("TEST");

        // Wait for TEST command to complete
        await new Promise((resolve) => setTimeout(resolve, 2000));

        console.log("🧪 Dashboard: Sending BUZZER_ON command...");
        await bluetoothService.setBuzzer(true);

        // Wait for BUZZER_ON command to complete
        await new Promise((resolve) => setTimeout(resolve, 3000));

        console.log("🧪 Dashboard: Sending BUZZER_OFF command...");
        await bluetoothService.setBuzzer(false);

        toast({
          title: "🧪 Diagnostic Complete",
          description:
            "Test commands sent. Check Arduino Serial Monitor and console logs.",
        });
      } catch (error) {
        console.error("❌ Dashboard: Diagnostic failed:", error);
        toast({
          title: "Diagnostic Failed",
          description:
            error instanceof Error ? error.message : "Command failed",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Not Connected",
        description: "Please connect to a device first",
        variant: "destructive",
      });
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
      <div className="flex gap-2 flex-col sm:flex-row">
        <Button
          onClick={handleBuzzerDiagnostic}
          variant="secondary"
          size="sm"
          className="w-full sm:w-auto"
        >
          🧪 Test Buzzer
        </Button>
        <Button
          onClick={handleDisconnect}
          variant="outline"
          size="sm"
          className="w-full sm:w-auto"
        >
          <BluetoothOff className="mr-2 h-4 w-4" />
          Disconnect
        </Button>
      </div>
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
          {googleFitAuth.isAuthenticated ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleGoogleFitSignOut}
              className="w-full sm:w-auto"
            >
              <span className="mr-2">📊</span>
              {googleFitAuth.user?.email || "Google Fit"}
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleGoogleFitAuth}
              className="w-full sm:w-auto"
            >
              <span className="mr-2">📊</span>
              Connect Google Fit
            </Button>
          )}
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
            description={
              useGoogleFit && googleFitAuth.isAuthenticated
                ? "Synced with Google Fit"
                : "Total steps in this session"
            }
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
                  disabled={status !== "connected"}
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
                    {isBuzzerActive ? (
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

      {/* Google Sign-In Dialog */}
      <Dialog open={showGoogleSignIn} onOpenChange={setShowGoogleSignIn}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connect Google Fit</DialogTitle>
            <DialogDescription>
              Sign in with your Google account to access your fitness data
            </DialogDescription>
          </DialogHeader>
          <GoogleSignIn
            onSuccess={handleGoogleSignInSuccess}
            onError={handleGoogleSignInError}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
